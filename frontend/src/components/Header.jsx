import React, { useState, useEffect } from 'react';
import { Activity, Radio, UploadCloud, Mic, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ onSelectPreset, onOpenRecordModal, onOpenUploadModal, onExportReport, activeCase }) {
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    // Healthcheck ping
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setServerStatus('online');
        else setServerStatus('offline');
      })
      .catch(() => setServerStatus('offline'));

    // Fetch clinical presets
    fetch('/api/audio/presets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPresets(data);
      })
      .catch(err => console.error('Error fetching presets:', err));
  }, []);

  return (
    <header className="glass-panel" style={{ margin: '1rem', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      {/* Brand & System Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(16,185,129,0.2) 100%)',
          border: '1px solid rgba(6,182,212,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={24} color="#06B6D4" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #FFFFFF 0%, #CBD5E1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PULMO-SPECTRA AI
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>DSP CLINICAL V1.0</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Nền Tảng Khử Nhiễu Âm Thanh Hô Hấp & Phân Tích Phổ Âm Học Y Tế
          </p>
        </div>
      </div>

      {/* Preset Case Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Ca bệnh mẫu:</span>
        <select 
          value={activeCase?.id || ''}
          onChange={(e) => {
            const found = presets.find(p => p.id === e.target.value);
            if (found && onSelectPreset) onSelectPreset(found);
          }}
          style={{
            background: 'var(--bg-darker)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>-- Chọn ca bệnh lâm sàng --</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>
              [{p.tag}] {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Action Controls & Health Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Upload Audio Button */}
        <button className="btn btn-secondary" onClick={onOpenUploadModal} title="Tải tệp âm thanh (.wav, .mp3)">
          <UploadCloud size={16} color="#38BDF8" />
          <span>Tải file</span>
        </button>

        {/* Record Microphone Button */}
        <button className="btn btn-secondary" onClick={onOpenRecordModal} title="Thu âm trực tiếp từ ống nghe hoặc mic">
          <Mic size={16} color="#F43F5E" />
          <span>Thu âm</span>
        </button>

        {/* Export Medical Report Button */}
        <button className="btn btn-primary" onClick={onExportReport} title="Xuất báo cáo chẩn đoán lâm sàng PDF/In">
          <FileText size={16} />
          <span>Xuất báo cáo</span>
        </button>

        {/* Backend Connectivity Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: serverStatus === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
          border: `1px solid ${serverStatus === 'online' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: serverStatus === 'online' ? '#34D399' : '#FB7185'
        }}>
          {serverStatus === 'online' ? (
            <>
              <CheckCircle2 size={13} />
              <span>DSP ENGINE ON</span>
            </>
          ) : (
            <>
              <AlertCircle size={13} />
              <span>OFFLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
