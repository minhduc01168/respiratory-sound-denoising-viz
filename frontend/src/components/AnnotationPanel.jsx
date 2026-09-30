import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Trash2, User, AlertCircle, Loader2, X } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Wheeze', name: 'Ran rít (Hen)', bg: '#D97706' },
  { label: 'Crackle', name: 'Ran nổ (Viêm phổi)', bg: '#E11D48' },
  { label: 'Rhonchi', name: 'Ran ngáy', bg: '#7C3AED' },
  { label: 'Stridor', name: 'Rít thanh quản', bg: '#EA580C' },
  { label: 'Cough', name: 'Tiếng ho', bg: '#0284C7' },
  { label: 'Artifact', name: 'Tạp âm cơ học', bg: '#64748B' },
];

export default function AnnotationPanel({
  isOpen = false,
  onClose,
  audioId,
  selectedRegion,
  onClearRegion,
  onAnnotationsChanged,
}) {
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [startTime, setStartTime] = useState('0.00');
  const [endTime, setEndTime] = useState('1.50');
  const [selectedTag, setSelectedTag] = useState('Wheeze');
  const [clinicalNote, setClinicalNote] = useState('');
  const [doctorName] = useState('BS. Chuyên Khoa Hô Hấp');

  // Update form times when user selects region on spectrogram
  useEffect(() => {
    if (selectedRegion) {
      setStartTime(selectedRegion.startTime.toFixed(2));
      setEndTime(selectedRegion.endTime.toFixed(2));
    }
  }, [selectedRegion]);

  // Fetch existing annotations whenever audioId changes
  useEffect(() => {
    if (!audioId) return;
    setIsLoading(true);
    fetch(`/api/annotations/${audioId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải danh sách ghi chú');
        return res.json();
      })
      .then((data) => {
        setAnnotations(data);
        if (onAnnotationsChanged) onAnnotationsChanged(data.length);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Annotations fetch error:', err);
        setIsLoading(false);
      });
  }, [audioId, onAnnotationsChanged]);

  const handleSaveAnnotation = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      setErrorMsg('Khoảng thời gian không hợp lệ (Bắt đầu >= 0 và Kết thúc > Bắt đầu).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_id: audioId,
          start_time: start,
          end_time: end,
          tag: selectedTag,
          clinical_note: clinicalNote.trim(),
          doctor_name: doctorName.trim() || 'BS. Chuyên Khoa',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Lỗi khi lưu ghi chú');
      }

      const saved = await res.json();
      const updated = [...annotations, saved].sort((a, b) => a.start_time - b.start_time);
      setAnnotations(updated);
      if (onAnnotationsChanged) onAnnotationsChanged(updated.length);
      setClinicalNote('');
      if (onClearRegion) onClearRegion();
      setIsSubmitting(false);
    } catch (err) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnotation = async (id) => {
    try {
      const res = await fetch(`/api/annotations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Không thể xóa ghi chú');
      const updated = annotations.filter((a) => a.id !== id);
      setAnnotations(updated);
      if (onAnnotationsChanged) onAnnotationsChanged(updated.length);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <aside className="drawer-panel" style={{ padding: '1.5rem', overflowY: 'auto' }}>
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Ghi Chú Lâm Sàng {annotations.length > 0 && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>({annotations.length})</span>}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Lưu mốc âm thanh bất thường vào bệnh án
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Đóng bảng ghi chú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Add New Annotation */}
        <form
          onSubmit={handleSaveAnnotation}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            + Thêm Mốc Bất Thường Mới
          </div>

          {/* Time Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                Bắt đầu (giây)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 700 }}>
              &rarr;
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                Kết thúc (giây)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Quick-Tags Selector */}
          <div>
            <label
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              Phân loại âm bệnh học:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {QUICK_TAGS.map((qt) => {
                const isSelected = selectedTag === qt.label;
                return (
                  <button
                    type="button"
                    key={qt.label}
                    onClick={() => setSelectedTag(qt.label)}
                    style={{
                      background: isSelected ? qt.bg : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? qt.bg : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.3rem 0.55rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: isSelected ? 700 : 500,
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {qt.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Textarea */}
          <div>
            <label
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Mô tả lâm sàng & đề xuất:
            </label>
            <textarea
              rows={2}
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              placeholder="VD: Tiếng rít âm sắc cao ở thì thở ra, nghi ngờ co thắt phế quản..."
              style={{
                width: '100%',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.65rem',
                fontSize: '0.8rem',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--rose-danger)',
                fontSize: '0.75rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Plus size={15} />
                <span>Lưu Mốc Này Vào Bệnh Án</span>
              </>
            )}
          </button>
        </form>

        {/* Existing Annotations List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Các Mốc Đã Ghi Nhận ({annotations.length})
          </div>

          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              <Loader2 size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} />
              <span>Đang tải danh sách...</span>
            </div>
          ) : annotations.length === 0 ? (
            <div
              style={{
                border: '1.5px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            >
              Chưa có mốc nào. Quét chọn 1 đoạn trên phổ tần để tự động điền thời gian và thêm ghi chú.
            </div>
          ) : (
            annotations.map((ann) => (
              <div
                key={ann.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span
                      className={`badge ${
                        ann.tag === 'Wheeze'
                          ? 'badge-amber'
                          : ann.tag === 'Crackle'
                          ? 'badge-rose'
                          : 'badge-cyan'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {ann.tag}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--primary)',
                      }}
                    >
                      {ann.start_time.toFixed(2)}s &rarr; {ann.end_time.toFixed(2)}s
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(ann.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                    title="Xóa mốc này"
                  >
                    <Trash2 size={14} color="#E11D48" />
                  </button>
                </div>

                {ann.clinical_note && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginTop: '0.15rem',
                    }}
                  >
                    {ann.clinical_note}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem',
                  }}
                >
                  <User size={11} />
                  <span>{ann.doctor_name || 'BS. Chuyên Khoa'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
