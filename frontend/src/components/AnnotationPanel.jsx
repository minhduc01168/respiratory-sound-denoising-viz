import React, { useState, useEffect } from 'react';
import { Edit3, Tag, Plus, Trash2, Clock, Check, User, AlertCircle, Loader2 } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Wheeze', name: 'Ran rít', color: 'badge-amber', bg: '#F59E0B' },
  { label: 'Crackle', name: 'Ran nổ', color: 'badge-rose', bg: '#F43F5E' },
  { label: 'Rhonchi', name: 'Ran ngáy', color: 'badge-cyan', bg: '#8B5CF6' },
  { label: 'Stridor', name: 'Rít thanh quản', color: 'badge-amber', bg: '#F97316' },
  { label: 'Cough', name: 'Tiếng ho', color: 'badge-cyan', bg: '#06B6D4' },
  { label: 'Artifact', name: 'Tạp âm cơ học', color: 'badge-secondary', bg: '#64748B' },
];

export default function AnnotationPanel({ audioId, selectedRegion, onClearRegion }) {
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [startTime, setStartTime] = useState('0.00');
  const [endTime, setEndTime] = useState('1.50');
  const [selectedTag, setSelectedTag] = useState('Wheeze');
  const [clinicalNote, setClinicalNote] = useState('');
  const [doctorName, setDoctorName] = useState('BS. Chuyên Khoa Hô Hấp');

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
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Annotations fetch error:', err);
        setIsLoading(false);
      });
  }, [audioId]);

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
      setAnnotations((prev) => [...prev, saved].sort((a, b) => a.start_time - b.start_time));
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
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <aside className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '620px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit3 size={18} color="#10B981" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Gán Nhãn Lâm Sàng (Take-Note)</h3>
        </div>
        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
          {annotations.length} GHI CHÚ
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSaveAnnotation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        {/* Time Region Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
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
                background: 'var(--bg-darker)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.5rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>&rarr;</div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
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
                background: 'var(--bg-darker)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.5rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </div>

        {/* Quick-Tags Selector */}
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
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
                    background: isSelected ? qt.bg : 'rgba(255,255,255,0.06)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? qt.bg : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {qt.label} ({qt.name})
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Textarea */}
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Mô tả lâm sàng & khuyến nghị:
          </label>
          <textarea
            rows={2}
            value={clinicalNote}
            onChange={(e) => setClinicalNote(e.target.value)}
            placeholder="Ví dụ: Tiếng rít âm sắc cao thì thở ra, giảm sau khí dung..."
            style={{
              width: '100%',
              background: 'var(--bg-darker)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8rem',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FB7185', fontSize: '0.75rem' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Lưu Chẩn Đoán Vào Bệnh Án</span>
            </>
          )}
        </button>
      </form>

      {/* Annotations List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', maxHeight: '350px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hồ sơ các mốc bất thường đã ghi nhận:
        </span>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Loader2 size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} />
            <span>Đang tải danh sách...</span>
          </div>
        ) : annotations.length === 0 ? (
          <div style={{
            flex: 1,
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}>
            Chưa có ghi chú nào. Dùng chuột kéo chọn vùng trên phổ tần số để tạo ghi chú đầu tiên.
          </div>
        ) : (
          annotations.map((ann) => (
            <div
              key={ann.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className={`badge ${ann.tag === 'Wheeze' ? 'badge-amber' : (ann.tag === 'Crackle' ? 'badge-rose' : 'badge-cyan')}`} style={{ fontSize: '0.65rem' }}>
                    {ann.tag}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>
                    {ann.start_time.toFixed(2)}s - {ann.end_time.toFixed(2)}s
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteAnnotation(ann.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.2rem'
                  }}
                  title="Xóa ghi chú này"
                >
                  <Trash2 size={14} color="#FB7185" />
                </button>
              </div>

              {ann.clinical_note && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {ann.clinical_note}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <User size={11} />
                <span>{ann.doctor_name || 'BS. Chuyên Khoa'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
