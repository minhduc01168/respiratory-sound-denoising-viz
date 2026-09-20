import React from 'react';
import { Stethoscope, Mic, Cpu, Sparkles, RefreshCw } from 'lucide-react';

export default function Toolbar({
  activeProfile,
  onProfileChange,
  activeAlgorithm,
  onAlgorithmChange,
  isProcessing,
}) {
  const algorithms = [
    { id: 'classical_dsp', name: '⚡ Classical DSP (Wiener + Bandpass)' },
    { id: 'dtln_ai', name: '🧠 Deep AI DTLN (ONNX Runtime)' },
    { id: 'bio_acoustic', name: '🩺 Bio-Acoustic (Lọc Tiếng Tim & Ma Sát)' },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        padding: '0.75rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* 1. Dual Audio Profile Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Hồ Sơ Âm Học:
        </span>
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '0.2rem', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => onProfileChange('respiratory')}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeProfile === 'respiratory' ? 600 : 500,
              background: activeProfile === 'respiratory' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeProfile === 'respiratory' ? '#10B981' : 'var(--text-secondary)',
              border: activeProfile === 'respiratory' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Stethoscope size={14} />
            <span>🫁 Tiếng Thở Phổi</span>
          </button>

          <button
            type="button"
            onClick={() => onProfileChange('speech')}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeProfile === 'speech' ? 600 : 500,
              background: activeProfile === 'speech' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeProfile === 'speech' ? '#38BDF8' : 'var(--text-secondary)',
              border: activeProfile === 'speech' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Mic size={14} />
            <span>🎙️ Tiếng Nói Hội Chẩn</span>
          </button>
        </div>
      </div>

      {/* 2. Algorithm Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          <Cpu size={14} />
          <span>Thuật Toán Khử Nhiễu:</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={activeAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={isProcessing}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 2rem 0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              appearance: 'none',
              outline: 'none',
            }}
          >
            {algorithms.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '0.65rem', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            ▼
          </div>
        </div>

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38BDF8', fontSize: '0.75rem' }}>
            <RefreshCw size={12} className="animate-spin" />
            <span>Đang xử lý AI...</span>
          </div>
        )}
      </div>
    </div>
  );
}
