import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, AlertTriangle, Loader2, Smartphone, Info } from 'lucide-react';
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
    }
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
      streamRef.current.getTracks().forEach(track => track.stop());
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

  const startRecording = async () => {
    setErrorMsg('');
    audioChunksRef.current = [];

    try {
      // STRICT MEDICAL REQUIREMENT: Disable browser hardware DSP filters to preserve raw pathology
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        }
      });
      streamRef.current = stream;

      // Setup Web Audio API Analyser for Live VU Meter
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Draw VU Meter loop
      drawVUMeter();

      // Initialize MediaRecorder with cross-platform MIME detection (iOS Safari, Android Chrome, PC)
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

      mediaRecorder.start(200); // 200ms time slices
      setIsRecording(true);
      setRecordTime(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordTime((Date.now() - startTime) / 1000);
      }, 100);

    } catch (err) {
      console.error('Microphone error:', err);
      setErrorMsg('Không thể truy cập Microphone. Vui lòng cấp quyền hoặc kiểm tra thiết bị kết nối.');
    }
  };

  const stopRecording = () => {
    if (recordTime < 1.0) {
      setErrorMsg('Thời lượng bản ghi quá ngắn (< 1.0 giây). Vui lòng ghi âm tối thiểu 1.0 giây.');
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(0.7, '#10B981');
        grad.addColorStop(1, '#F43F5E');

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
    }
  };

  if (!isOpen) return null;

  const isSpeechMode = activeProfile === 'speech' || activeProfile === 'diagnostic_speech';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        background: 'var(--bg-darker)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="recording-dot" style={{ display: isRecording ? 'block' : 'none' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                {isSpeechMode ? 'Phòng Thu Tiếng Nói & Ho Chẩn Đoán' : 'Phòng Thu Âm Thở & Tiếng Phổi'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: isSpeechMode ? '#38BDF8' : '#10B981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Smartphone size={13} />
                <span>Hỗ trợ Microphone Máy Tính & Điện Thoại Di Động</span>
              </div>
            </div>
          </div>
          <button onClick={() => { cleanup(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Clinical Positioning Guide */}
        <div style={{
          background: isSpeechMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: isSpeechMode ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          fontSize: '0.78rem',
          lineHeight: '1.45',
          color: isSpeechMode ? '#E0F2FE' : '#D1FAE5',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: isSpeechMode ? '#38BDF8' : '#10B981' }} />
            <div>
              <strong style={{ color: isSpeechMode ? '#38BDF8' : '#10B981' }}>
                {isSpeechMode ? '📋 Hướng dẫn thu âm tiếng nói / ho chẩn đoán:' : '🩺 Hướng dẫn thu âm tiếng thở phổi:'}
              </strong>
              <div style={{ marginTop: '0.3rem' }}>
                {isSpeechMode ? (
                  <span>
                    Giữ microphone điện thoại hoặc máy tính cách miệng khoảng <strong>15 - 20 cm</strong>. Bệnh nhân thực hiện theo y lệnh chẩn đoán của bác sĩ: Ho dứt khoát 2-3 tiếng, đếm số <em>&quot;chín mươi chín&quot;</em> (nghiệm pháp rung thanh), hoặc phát âm nguyên âm ngân dài <em>&quot;Aaaaa&quot;</em>.
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

        {/* Notice for Hardware Denoising bypass */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <strong>🛡️ Tiêu Chuẩn Y Tế:</strong> Hệ thống tự động vô hiệu hóa bộ lọc nén giọng nói (AGC/NS/AEC) của trình duyệt để thu nhận toàn vẹn các gai rale nổ (Crackles), rale rít (Wheezes) và họa âm bệnh lý.
        </div>

        {/* VU Meter & Timer */}
        <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <canvas ref={canvasRef} width={420} height={70} style={{ width: '100%', height: '70px', borderRadius: '4px' }} />
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isRecording ? '#F43F5E' : 'var(--text-muted)' }}>
            {Math.floor(recordTime / 60).toString().padStart(2, '0')}:
            {(recordTime % 60).toFixed(1).padStart(4, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', color: isRecording ? '#F43F5E' : 'var(--text-muted)', fontWeight: isRecording ? 600 : 400 }}>
            {isRecording ? '🔴 Đang thu âm tín hiệu thực tế...' : '⚪ Sẵn sàng ghi âm'}
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FB7185', fontSize: '0.8rem', marginBottom: '1rem', background: 'rgba(244, 63, 94, 0.1)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons (Touch Friendly: min-height 48px) */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button
              className="btn btn-danger"
              onClick={startRecording}
              disabled={isSubmitting}
              style={{ flex: 1, minHeight: '48px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              <Mic size={18} />
              <span>Bắt đầu thu âm</span>
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={stopRecording}
              disabled={isSubmitting}
              style={{ flex: 1, minHeight: '48px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang khử nhiễu AI...</span>
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
            className="btn btn-secondary"
            onClick={() => { cleanup(); onClose(); }}
            disabled={isSubmitting}
            style={{ minHeight: '48px', padding: '0 1.25rem' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
