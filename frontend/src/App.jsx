import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
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
  const [activeAudioType, setActiveAudioType] = useState('cleaned'); // 'cleaned' | 'raw'
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [annotationCount, setAnnotationCount] = useState(0);

  // Clinical Profile ('respiratory' vs 'speech')
  const [activeProfile, setActiveProfile] = useState('respiratory');

  // Drawer & Modal states
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Automatically map algorithm to medical profile
  const getOptimalAlgorithm = (profile) => {
    return profile === 'speech' ? 'dtln_ai' : 'classical_dsp';
  };

  const handleSelectPreset = useCallback((preset, profile = activeProfile) => {
    setActiveCase(preset);
    setSelectedRegion(null);
    const algo = getOptimalAlgorithm(profile);
    fetch(`/api/audio/process/${preset.id}?profile=${profile}&algorithm=${algo}`, { method: 'POST' })
      .then((res) => res.json())
      .then((result) => {
        setMetrics(result.metrics);
      })
      .catch((err) => {
        console.error('Process preset error:', err);
      });
  }, [activeProfile]);

  // Load presets on startup
  useEffect(() => {
    fetch('/api/audio/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
          handleSelectPreset(data[1] || data[0]); // Default to sample Wheeze case
        }
      })
      .catch((err) => console.error('Presets init failed:', err));
  }, [handleSelectPreset]);

  const handleProfileChange = (newProfile) => {
    setActiveProfile(newProfile);
    if (activeCase) {
      handleSelectPreset(activeCase, newProfile);
    }
  };

  const handleAudioProcessed = (result, newCase) => {
    setActiveCase(newCase);
    setMetrics(result.metrics);
    setSelectedRegion(null);
  };

  const handleRegionSelected = (region) => {
    setSelectedRegion(region);
    setIsAnnotationsOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* 1. Clinical Minimalist Header (Logo removed, mode toggle & sample menu integrated) */}
      <Header
        activeProfile={activeProfile}
        onProfileChange={handleProfileChange}
        presets={presets}
        activeCase={activeCase}
        onSelectPreset={handleSelectPreset}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
        onExportReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Main Full-Width Medical Studio (No 360px sidebar clutter) */}
      <main
        style={{
          flex: 1,
          padding: '0.5rem 1.25rem 2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Diagnostic Metrics Summary */}
        <MetricsCard metrics={metrics} caseInfo={activeCase} />

        {/* Dual Waveform A-B Player */}
        {activeCase && (
          <DualWaveformPlayer
            rawUrl={`/api/audio/stream/${activeCase.id}/raw`}
            cleanedUrl={`/api/audio/stream/${activeCase.id}/cleaned`}
            activeAudioType={activeAudioType}
            setActiveAudioType={setActiveAudioType}
            onTimeUpdate={(t) => setCurrentTime(t)}
          />
        )}

        {/* Full-Width Mel-Spectrogram Visualizer */}
        {activeCase && (
          <MelSpectrogramViewer
            audioId={activeCase.id}
            target={activeAudioType}
            currentTime={currentTime}
            duration={metrics?.cleaned_duration_sec || activeCase.duration_sec || 4.0}
            annotationCount={annotationCount}
            onRegionSelected={handleRegionSelected}
            onOpenAnnotations={() => setIsAnnotationsOpen(true)}
          />
        )}
      </main>

      {/* Slide-over Clinical Annotation Drawer */}
      <AnnotationPanel
        isOpen={isAnnotationsOpen}
        onClose={() => setIsAnnotationsOpen(false)}
        audioId={activeCase?.id}
        selectedRegion={selectedRegion}
        onClearRegion={() => setSelectedRegion(null)}
        onAnnotationsChanged={(count) => setAnnotationCount(count)}
      />

      {/* Modals */}
      <AudioRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onProcessed={handleAudioProcessed}
        activeProfile={activeProfile}
        activeAlgorithm={getOptimalAlgorithm(activeProfile)}
      />

      <AudioUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onProcessed={handleAudioProcessed}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        activeProfile={activeProfile}
        activeAlgorithm={getOptimalAlgorithm(activeProfile)}
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
