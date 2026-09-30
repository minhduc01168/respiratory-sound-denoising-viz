import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileAudio, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function AudioUploadModal({
  isOpen,
  onClose,
  onProcessed,
  presets = [],
  onSelectPreset,
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
    const validExts = ['wav', 'mp3', 'ogg', 'flac', 'm4a', 'webm'];
    if (!validExts.includes(ext)) {
      setErrorMsg('Định dạng tệp không được hỗ trợ. Chấp nhận: .WAV, .MP3, .OGG, .FLAC, .M4A, .WEBM.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp vượt quá giới hạn tối đa 10MB.');
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
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
          maxWidth: '520px',
          padding: '1.75rem',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-drawer)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Tải Tệp Âm Thanh Bệnh Nhân
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Chấp nhận file ghi âm .WAV, .MP3, .FLAC (Tối đa 10MB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
            }}
          >
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
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
            transition: 'all 0.15s ease',
            marginBottom: '1.25rem',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".wav,.mp3,.ogg,.flac,.m4a,.webm"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          <FileAudio
            size={38}
            color={dragActive ? 'var(--primary)' : 'var(--text-muted)'}
            style={{ margin: '0 auto 0.75rem auto' }}
          />

          {selectedFile ? (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Sẵn sàng phân tích
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kéo thả tệp âm thanh vào đây, hoặc <span style={{ color: 'var(--primary)' }}>chọn từ máy tính</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Khuyến nghị: File WAV 16-bit 44.1kHz hoặc 16kHz
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--rose-danger)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              background: '#FFF1F2',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUploadAndProcess}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang xử lý AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Tải Lên & Khử Nhiễu Ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Reference / Sample Cases Picker */}
        {presets && presets.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              Hoặc nghe thử mẫu nghiên cứu lâm sàng:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    if (onSelectPreset) onSelectPreset(p);
                    onClose();
                  }}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  [{p.tag}] {p.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
