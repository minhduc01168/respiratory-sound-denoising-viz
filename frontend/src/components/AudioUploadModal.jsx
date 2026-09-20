import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileAudio, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function AudioUploadModal({
  isOpen,
  onClose,
  onProcessed,
  activeProfile = 'respiratory',
  activeAlgorithm = 'classical_dsp',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'wav' && ext !== 'mp3') {
      setErrorMsg('Chỉ hỗ trợ tệp định dạng .WAV hoặc .MP3.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp vượt quá 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.detail || 'Tải file thất bại');
      }

      const uploadData = await uploadRes.json();
      const audioId = uploadData.audio_id;

      // Process DSP with active profile and strategy algorithm
      const processRes = await fetch(
        `/api/audio/process/${audioId}?profile=${activeProfile}&algorithm=${activeAlgorithm}`,
        { method: 'POST' }
      );
      if (!processRes.ok) {
        throw new Error('Lỗi xử lý thuật toán khử nhiễu');
      }

      const result = await processRes.json();

      const newCase = {
        id: audioId,
        title: selectedFile.name,
        disease_group: 'Tệp tải lên',
        tag: 'Upload',
        duration_sec: uploadData.duration_sec,
        raw_stream_url: `/api/audio/stream/${audioId}/raw`,
        cleaned_stream_url: `/api/audio/stream/${audioId}/cleaned`,
      };

      if (onProcessed) onProcessed(result, newCase);
      setSelectedFile(null);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UploadCloud size={20} color="#38BDF8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tải Tệp Âm Thanh Hô Hấp</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#06B6D4' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(6, 182, 212, 0.05)' : 'rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".wav,.mp3,audio/wav,audio/mpeg"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <FileAudio size={24} color="#38BDF8" />
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            Kéo thả tệp âm thanh vào đây hoặc <span style={{ color: '#38BDF8', textDecoration: 'underline' }}>chọn từ máy tính</span>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Hỗ trợ WAV, MP3 &bull; Tối đa 10MB &bull; Khuyên dùng 15s - 30s
          </p>
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileAudio size={18} color="#10B981" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FB7185', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUploadAndProcess}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý DSP...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Tải lên & Khử nhiễu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
