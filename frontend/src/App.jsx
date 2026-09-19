import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsCard from './components/MetricsCard';
import AudioRecordModal from './components/AudioRecordModal';
import AudioUploadModal from './components/AudioUploadModal';
import { Volume2, Sliders, Waves, Layers, Edit3, Sparkles } from 'lucide-react';

export default function App() {
  const [activeCase, setActiveCase] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAudioType, setActiveAudioType] = useState('cleaned'); // 'cleaned' | 'raw'
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load default preset on startup
  useEffect(() => {
    fetch('/api/audio/presets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          handleSelectPreset(data[1] || data[0]); // Select Wheeze by default
        }
      })
      .catch(err => console.error('Presets init failed:', err));
  }, []);

  const handleSelectPreset = (preset) => {
    setActiveCase(preset);
    setIsProcessing(true);
    fetch(`/api/audio/process/${preset.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(result => {
        setMetrics(result.metrics);
        setIsProcessing(false);
      })
      .catch(() => {
        setIsProcessing(false);
      });
  };

  const handleAudioProcessed = (result, newCase) => {
    setActiveCase(newCase);
    setMetrics(result.metrics);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Header with Brand, Presets, and System Status */}
      <Header 
        activeCase={activeCase}
        onSelectPreset={handleSelectPreset}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
        onExportReport={() => window.print()}
      />

      {/* 2. Main Medical Studio Workspace */}
      <main style={{ 
        flex: 1, 
        padding: '0 1rem 1.5rem 1rem', 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr) 340px', 
        gap: '1rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Metrics & Acoustic Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Diagnostic Metrics Bar */}
          <MetricsCard metrics={metrics} caseInfo={activeCase} />

          {/* Dual Waveform Audio Player Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Waves size={18} color="#06B6D4" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Dạng Sóng Âm Học Kép (Dual Waveform Player)</h3>
              </div>

              {/* Instant A/B Toggle Switch Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-darker)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <button 
                  className={`btn ${activeAudioType === 'raw' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveAudioType('raw')}
                >
                  Bản Gốc (Raw)
                </button>
                <button 
                  className={`btn ${activeAudioType === 'cleaned' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveAudioType('cleaned')}
                >
                  <Sparkles size={12} />
                  Đã Khử Nhiễu (Cleaned)
                </button>
              </div>
            </div>

            {/* Waveform Visualization Canvas Containers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: '#F43F5E', fontWeight: 600, marginBottom: '0.35rem' }}>
                  KÊNH A: ÂM THANH GỐC (LẪN TẠP ÂM MÔI TRƯỜNG & 50Hz HUM)
                </div>
                <div id="waveform-raw" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {activeCase ? `Đang nạp file gốc: ${activeCase.id}.wav` : 'Chọn ca bệnh để xem dạng sóng'}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600, marginBottom: '0.35rem' }}>
                  KÊNH B: ÂM THANH ĐÃ LỌC (ZERO-PHASE BUTTERWORTH + WIENER GATING)
                </div>
                <div id="waveform-clean" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {activeCase ? `Đang nạp file sạch: ${activeCase.id}_clean.wav` : 'Chọn ca bệnh để xem dạng sóng'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Mel-Spectrogram Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#A78BFA" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Biểu Đồ Phổ Tần Số Mel-Spectrogram (Magma Colormap)</h3>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>64 Mel Bands (50Hz - 4000Hz)</span>
            </div>
            <div style={{ 
              height: '220px', 
              background: '#04070D', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <canvas id="spectrogram-canvas" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
              <div style={{ position: 'absolute', color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>
                {isProcessing ? 'Đang trích xuất ma trận phổ decibel...' : 'Khu vực hiển thị phổ tần số Mel Canvas'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medical Region Annotation Sidebar */}
        <aside className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Edit3 size={18} color="#10B981" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Gán Nhãn Lâm Sàng (Take-Note)</h3>
          </div>

          {/* Quick-Tags Selector */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Thẻ bệnh lý thường gặp:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {['Wheeze', 'Crackle', 'Rhonchi', 'Stridor', 'Cough', 'Artifact'].map(tag => (
                <button key={tag} className="btn btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}>
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Annotations List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Danh sách dấu hiệu phát hiện:</span>
            <div style={{ 
              flex: 1, 
              border: '1px dashed var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '1rem', 
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              Kéo chuột trên phổ tần số để chọn vùng và thêm ghi chú chẩn đoán y khoa.
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <AudioRecordModal 
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onProcessed={handleAudioProcessed}
      />

      <AudioUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onProcessed={handleAudioProcessed}
      />
    </div>
  );
}
