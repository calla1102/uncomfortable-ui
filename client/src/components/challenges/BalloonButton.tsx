/**
 * BalloonButton - 풍선 버튼
 * 모든 버튼이 헬륨 풍선처럼 위로 떠오릅니다.
 * 놓치면 화면 밖으로 사라져 5초 뒤 아래에서 재등장.
 * 7개 버튼을 각각 1번씩 클릭하면 완료.
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState, useCallback } from 'react';

const CONTAINER_W = 340;
const CONTAINER_H = 220;
const BTN_W = 58;
const BTN_H = 32;

interface Balloon {
  id: number;
  label: string;
  x: number;
  vy: number;         // px/frame (negative = up)
  y: number;
  escaped: boolean;   // 화면 밖으로 사라졌는지
  respawnTimer: number; // ms 남음
  clicked: boolean;
  wobble: number;     // 좌우 흔들림 phase
  wobbleAmp: number;  // 흔들림 폭
}

const LABELS = ['클릭', '확인', '저장', '제출', '완료', '입력', '선택'];
const BASE_VY = -0.55; // 기본 상승 속도 (px/frame)
const RESPAWN_MS = 5000;

function initBalloons(): Balloon[] {
  return LABELS.map((label, i) => ({
    id: i,
    label,
    x: 20 + (i % 5) * 64,
    y: CONTAINER_H - 50 - Math.random() * 60,
    vy: BASE_VY - Math.random() * 0.35,
    escaped: false,
    respawnTimer: 0,
    clicked: false,
    wobble: Math.random() * Math.PI * 2,
    wobbleAmp: 8 + Math.random() * 12,
  }));
}

export default function BalloonButton({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [balloons, setBalloons] = useState<Balloon[]>(initBalloons);
  const [clickedSet, setClickedSet] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState('');
  const completedRef = useRef(false);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const balloonsRef = useRef<Balloon[]>(balloons);

  // keep ref in sync
  useEffect(() => { balloonsRef.current = balloons; }, [balloons]);

  const handleClick = useCallback((id: number) => {
    if (completedRef.current) return;
    const b = balloonsRef.current.find(b => b.id === id);
    if (!b || b.escaped || b.clicked) return;

    setBalloons(prev => prev.map(b => b.id === id ? { ...b, clicked: true } : b));
    setClickedSet(prev => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === LABELS.length && !completedRef.current) {
        completedRef.current = true;
        addScore(500);
        completeChallenge('balloon-button');
        onComplete?.();
      }
      return next;
    });
  }, [addScore, completeChallenge, onComplete]);

  useEffect(() => {
    const loop = (ts: number) => {
      const dt = Math.min(ts - (lastTimeRef.current || ts), 50);
      lastTimeRef.current = ts;

      setBalloons(prev => prev.map(b => {
        if (b.clicked) return b;

        if (b.escaped) {
          const remaining = b.respawnTimer - dt;
          if (remaining <= 0) {
            // 아래에서 재등장
            return {
              ...b,
              escaped: false,
              respawnTimer: 0,
              y: CONTAINER_H + BTN_H,
              x: 15 + Math.random() * (CONTAINER_W - BTN_W - 15),
              vy: BASE_VY - Math.random() * 0.35,
              wobble: Math.random() * Math.PI * 2,
            };
          }
          return { ...b, respawnTimer: remaining };
        }

        const newWobble = b.wobble + 0.04;
        const newX = b.x + Math.sin(newWobble) * 0.6;
        const newY = b.y + b.vy;

        // 좌우 벽 반동
        let resolvedX = newX;
        let resolvedVy = b.vy;
        if (resolvedX < 0) resolvedX = 0;
        if (resolvedX + BTN_W > CONTAINER_W) resolvedX = CONTAINER_W - BTN_W;

        // 화면 위로 탈출
        if (newY + BTN_H < 0) {
          addStress(4);
          return {
            ...b,
            escaped: true,
            respawnTimer: RESPAWN_MS,
            y: -BTN_H - 10,
          };
        }

        return { ...b, x: resolvedX, y: newY, vy: resolvedVy, wobble: newWobble };
      }));

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [addStress]);

  const clickedCount = clickedSet.size;

  return (
    <div className="space-y-2">
      {/* 상단 정보 */}
      <div className="flex justify-between items-center">
        <span style={{ color: '#00B4FF', fontFamily: 'monospace', fontSize: '0.55rem' }}>
          풍선 버튼 — 위로 떠오릅니다
        </span>
        <span style={{ color: 'rgba(0,180,255,0.5)', fontFamily: 'monospace', fontSize: '0.55rem' }}>
          {clickedCount}/{LABELS.length} 클릭
        </span>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 3, background: '#111', border: '1px solid rgba(0,180,255,0.1)' }}>
        <div style={{
          width: `${(clickedCount / LABELS.length) * 100}%`,
          height: '100%',
          background: clickedCount === LABELS.length ? '#00FF41' : '#00B4FF',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* 메인 영역 */}
      <div style={{
        position: 'relative',
        width: CONTAINER_W,
        height: CONTAINER_H,
        background: '#020202',
        border: '1px solid rgba(0,180,255,0.15)',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        {/* 상단 경고선 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'rgba(255,0,110,0.4)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,0,110,0.35)', fontFamily: 'monospace', fontSize: '0.4rem',
          pointerEvents: 'none',
        }}>
          ↑ 여기서 탈출하면 5초간 사라집니다
        </div>

        {balloons.map(b => {
          if (b.clicked) return null;
          if (b.escaped) {
            // 탈출 상태: 카운트다운 표시
            return (
              <div key={b.id} style={{
                position: 'absolute',
                left: 10 + (b.id % 5) * 62,
                bottom: 6,
                width: BTN_W,
                height: BTN_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,0,110,0.04)',
                border: '1px dashed rgba(255,0,110,0.15)',
                color: 'rgba(255,0,110,0.25)',
                fontFamily: 'Galmuri11, monospace',
                fontSize: '0.55rem',
              }}>
                {Math.ceil(b.respawnTimer / 1000)}s
              </div>
            );
          }

          const opacity = b.y < 60 ? Math.max(0.2, b.y / 60) : 1;

          return (
            <div
              key={b.id}
              onClick={() => handleClick(b.id)}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y,
                width: BTN_W,
                height: BTN_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,180,255,0.12)',
                border: '1px solid rgba(0,180,255,0.5)',
                color: '#00B4FF',
                cursor: 'pointer',
                fontFamily: 'Galmuri11, monospace',
                fontSize: '0.65rem',
                opacity,
                boxShadow: '0 0 8px rgba(0,180,255,0.2)',
                transition: 'opacity 0.1s',
                // 풍선 느낌 - 약간 둥글게
                borderRadius: 4,
              }}
            >
              {b.label}
            </div>
          );
        })}

        {/* 클릭된 버튼 체크 표시 */}
        {Array.from(clickedSet).map((id, i) => (
          <div key={`done-${id}`} style={{
            position: 'absolute',
            left: 10 + (i % 7) * 46,
            bottom: CONTAINER_H - 22,
            color: '#00FF41',
            fontFamily: 'monospace',
            fontSize: '0.5rem',
            pointerEvents: 'none',
            opacity: 0.6,
          }}>
            ✓{LABELS[id]}
          </div>
        ))}
      </div>

      {msg && (
        <p style={{ color: '#FF006E', fontFamily: 'monospace', fontSize: '0.55rem' }}>{msg}</p>
      )}
      <p style={{ color: 'rgba(0,180,255,0.2)', fontFamily: 'monospace', fontSize: '0.45rem' }}>
        풍선이 위로 떠오릅니다 — 탈출 전에 잡으세요 | 놓치면 5초 후 재등장
      </p>
    </div>
  );
}
