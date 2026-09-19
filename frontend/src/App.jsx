import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PresetSelector from './components/PresetSelector';
import MetricsCard from './components/MetricsCard';
import DualWaveformPlayer from './components/DualWaveformPlayer';
import MelSpectrogramViewer from './components/MelSpectrogramViewer';
import AnnotationPanel from './components/AnnotationPanel';
import AudioRecordModal from './components/AudioRecordModal';
import AudioUploadModal from './components/AudioUploadModal';
import ReportModal from './components/ReportModal';

export default function App() {
  const [presets, setPresets] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAudioType, setActiveAudioType] = useState('cleaned'); // 'cleaned' | 'raw'
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Load presets on startup
  useEffect(() => {
    fetch('/api/audio/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
          handleSelectPreset(data[1] || data[0]); // Select Wheeze case by default
        }
      })
      .catch((err) => console.error('Presets init failed:', err));
  }, []);

  const handleSelectPreset = (preset) => {
    setActiveCase(preset);
    setIsProcessing(true);
    setSelectedRegion(null);
    fetch(`/api/audio/process/${preset.id}`, { method: 'POST' })
      .then((res) => res.json())
      .then((result) => {
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
    setSelectedRegion(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Header with Brand, Quick Actions, and Health Status */}
      <Header
        activeCase={activeCase}
        onSelectPreset={handleSelectPreset}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
        onExportReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Quick Clinical Preset Selector Bar */}
      <PresetSelector
        presets={presets}
        activeCaseId={activeCase?.id}
        onSelectPreset={handleSelectPreset}
      />

      {/* 3. Main Medical Studio Workspace */}
      <main
        style={{
          flex: 1,
          padding: '0 1rem 1.5rem 1rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Metrics & Acoustic Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Diagnostic Metrics Bar */}
          <MetricsCard metrics={metrics} caseInfo={activeCase} />

          {/* Dual Waveform Audio Player Panel */}
          {activeCase && (
            <DualWaveformPlayer
              rawUrl={`/api/audio/stream/${activeCase.id}/raw`}
              cleanedUrl={`/api/audio/stream/${activeCase.id}/cleaned`}
              activeAudioType={activeAudioType}
              setActiveAudioType={setActiveAudioType}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />
          )}

          {/* Interactive Mel-Spectrogram Panel */}
          {activeCase && (
            <MelSpectrogramViewer
              audioId={activeCase.id}
              target={activeAudioType}
              currentTime={currentTime}
              duration={metrics?.cleaned_duration_sec || activeCase.duration_sec || 4.0}
              onRegionSelected={(region) => setSelectedRegion(region)}
            />
          )}
        </div>

        {/* Right Column: Medical Region Annotation Sidebar */}
        <AnnotationPanel
          audioId={activeCase?.id}
          selectedRegion={selectedRegion}
          onClearRegion={() => setSelectedRegion(null)}
        />
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

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeCase={activeCase}
        metrics={metrics}
      />
    </div>
  );
}
