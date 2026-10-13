import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, UploadCloud, Mic } from 'lucide-react';

export default function WebsiteIntroBanner({
  onOpenUpload,
  onOpenRecord,
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('rsdv_intro_expanded');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    try {
      localStorage.setItem('rsdv_intro_expanded', JSON.stringify(nextState));
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="clinical-card"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: isExpanded ? '1.25rem 1.5rem' : '0.85rem 1.25rem',
        boxShadow: 'var(--shadow-panel)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #0284C7 0%, #0D9488 50%, #6366F1 100%)',
        }}
      />

      {/* Header bar of Intro */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={toggleExpand}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #E0F2FE 0%, #CCFBF1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={18} color="#0284C7" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Hệ Thống Khử Nhiễu & Trực Quan Hóa Âm Thanh Hô Hấp Lâm Sàng
              </h2>
            </div>
            {!isExpanded && (
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.15rem',
                  marginBottom: 0,
                }}
              >
                Công cụ lọc sạch tạp âm môi trường và tiếng cọ xát ống nghe, bảo toàn 100% tiếng ran nổ, ran rít và dấu hiệu bệnh lý. Bấm để xem chi tiết.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>{isExpanded ? 'Thu gọn' : 'Xem hướng dẫn'}</span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.9rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Main Description */}
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Hệ thống hỗ trợ lọc sạch <strong>tạp âm môi trường, tiếng ồn phòng khám và tiếng cọ xát ống nghe</strong> trong các bản ghi âm phổi. Khác với các phần mềm lọc ồn thông thường dễ làm mất dấu hiệu bệnh, <strong>hệ thống ứng dụng giải thuật xử lý tín hiệu thông minh kết hợp trí tuệ nhân tạo (AI)</strong> để loại bỏ tiếng ồn nhưng vẫn <em>giữ nguyên vẹn các âm bệnh lý quan trọng (như tiếng ran nổ, ran rít, khò khè hay tiếng ho)</em>, giúp việc chẩn đoán hô hấp chính xác và rõ ràng hơn.
          </p>

          {/* 3-Step Workflow Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Thu Âm / Tải Tệp Âm Học
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Nạp tệp âm thanh lâm sàng (.wav, .mp3) hoặc thu âm trực tiếp từ ống nghe điện tử / microphone. Hệ thống tự động vô hiệu hóa bộ lọc nén trình duyệt để thu nhận toàn vẹn tín hiệu thô.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  2
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Khử Nhiễu Kép Thông Minh
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Tự động nhận diện và áp dụng bộ lọc thông minh phù hợp cho từng loại âm thanh (âm thở phổi hoặc tiếng ho/giọng nói), vừa làm sạch tạp âm vừa bảo toàn trọn vẹn đặc trưng bệnh học.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#6366F1',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Đối Chiếu Phổ & Báo Cáo
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Nghe chuyển đổi A-B (Gốc vs Đã lọc) tức thì, quan sát biểu đồ Mel-Spectrogram độ phân giải cao, xem tự động kết luận âm học và xuất phiếu chẩn đoán lâm sàng PDF.
              </p>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Bắt đầu nhanh:
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={onOpenUpload}
            >
              <UploadCloud size={13} color="#0284C7" />
              <span>Tải tệp âm thanh</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={onOpenRecord}
            >
              <Mic size={13} color="#E11D48" />
              <span>Thu âm trực tiếp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
