import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, AlertTriangle, Loader2, Smartphone, Info, ShieldCheck, Stethoscope } from 'lucide-react';
import { convertBlobToWav } from '../utils/wavEncoder';

export default function AudioRecordModal({
  isOpen,
  onClose,
  onProcessed,
  activeProfile = 'respiratory',
  activeAlgorithm = 'classical_dsp',
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    } else {
      // Draw idle standby waveform when modal opens
      drawIdleWaveform();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setRecordTime(0);
    setErrorMsg('');
  };

  const getBestSupportedMimeType = () => {
    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const t of candidateTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  const drawIdleWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let phase = 0;
    const renderIdle = () => {
      if (isRecording) return; // Yield to live VU meter when recording
      phase += 0.04;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Medical grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Gentle resting waveform
      ctx.strokeStyle = activeProfile === 'speech' ? '#0284C7' : '#0D9488';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.05 + phase) * 4 * Math.sin(x * 0.015);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(renderIdle);
    };

    renderIdle();
  };

  const startRecording = async () => {
    setErrorMsg('');
    audioChunksRef.current = [];
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    try {
      // Check for browser Secure Context requirement
      if (
        typeof window !== 'undefined' &&
        window.isSecureContext === false &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        setErrorMsg(
          'Trình duyệt bảo mật chặn Microphone khi truy cập qua IP Server (HTTP). Để bật trên Chrome/Edge: mở chrome://flags/#unsafely-treat-insecure-origin-as-secure -> dán URL http://' +
            window.location.host +
            ' -> chọn Enabled -> Relaunch trình duyệt.'
        );
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg(
          'Trình duyệt của bạn đang chặn API Microphone trên giao thức HTTP này. Vui lòng mở quyền mic trong cài đặt trình duyệt hoặc truy cập qua localhost.'
        );
        return;
      }

      // STRICT MEDICAL REQUIREMENT: Disable browser hardware DSP filters to preserve raw pathology
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // Setup Web Audio API Analyser for Live Oscilloscope / Spectrum
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Draw active VU Meter
      drawVUMeter();

      // Initialize MediaRecorder
      const mimeType = getBestSupportedMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        // Transcode client-side to standard 16-bit 16kHz PCM WAV for 100% backend compatibility
        const wavBlob = await convertBlobToWav(rawBlob);
        await handleUploadAndProcess(wavBlob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordTime(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordTime((Date.now() - startTime) / 1000);
      }, 100);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg(
          'Bạn đã chặn hoặc chưa cấp quyền Microphone. Hãy bấm vào biểu tượng ổ khóa / cài đặt trang web trên thanh địa chỉ URL của trình duyệt để chọn "Cho phép (Allow)" Microphone.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('Không tìm thấy thiết bị Microphone kết nối với máy tính.');
      } else {
        setErrorMsg(
          'Không thể truy cập Microphone: ' + (err.message || 'Vui lòng cấp quyền hoặc kiểm tra thiết bị kết nối.')
        );
      }
      drawIdleWaveform();
    }
  };

  const stopRecording = () => {
    if (recordTime < 1.0) {
      setErrorMsg('Thời lượng bản ghi quá ngắn (< 1.0 giây). Vui lòng ghi âm tối thiểu 1.0 giây để thuật toán phân tích chính xác.');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsSubmitting(true);
      mediaRecorderRef.current.stop();
    }
  };

  const drawVUMeter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid line
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 1);
      ctx.lineTo(canvas.width, canvas.height - 1);
      ctx.stroke();

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height - 4);
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#0284C7');
        grad.addColorStop(0.55, '#10B981');
        grad.addColorStop(0.85, '#F59E0B');
        grad.addColorStop(1, '#EF4444');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth + 1;
      }
    };
    render();
  };

  const handleUploadAndProcess = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, 'live_microphone_recording.wav');

      // 1. Upload audio
      const uploadRes = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.detail || 'Lỗi khi tải file ghi âm lên máy chủ');
      }

      const uploadData = await uploadRes.json();
      const audioId = uploadData.audio_id;

      // 2. Process DSP pipeline with active profile and algorithm
      const processRes = await fetch(
        `/api/audio/process/${audioId}?profile=${activeProfile}&algorithm=${activeAlgorithm}`,
        { method: 'POST' }
      );
      if (!processRes.ok) {
        throw new Error('Lỗi trong quá trình xử lý tín hiệu khử nhiễu');
      }

      const result = await processRes.json();

      const isSpeech = activeProfile === 'speech' || activeProfile === 'diagnostic_speech';
      const newCase = {
        id: audioId,
        title: `Bản Thu Trực Tiếp (${isSpeech ? 'Tiếng Nói/Ho Chẩn Đoán' : 'Âm Thở Phổi'} - ${new Date().toLocaleTimeString('vi-VN')})`,
        disease_group: isSpeech ? 'Tiếng nói chẩn đoán lâm sàng' : 'Âm thở lâm sàng',
        tag: isSpeech ? 'Vocal' : 'Breath',
        duration_sec: uploadData.duration_sec,
        raw_stream_url: `/api/audio/stream/${audioId}/raw`,
        cleaned_stream_url: `/api/audio/stream/${audioId}/cleaned`,
      };

      if (onProcessed) onProcessed(result, newCase);
      cleanup();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
      drawIdleWaveform();
    }
  };

  if (!isOpen) return null;

  const isSpeechMode = activeProfile === 'speech' || activeProfile === 'diagnostic_speech';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.48)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="clinical-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.65rem',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-drawer)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isSpeechMode ? '#E0F2FE' : '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isSpeechMode ? (
                <Mic size={22} color="#0284C7" />
              ) : (
                <Stethoscope size={22} color="#0D9488" />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {isSpeechMode ? 'Phòng Thu Tiếng Nói & Ho Chẩn Đoán' : 'Phòng Thu Âm Thở & Tiếng Phổi'}
              </h3>
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Smartphone size={13} color="var(--primary)" />
                <span>Hỗ trợ Microphone Máy Tính, Điện Thoại & Ống Nghe Điện Tử</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              cleanup();
              onClose();
            }}
            aria-label="Đóng cửa sổ"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Clinical Positioning Guide (Fixed Contrast & Readability) */}
        <div
          style={{
            background: isSpeechMode ? '#F0F9FF' : '#F0FDF4',
            border: isSpeechMode ? '1px solid #BAE6FD' : '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            color: '#1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <Info
              size={17}
              style={{
                flexShrink: 0,
                marginTop: '2px',
                color: isSpeechMode ? '#0284C7' : '#0D9488',
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isSpeechMode ? '#0369A1' : '#065F46',
                  marginBottom: '0.25rem',
                }}
              >
                {isSpeechMode
                  ? '📋 Hướng dẫn thu âm tiếng nói / ho chẩn đoán:'
                  : '🩺 Hướng dẫn thu âm tiếng thở phế nang:'}
              </div>
              <div style={{ color: '#334155' }}>
                {isSpeechMode ? (
                  <span>
                    Giữ microphone điện thoại hoặc máy tính cách miệng khoảng <strong>15 - 20 cm</strong>. Bệnh nhân thực hiện y lệnh: Ho dứt khoát 2-3 tiếng, đếm số <em>&quot;chín mươi chín&quot;</em> (rung thanh), hoặc ngân dài nguyên âm <em>&quot;Aaaaa&quot;</em>.
                  </span>
                ) : (
                  <span>
                    Áp sát microphone điện thoại/máy tính hoặc đầu dò ống nghe vào <strong>vùng hõm ức (khí quản)</strong> hoặc <strong>khoang liên sườn thành ngực trần</strong>. Thở sâu, đều đặn bằng miệng; tránh va chạm tay hoặc cọ xát vào vải áo.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Medical DSP Standard Bypass Notice */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.9rem',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={16} color="#0D9488" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Tiêu Chuẩn Y Tế:</strong> Hệ thống tự động vô hiệu hóa bộ lọc nén giọng nói (AGC/NS/AEC) của trình duyệt để thu nhận toàn vẹn các gai rale nổ (Crackles), rale rít (Wheezes) và họa âm bệnh lý.
          </span>
        </div>

        {/* Clinical Audio Oscilloscope & Monitor Deck */}
        <div
          style={{
            background: '#090D16',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            border: '1px solid #1E293B',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top Monitor Status & Digital Timecode */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.4rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isRecording ? '#EF4444' : '#10B981',
                  boxShadow: isRecording
                    ? '0 0 10px #EF4444'
                    : '0 0 6px rgba(16, 185, 129, 0.5)',
                  animation: isRecording ? 'pulse 1s infinite' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: isRecording ? '#FCA5A5' : '#94A3B8',
                  textTransform: 'uppercase',
                }}
              >
                {isRecording ? 'Đang thu nhận âm học thực tế' : 'Chế độ chờ (Standby 16kHz)'}
              </span>
            </div>

            {/* Live Digital Timecode */}
            <div
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: isRecording ? '#F43F5E' : '#F8FAFC',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              {Math.floor(recordTime / 60)
                .toString()
                .padStart(2, '0')}
              :
              {(recordTime % 60).toFixed(1).padStart(4, '0')}
            </div>
          </div>

          {/* Canvas Spectrum / Waveform Visualizer */}
          <canvas
            ref={canvasRef}
            width={480}
            height={68}
            style={{
              width: '100%',
              height: '68px',
              borderRadius: '6px',
              background: '#030712',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: '#64748B',
              paddingTop: '0.1rem',
            }}
          >
            <span>0 Hz (Sub-audio)</span>
            <span>Tần số bệnh học: 200Hz - 2000Hz</span>
            <span>8000 Hz (Nyquist)</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9F1239',
              fontSize: '0.8rem',
              background: '#FFE4E6',
              border: '1px solid #FDA4AF',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, color: '#E11D48' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
          {!isRecording ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={startRecording}
              disabled={isSubmitting}
              style={{
                flex: 1,
                minHeight: '46px',
                fontSize: '0.92rem',
                fontWeight: 600,
                justifyContent: 'center',
              }}
            >
              <Mic size={18} />
              <span>Bắt đầu thu âm</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={stopRecording}
              disabled={isSubmitting}
              style={{
                flex: 1,
                minHeight: '46px',
                fontSize: '0.92rem',
                fontWeight: 600,
                justifyContent: 'center',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang khử nhiễu AI & chuẩn hóa...</span>
                </>
              ) : (
                <>
                  <Square size={16} fill="white" />
                  <span>Dừng & Phân tích khử nhiễu</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              cleanup();
              onClose();
            }}
            disabled={isSubmitting}
            style={{
              minHeight: '46px',
              padding: '0 1.35rem',
              fontWeight: 500,
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
