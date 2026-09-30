import React, { useEffect, useRef, useState } from 'react';
import { getMagmaColor } from '../utils/colormap';
import { Layers, Loader2, Edit3 } from 'lucide-react';

export default function MelSpectrogramViewer({
  audioId,
  target = 'cleaned',
  currentTime = 0,
  duration = 4.0,
  annotationCount = 0,
  onRegionSelected,
  onOpenAnnotations,
}) {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [spectrogramData, setSpectrogramData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Drag-to-select region states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  // Fetch spectrogram matrix when audioId or target changes
  useEffect(() => {
    if (!audioId) return;

    setIsLoading(true);
    setErrorMsg('');

    fetch(`/api/audio/spectrogram/${audioId}?target=${target}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải dữ liệu ma trận phổ tần');
        return res.json();
      })
      .then((data) => {
        setSpectrogramData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Spectrogram fetch error:', err);
        setErrorMsg(err.message);
        setIsLoading(false);
      });
  }, [audioId, target]);

  // Render static Mel-spectrogram bitmap to background canvas
  useEffect(() => {
    if (!spectrogramData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const matrix = spectrogramData.mel_matrix; // 64 rows x N frames
    const nMels = matrix.length;
    if (nMels === 0) return;
    const nFrames = matrix[0].length;

    // Create offscreen image data of size [nFrames, nMels]
    const offscreen = document.createElement('canvas');
    offscreen.width = nFrames;
    offscreen.height = nMels;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(nFrames, nMels);
    const data = imgData.data;

    // Row 0 is lowest frequency (50Hz), row 63 is highest (4000Hz)
    for (let m = 0; m < nMels; m++) {
      const targetY = nMels - 1 - m;
      const row = matrix[m];
      for (let f = 0; f < nFrames; f++) {
        const val = row[f];
        const [r, g, b] = getMagmaColor(val);
        const idx = (targetY * nFrames + f) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Draw scaled image to visible canvas
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  }, [spectrogramData]);

  // Render dynamic overlay: Frequency axes, Time grid, Playhead line, Selection box
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    overlay.width = overlay.parentElement.clientWidth;
    overlay.height = 200;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const W = overlay.width;
    const H = overlay.height;

    // 1. Draw Frequency Grid Lines & Labels
    const freqLabels = [
      { hz: '4 kHz', yFrac: 0.08 },
      { hz: '2 kHz', yFrac: 0.32 },
      { hz: '1 kHz', yFrac: 0.58 },
      { hz: '500 Hz', yFrac: 0.78 },
      { hz: '100 Hz', yFrac: 0.94 },
    ];

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    freqLabels.forEach((item) => {
      const y = item.yFrac * H;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillText(item.hz, 6, y + 3);
    });

    // 2. Draw Time Grid Labels
    const dur = duration > 0 ? duration : 4.0;
    const secStep = dur > 8 ? 2 : 1;
    for (let s = 0; s <= dur; s += secStep) {
      const x = (s / dur) * W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.fillText(`${s.toFixed(0)}s`, Math.max(5, x - 8), H - 6);
    }

    // 3. Draw Selection Highlight Box (if user is dragging)
    if (selectionStart !== null && selectionEnd !== null) {
      const minX = Math.min(selectionStart, selectionEnd);
      const maxX = Math.max(selectionStart, selectionEnd);
      ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
      ctx.fillRect(minX, 0, maxX - minX, H);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(minX, 0, maxX - minX, H);

      // Label showing selected time range
      const tStart = (minX / W) * dur;
      const tEnd = (maxX / W) * dur;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(
        `[${tStart.toFixed(2)}s - ${tEnd.toFixed(2)}s]`,
        Math.min(W - 120, minX + 5),
        20
      );
    }

    // 4. Draw Synchronized Playhead Line
    if (dur > 0 && currentTime >= 0) {
      const playheadX = (currentTime / dur) * W;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, H);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [spectrogramData, currentTime, duration, selectionStart, selectionEnd]);

  // Mouse drag events for region selection
  const handleMouseDown = (e) => {
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setIsSelecting(true);
    setSelectionStart(x);
    setSelectionEnd(x);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setSelectionEnd(x);
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    if (selectionStart !== null && selectionEnd !== null) {
      const W = overlayCanvasRef.current.clientWidth;
      const dur = duration > 0 ? duration : 4.0;
      const minX = Math.min(selectionStart, selectionEnd);
      const maxX = Math.max(selectionStart, selectionEnd);

      if (maxX - minX > 8) {
        const tStart = Number(((minX / W) * dur).toFixed(2));
        const tEnd = Number(((maxX / W) * dur).toFixed(2));
        if (onRegionSelected) {
          onRegionSelected({ startTime: tStart, endTime: tEnd });
        }
        if (onOpenAnnotations) {
          onOpenAnnotations();
        }
      }
    }
  };

  return (
    <div
      className="clinical-card"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={17} color="#7C3AED" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bản Đồ Phổ Tần Âm Học Lâm Sàng (Mel-Spectrogram)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Hiển thị mật độ năng lượng âm thanh theo dải tần số 50Hz - 4000Hz
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            64 Mel Bands (Magma Colormap)
          </span>

          {/* Quick Drawer Open Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAnnotations}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            title="Mở bảng ghi chú & đánh dấu vùng bất thường"
          >
            <Edit3 size={14} color="var(--primary)" />
            <span>Ghi chú {annotationCount > 0 ? `(${annotationCount})` : ''}</span>
          </button>
        </div>
      </div>

      {/* 2. Spectrogram Canvas Container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '210px',
          background: '#04070D',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          cursor: 'crosshair',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Background Canvas: Bitmap Mel Spectrogram */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Foreground Canvas: Grid, Playhead, Selection */}
        <canvas
          ref={overlayCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(4,7,13,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#38BDF8',
              fontSize: '0.85rem',
            }}
          >
            <Loader2 size={18} className="animate-spin" />
            <span>Đang tính toán ma trận phổ Decibel...</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FB7185',
              fontSize: '0.85rem',
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3. Colorbar Gradient Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Kéo chuột trên phổ để khoanh vùng tiếng thở lạ (Ran rít / Ran nổ)
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-80 dB (Tĩnh)</span>
          <div
            style={{
              width: '120px',
              height: '8px',
              borderRadius: '4px',
              background:
                'linear-gradient(90deg, #000004 0%, #51127C 25%, #B63679 50%, #FB8861 75%, #FCFDBF 100%)',
              border: '1px solid #CBD5E1',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 600 }}>0 dB (Đỉnh)</span>
        </div>
      </div>
    </div>
  );
}
