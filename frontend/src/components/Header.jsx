import React from 'react';
import { UploadCloud, Mic, FileText, Stethoscope, ChevronDown } from 'lucide-react';

export default function Header({
  activeProfile = 'respiratory',
  onProfileChange,
  presets = [],
  activeCase,
  onSelectPreset,
  onOpenRecordModal,
  onOpenUploadModal,
  onExportReport,
}) {
  return (
    <header
      className="clinical-card"
      style={{
        margin: '1rem 1.25rem 0.75rem 1.25rem',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* 1. Minimalist Clean Title (Hospital Logo Removed) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              PULMO-SPECTRA
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              CLINICAL AI
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Hệ thống phân tích & khử nhiễu âm hô hấp y tế
          </p>
        </div>
      </div>

      {/* 2. Clinical Profile Toggle (Respiratory vs Cough/Speech) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.2rem',
            gap: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => onProfileChange && onProfileChange('respiratory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeProfile === 'respiratory' ? 600 : 500,
              background: activeProfile === 'respiratory' ? '#FFFFFF' : 'transparent',
              color: activeProfile === 'respiratory' ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeProfile === 'respiratory' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeProfile === 'respiratory' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Stethoscope size={14} />
            <span>🫁 Âm Phổi (Tiếng Thở)</span>
          </button>

          <button
            type="button"
            onClick={() => onProfileChange && onProfileChange('speech')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeProfile === 'speech' ? 600 : 500,
              background: activeProfile === 'speech' ? '#FFFFFF' : 'transparent',
              color: activeProfile === 'speech' ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeProfile === 'speech' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              boxShadow: activeProfile === 'speech' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Mic size={14} />
            <span>🎙️ Tiếng Ho / Giọng Nói</span>
          </button>
        </div>
      </div>

      {/* 3. Action Controls & Sample Cases Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Subtle Sample Cases Quick Selector (for training/evaluation) */}
        {presets && presets.length > 0 && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={activeCase?.id || ''}
              onChange={(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (found && onSelectPreset) onSelectPreset(found);
              }}
              aria-label="Chọn ca bệnh mẫu"
              style={{
                background: '#FFFFFF',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1.8rem 0.5rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <option value="" disabled>
                📋 Ca mẫu thử nghiệm...
              </option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.tag}] {p.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: 'absolute',
                right: '0.65rem',
                pointerEvents: 'none',
                color: 'var(--text-muted)',
              }}
            />
          </div>
        )}

        {/* Upload Audio */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenUploadModal}
          title="Tải tệp âm thanh (.wav, .mp3)"
        >
          <UploadCloud size={15} color="#0284C7" />
          <span>Tải file</span>
        </button>

        {/* Record Microphone / Stethoscope */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenRecordModal}
          title="Thu âm trực tiếp từ ống nghe điện tử hoặc micro"
        >
          <Mic size={15} color="#E11D48" />
          <span>Thu âm</span>
        </button>

        {/* Export Medical Report */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onExportReport}
          title="Xuất phiếu kết quả chẩn đoán lâm sàng PDF"
        >
          <FileText size={15} />
          <span>Xuất báo cáo</span>
        </button>
      </div>
    </header>
  );
}
