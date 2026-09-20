import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, X, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

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
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setRecordTime(0);
    setErrorMsg('');
  };

  const startRecording = async () => {
    setErrorMsg('');
    audioChunksRef.current = [];

    try {
      // STRICT MEDICAL REQUIREMENT: Disable browser hardware DSP filters to preserve pathology
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
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Draw VU Meter loop
      drawVUMeter();

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleUploadAndProcess(audioBlob);
      };

      mediaRecorder.start(200); // 200ms slices
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
      setErrorMsg('Thời lượng bản ghi quá ngắn (< 1.0 giây). Vui lòng ghi âm thêm.');
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
      formData.append('file', blob, 'stethoscope_recording.wav');

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

      const newCase = {
        id: audioId,
        title: `Bản Thu Trực Tiếp (${new Date().toLocaleTimeString('vi-VN')})`,
        disease_group: 'Bản ghi lâm sàng',
        tag: 'Patient',
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

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', background: 'var(--bg-darker)', border: '1px solid var(--border-glow)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="recording-dot" style={{ display: isRecording ? 'block' : 'none' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Phòng Thu Âm Hô Hấp Y Khoa</h3>
          </div>
          <button onClick={() => { cleanup(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Notice for Hardware Denoising bypass */}
        <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.75rem', color: '#38BDF8', marginBottom: '1.25rem' }}>
          <strong>Chuẩn Y Tế:</strong> Hệ thống tự động vô hiệu hóa các thuật toán khử ồn phần cứng của máy tính để bảo toàn các tiếng thở bệnh lý (ran rít / nổ).
        </div>

        {/* VU Meter & Timer */}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <canvas ref={canvasRef} width={380} height={70} style={{ width: '100%', height: '70px', borderRadius: '4px' }} />
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isRecording ? '#F43F5E' : 'var(--text-muted)' }}>
            {Math.floor(recordTime / 60).toString().padStart(2, '0')}:
            {(recordTime % 60).toFixed(1).padStart(4, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isRecording ? 'Đang thu âm tín hiệu hô hấp...' : 'Sẵn sàng ghi âm'}
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FB7185', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {!isRecording ? (
            <button className="btn btn-danger" onClick={startRecording} disabled={isSubmitting} style={{ flex: 1 }}>
              <Mic size={16} />
              <span>Bắt đầu thu âm</span>
            </button>
          ) : (
            <button className="btn btn-success" onClick={stopRecording} disabled={isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang xử lý DSP...</span>
                </>
              ) : (
                <>
                  <Square size={16} fill="white" />
                  <span>Dừng & Phân tích khử nhiễu</span>
                </>
              )}
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => { cleanup(); onClose(); }} disabled={isSubmitting}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
