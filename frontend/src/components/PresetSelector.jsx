import React from 'react';
import { Activity, Wind, AlertCircle, Volume2, Sparkles } from 'lucide-react';

export default function PresetSelector({ presets = [], activeCaseId, onSelectPreset }) {
  if (!presets || presets.length === 0) return null;

  const getPresetIcon = (tag) => {
    switch (tag) {
      case 'Normal':
        return <Activity size={16} color="#10B981" />;
      case 'Wheeze':
        return <Wind size={16} color="#F59E0B" />;
      case 'Crackle':
        return <AlertCircle size={16} color="#F43F5E" />;
      case 'Cough':
        return <Volume2 size={16} color="#06B6D4" />;
      default:
        return <Activity size={16} color="#38BDF8" />;
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '0.75rem',
      margin: '0 1rem 1rem 1rem'
    }}>
      {presets.map((p) => {
        const isActive = activeCaseId === p.id;
        return (
          <div
            key={p.id}
            onClick={() => onSelectPreset && onSelectPreset(p)}
            className="glass-panel glass-panel-interactive"
            style={{
              padding: '0.85rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
              border: isActive ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
              boxShadow: isActive ? '0 0 16px rgba(6, 182, 212, 0.3)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getPresetIcon(p.tag)}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? '#FFFFFF' : 'var(--text-primary)' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {p.disease_group}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${p.tag === 'Wheeze' ? 'badge-amber' : (p.tag === 'Crackle' ? 'badge-rose' : 'badge-emerald')}`} style={{ fontSize: '0.65rem' }}>
                {p.tag}
              </span>
              <div style={{ fontSize: '0.65rem', color: '#34D399', fontWeight: 600, marginTop: '0.2rem' }}>
                {p.estimated_snr_gain}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
