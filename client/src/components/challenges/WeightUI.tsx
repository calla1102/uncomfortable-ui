/**
 * WeightUI - 무게 중심 UI
 * 커서가 움직이면 모든 버튼이 그쪽으로 쏠려 겹쳐버립니다
 */
import { useStress } from '@/contexts/StressContext';
import { useRef, useState } from 'react';

const CONTAINER_W = 340;
const CONTAINER_H = 200;
const BTN_W = 64;
const BTN_H = 34;
const TILT = 155; // 최대 쏠림 (px)

const BUTTONS = [
  { id: 0, label: '취소', baseX: 12,  baseY: 52  },
  { id: 1, label: '저장', baseX: 90,  baseY: 52  },
  { id: 2, label: '확인', baseX: 168, baseY: 52  },
  { id: 3, label: '제출', baseX: 246, baseY: 52  },
  { id: 4, label: '입력', baseX: 12,  baseY: 110 },
  { id: 5, label: '검색', baseX: 90,  baseY: 110 },
  { id: 6, label: '삭제', baseX: 168, baseY: 110 },
  { id: 7, label: '완료', baseX: 246, baseY: 110 },
];

function pickNext(exclude: number): number {
  let n: number;
  do { n = Math.floor(Math.random() * BUTTONS.length); } while (n === exclude);
  return n;
}

export default function WeightUI({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [ratioX, setRatioX] = useState(0); // -1 ~ 1
  const [ratioY, setRatioY] = useState(0); // -1 ~ 1
  const [targetId, setTargetId] = useState(2); // '확인' 부터 시작
  const [clickCount, setClickCount] = useState(0);
  const [msg, setMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setRatioX(((e.clientX - r.left) / r.width - 0.5) * 2);
    setRatioY(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  const handleMouseLeave = () => { setRatioX(0); setRatioY(0); };

  const handleClick = (id: number) => {
    if (id !== targetId) {
      addStress(6);
      setMsg('틀린 버튼! ⚠');
      setTimeout(() => setMsg(''), 900);
      return;
    }
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 7 && !completedRef.current) {
      completedRef.current = true;
      addScore(450);
      completeChallenge('weight-ui');
      onComplete?.();
    } else {
      setTargetId(pickNext(id));
    }
  };

  // 버튼마다 쏠림 배율을 살짝 다르게 → 겹칠 때 순서가 뒤섞임
  const shiftX = (baseX: number) => {
    const centerDist = (baseX + BTN_W / 2 - CONTAINER_W / 2) / (CONTAINER_W / 2);
    return ratioX * TILT * (1 - centerDist * 0.2);
  };
  const shiftY = (baseY: number) => {
    const centerDist = (baseY + BTN_H / 2 - CONTAINER_H / 2) / (CONTAINER_H / 2);
    return ratioY * 50 * (1 - centerDist * 0.3);
  };

  return (
    <div className="space-y-2">
      {/* 기울기 미터 */}
      <div className="flex gap-2 items-center">
        <span style={{ color: 'rgba(0,180,255,0.5)', fontFamily: 'monospace', fontSize: '0.5rem' }}>기울기</span>
        <div style={{ flex: 1, height: 4, background: '#111', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '50%', width: 2, background: 'rgba(255,255,255,0.1)',
          }} />
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${50 + ratioX * 50}%`, width: 3,
            background: Math.abs(ratioX) > 0.6 ? '#FF006E' : '#00B4FF',
            transform: 'translateX(-50%)',
            transition: 'left 0.04s',
          }} />
        </div>
        <span style={{ color: Math.abs(ratioX) > 0.6 ? '#FF006E' : 'rgba(0,180,255,0.5)', fontFamily: 'monospace', fontSize: '0.5rem' }}>
          {Math.round(ratioX * 100)}%
        </span>
      </div>

      {/* 목표 표시 */}
      <div className="flex justify-between items-center">
        <span style={{ color: '#00B4FF', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          클릭 목표: <strong style={{ color: '#FFE600' }}>"{BUTTONS.find(b => b.id === targetId)?.label}"</strong>
        </span>
        <span style={{ color: 'rgba(0,180,255,0.4)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          {clickCount}/7
        </span>
      </div>

      {/* 메인 영역 */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: CONTAINER_W, height: CONTAINER_H,
          background: '#020202',
          border: '1px solid rgba(0,180,255,0.2)',
          overflow: 'hidden',
          cursor: 'crosshair',
          userSelect: 'none',
        }}
      >
        {/* 중앙 가이드선 */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          width: 1, background: 'rgba(255,230,0,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 1, background: 'rgba(255,230,0,0.06)', pointerEvents: 'none',
        }} />

        {/* 버튼들 */}
        {BUTTONS.map(btn => {
          const x = btn.baseX + shiftX(btn.baseX);
          const y = btn.baseY + shiftY(btn.baseY);
          const isTarget = btn.id === targetId;
          return (
            <div
              key={btn.id}
              onClick={() => handleClick(btn.id)}
              style={{
                position: 'absolute',
                left: x, top: y,
                width: BTN_W, height: BTN_H,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isTarget ? 'rgba(255,230,0,0.18)' : 'rgba(0,180,255,0.06)',
                border: `1px solid ${isTarget ? '#FFE600' : 'rgba(0,180,255,0.25)'}`,
                color: isTarget ? '#FFE600' : 'rgba(0,180,255,0.5)',
                cursor: 'pointer',
                fontFamily: 'Galmuri11, monospace',
                fontSize: '0.7rem',
                fontWeight: isTarget ? 'bold' : 'normal',
                boxShadow: isTarget ? '0 0 12px rgba(255,230,0,0.4)' : 'none',
                zIndex: isTarget ? 10 : 1,
                transition: 'left 0.03s, top 0.03s',
              }}
            >
              {btn.label}
            </div>
          );
        })}

        {/* 커서가 중앙에서 멀 때 경고 */}
        {Math.abs(ratioX) > 0.5 && (
          <div style={{
            position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center',
            color: '#FF006E', fontFamily: 'monospace', fontSize: '0.45rem', pointerEvents: 'none',
          }}>
            ⚠ 버튼이 쏠리고 있습니다
          </div>
        )}
      </div>

      {msg && (
        <p style={{ color: '#FF006E', fontFamily: 'monospace', fontSize: '0.6rem' }}>⚠ {msg}</p>
      )}
      <p style={{ color: 'rgba(0,180,255,0.2)', fontFamily: 'monospace', fontSize: '0.48rem' }}>
        커서가 왼쪽/오른쪽으로 가면 모든 버튼이 쏠립니다 — 노란 버튼만 7번 클릭하세요
      </p>
    </div>
  );
}
