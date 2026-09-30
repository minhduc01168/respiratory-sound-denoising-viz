import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Headphones } from 'lucide-react';

export default function DualWaveformPlayer({
  rawUrl,
  cleanedUrl,
  onTimeUpdate,
  activeAudioType,
  setActiveAudioType,
}) {
  const rawContainerRef = useRef(null);
  const cleanContainerRef = useRef(null);

  const wsRawRef = useRef(null);
  const wsCleanRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const activeAudioTypeRef = useRef(activeAudioType);
  activeAudioTypeRef.current = activeAudioType;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Initialize WaveSurfer instances
  useEffect(() => {
    if (!rawContainerRef.current || !cleanContainerRef.current || !rawUrl || !cleanedUrl) return;

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    // Destroy existing instances
    if (wsRawRef.current) wsRawRef.current.destroy();
    if (wsCleanRef.current) wsCleanRef.current.destroy();

    // 1. Raw Waveform
    const wsRaw = WaveSurfer.create({
      container: rawContainerRef.current,
      waveColor: '#CBD5E1',
      progressColor: '#E11D48',
      cursorColor: '#BE123C',
      cursorWidth: 2,
      height: 65,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      url: rawUrl,
    });

    // 2. Cleaned Waveform
    const wsClean = WaveSurfer.create({
      container: cleanContainerRef.current,
      waveColor: '#CBD5E1',
      progressColor: '#0D9488',
      cursorColor: '#0F766E',
      cursorWidth: 2,
      height: 65,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      url: cleanedUrl,
    });

    wsRawRef.current = wsRaw;
    wsCleanRef.current = wsClean;

    // Strict volume enforcement: ONLY the active track has volume 1.0; the other is 0.0
    if (activeAudioTypeRef.current === 'cleaned') {
      wsClean.setVolume(1.0);
      wsRaw.setVolume(0.0);
    } else {
      wsRaw.setVolume(1.0);
      wsClean.setVolume(0.0);
    }

    let readyCount = 0;
    const checkReady = () => {
      readyCount++;
      if (readyCount >= 2) {
        setIsReady(true);
        const dur = Math.max(wsRaw.getDuration(), wsClean.getDuration());
        setDuration(dur);
      }
    };

    wsRaw.on('ready', checkReady);
    wsClean.on('ready', checkReady);

    // Synchronize play state
    wsClean.on('play', () => {
      if (activeAudioTypeRef.current === 'cleaned') setIsPlaying(true);
    });
    wsClean.on('pause', () => {
      if (activeAudioTypeRef.current === 'cleaned') setIsPlaying(false);
    });
    wsRaw.on('play', () => {
      if (activeAudioTypeRef.current === 'raw') setIsPlaying(true);
    });
    wsRaw.on('pause', () => {
      if (activeAudioTypeRef.current === 'raw') setIsPlaying(false);
    });

    // Time update listener: ONLY update from the currently active playing track
    // DO NOT touch or advance the inactive track while active is playing!
    wsClean.on('timeupdate', (time) => {
      if (activeAudioTypeRef.current === 'cleaned') {
        setCurrentTime(time);
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(time, wsClean.getDuration());
      }
    });

    wsRaw.on('timeupdate', (time) => {
      if (activeAudioTypeRef.current === 'raw') {
        setCurrentTime(time);
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(time, wsRaw.getDuration());
      }
    });

    // Seeking listener
    wsClean.on('seeking', (time) => {
      if (activeAudioTypeRef.current === 'cleaned') {
        setCurrentTime(time);
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(time, wsClean.getDuration());
      }
    });

    wsRaw.on('seeking', (time) => {
      if (activeAudioTypeRef.current === 'raw') {
        setCurrentTime(time);
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(time, wsRaw.getDuration());
      }
    });

    // Finish listener
    wsClean.on('finish', () => {
      setIsPlaying(false);
      wsClean.setTime(0);
      setCurrentTime(0);
    });

    wsRaw.on('finish', () => {
      setIsPlaying(false);
      wsRaw.setTime(0);
      setCurrentTime(0);
    });

    return () => {
      wsRaw.destroy();
      wsClean.destroy();
    };
  }, [rawUrl, cleanedUrl]);

  // SINGLE ACTIVE PLAYBACK: Only play the selected audio track!
  const togglePlay = useCallback(() => {
    if (!wsCleanRef.current || !wsRawRef.current) return;
    const currentAudio = activeAudioTypeRef.current;
    const activeWs = currentAudio === 'cleaned' ? wsCleanRef.current : wsRawRef.current;
    const inactiveWs = currentAudio === 'cleaned' ? wsRawRef.current : wsCleanRef.current;

    // Ensure inactive track is strictly muted and stopped
    inactiveWs.pause();
    inactiveWs.setVolume(0.0);

    // Active track has full volume
    activeWs.setVolume(1.0);

    if (activeWs.isPlaying()) {
      activeWs.pause();
      setIsPlaying(false);
    } else {
      activeWs.play();
      setIsPlaying(true);
    }
  }, []);

  // Seamless A/B switch: Transfer playback instantly from one track to another at the exact same second
  const handleSwitchAudio = useCallback(
    (targetType) => {
      if (targetType === activeAudioTypeRef.current) return;
      const oldWs = activeAudioTypeRef.current === 'cleaned' ? wsCleanRef.current : wsRawRef.current;
      const newWs = targetType === 'cleaned' ? wsCleanRef.current : wsRawRef.current;

      const wasPlaying = isPlayingRef.current;
      const t = oldWs ? oldWs.getCurrentTime() : currentTime;

      // 1. Immediately pause and mute the old track
      if (oldWs) {
        oldWs.pause();
        oldWs.setVolume(0.0);
      }

      // 2. Setup the new track: set volume 1.0 and move its cursor to the matching time
      if (newWs) {
        newWs.setVolume(1.0);
        newWs.setTime(t);
        // 3. If audio was playing, resume playing on the new track
        if (wasPlaying) {
          newWs.play();
          setIsPlaying(true);
        }
      }

      setActiveAudioType(targetType);
      setCurrentTime(t);
    },
    [currentTime, setActiveAudioType]
  );

  const seekOffset = useCallback(
    (seconds) => {
      if (!wsCleanRef.current || !wsRawRef.current) return;
      const activeWs = activeAudioTypeRef.current === 'cleaned' ? wsCleanRef.current : wsRawRef.current;
      const nextTime = Math.max(0, Math.min(duration, activeWs.getCurrentTime() + seconds));
      activeWs.setTime(nextTime);
      setCurrentTime(nextTime);
    },
    [duration]
  );

  // Keyboard shortcut listener: Space (play/pause), Tab (A/B toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        handleSwitchAudio(activeAudioTypeRef.current === 'cleaned' ? 'raw' : 'cleaned');
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekOffset(-1.0);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekOffset(1.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSwitchAudio, seekOffset]);

  const handleReplay = () => {
    if (!wsCleanRef.current || !wsRawRef.current) return;
    const activeWs = activeAudioTypeRef.current === 'cleaned' ? wsCleanRef.current : wsRawRef.current;
    activeWs.setTime(0);
    setCurrentTime(0);
    if (onTimeUpdateRef.current) onTimeUpdateRef.current(0, duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  return (
    <div
      className="clinical-card"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* 1. Header & Instant A/B Toggle Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Headphones size={17} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Đối So Sánh Âm Thanh A/B (Độc lập từng kênh)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Chỉ phát duy nhất 1 kênh âm thanh tại một thời điểm để bác sĩ thẩm định chính xác
            </p>
          </div>
        </div>

        {/* Instant A/B Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Phím tắt: <kbd style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>Space</kbd> Phát/Dừng &bull;{' '}
            <kbd style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>Tab</kbd> Đổi A/B
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: '#F1F5F9',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className={`btn ${activeAudioType === 'raw' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => handleSwitchAudio('raw')}
            >
              🔴 Kênh A: Âm Gốc (Có Nhiễu)
            </button>
            <button
              type="button"
              className={`btn ${activeAudioType === 'cleaned' ? 'btn-success' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => handleSwitchAudio('cleaned')}
            >
              <Sparkles size={13} />
              🟢 Kênh B: Đã Lọc Sạch (AI)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dual Waveform Stack: Active track is prominently highlighted, inactive is strictly frozen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Track A: Raw Waveform */}
        <div
          onClick={() => handleSwitchAudio('raw')}
          style={{
            background: activeAudioType === 'raw' ? '#FFF1F2' : '#F8FAFC',
            border: activeAudioType === 'raw' ? '2px solid #E11D48' : '1px dashed #CBD5E1',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            transition: 'all 0.15s ease',
            cursor: activeAudioType === 'raw' ? 'default' : 'pointer',
            opacity: activeAudioType === 'raw' ? 1 : 0.45,
          }}
          title={activeAudioType === 'raw' ? 'Đang phát âm thanh gốc' : 'Bấm vào đây để chuyển sang nghe âm thanh gốc'}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: activeAudioType === 'raw' ? '#BE123C' : 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: activeAudioType === 'raw' ? '#E11D48' : '#94A3B8',
                }}
              />
              <span>KÊNH A: ÂM THANH GỐC (CHỨA TIẾNG ỒN MÔI TRƯỜNG & 50Hz HUM)</span>
            </div>
            {activeAudioType === 'raw' ? (
              <span className="badge badge-rose" style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                🔊 ĐANG PHÁT RA TAI NGHE
              </span>
            ) : (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ⏸️ ĐÃ TẮT TIẾNG (Bấm vào để nghe bản này)
              </span>
            )}
          </div>
          <div ref={rawContainerRef} style={{ width: '100%' }} />
        </div>

        {/* Track B: Cleaned Waveform */}
        <div
          onClick={() => handleSwitchAudio('cleaned')}
          style={{
            background: activeAudioType === 'cleaned' ? '#F0FDF4' : '#F8FAFC',
            border: activeAudioType === 'cleaned' ? '2px solid #0D9488' : '1px dashed #CBD5E1',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            transition: 'all 0.15s ease',
            cursor: activeAudioType === 'cleaned' ? 'default' : 'pointer',
            opacity: activeAudioType === 'cleaned' ? 1 : 0.45,
          }}
          title={activeAudioType === 'cleaned' ? 'Đang phát âm thanh đã lọc' : 'Bấm vào đây để chuyển sang nghe âm thanh đã lọc'}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: activeAudioType === 'cleaned' ? '#0F766E' : 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: activeAudioType === 'cleaned' ? '#0D9488' : '#94A3B8',
                }}
              />
              <span>KÊNH B: ĐÃ KHỬ NHIỄU (BẢO TOÀN TRỌN VẸN TIẾNG RAN LÂM SÀNG)</span>
            </div>
            {activeAudioType === 'cleaned' ? (
              <span className="badge badge-teal" style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>
                🔊 ĐANG PHÁT RA TAI NGHE
              </span>
            ) : (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ⏸️ ĐÃ TẮT TIẾNG (Bấm vào để nghe bản này)
              </span>
            )}
          </div>
          <div ref={cleanContainerRef} style={{ width: '100%' }} />
        </div>
      </div>

      {/* 3. Playback Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Play/Pause Button */}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0 }}
            onClick={togglePlay}
            disabled={!isReady}
            title={isPlaying ? 'Dừng (Space)' : 'Phát (Space)'}
          >
            {isPlaying ? (
              <Pause size={18} fill="white" />
            ) : (
              <Play size={18} fill="white" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
            onClick={handleReplay}
            disabled={!isReady}
            title="Quay lại đầu (0s)"
          >
            <RotateCcw size={15} />
          </button>

          {/* Timer Display */}
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              marginLeft: '0.5rem',
            }}
          >
            {formatTime(currentTime)}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Volume2
            size={16}
            color={activeAudioType === 'cleaned' ? '#0F766E' : '#BE123C'}
          />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: activeAudioType === 'cleaned' ? '#0F766E' : '#BE123C',
            }}
          >
            {activeAudioType === 'cleaned'
              ? 'Tai nghe: Đang nghe Kênh B (Đã làm sạch)'
              : 'Tai nghe: Đang nghe Kênh A (Âm gốc có tạp âm)'}
          </span>
        </div>
      </div>
    </div>
  );
}
