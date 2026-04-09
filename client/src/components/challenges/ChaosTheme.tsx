/**
 * ChaosTheme - 마우스 속도에 따라 테마가 미친 듯이 전환되는 컴포넌트
 * Design: Retro Arcade Suffering
 * Challenge: 시각적 혼란 (Visual Chaos)
 */
import { useStress } from '@/contexts/StressContext';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete?: () => void;
}

export default function ChaosTheme({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [isDark, setIsDark] = useState(true);
  const [switchCount, setSwitchCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [speed, setSpeed] = useState(0);
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const lastMoveTimeRef = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const switchCountRef = useRef(0);
  const completedRef = useRef(false);

  const doSwitch = useCallback((isAuto = false) => {
    setIsDark(prev => !prev);
    setSwitchCount(c => {
      // 10% 확률로 진행 감소
      const roll = Math.random();
      const delta = roll < 0.1 ? -1 : 1;
      const next = Math.max(0, c + delta);
      switchCountRef.current = next;
      if (next >= 20 && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        addScore(300);
        completeChallenge('chaos-theme');
        onComplete?.();
      }
      return next;
    });
    addStress(isAuto ? 1 : 2);
  }, [addStress, addScore, completeChallenge, onComplete]);

  // 마우스가 3초간 멈추면 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      if (completedRef.current) return;
      const now = Date.now();
      if (now - lastMoveTimeRef.current > 3000) {
        doSwitch(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [doSwitch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    const dt = now - lastPos.current.time;
    if (dt < 16) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const currentSpeed = dist / dt * 100;

    setSpeed(Math.round(currentSpeed));
    lastPos.current = { x: e.clientX, y: e.clientY, time: now };
    lastMoveTimeRef.current = now;

    if (currentSpeed > 15) {
      doSwitch(false);
    }
  }, [doSwitch]);

  const progress = Math.min(100, (switchCount / 20) * 100);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.6)', fontFamily: 'Galmuri11, Space Mono, monospace' }}>
        마우스를 빠르게 움직이면 테마가 전환됩니다 (20회 달성 시 완료)
      </p>

      {/* 진행 바 */}
      <div className="h-1 w-full" style={{ background: '#111', border: '1px solid rgba(0,255,65,0.2)' }}>
        <motion.div
          className="h-full"
          animate={{ width: `${progress}%` }}
          style={{ background: completed ? '#00FF41' : '#FF006E' }}
        />
      </div>

      {/* 인터랙티브 영역 */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden"
        style={{
          height: '200px',
          background: isDark ? '#050505' : '#FFFFFF',
          border: `2px solid ${isDark ? '#00FF41' : '#FF0050'}`,
          cursor: 'none',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <p
            className="pixel-text"
            style={{
              color: isDark ? '#00FF41' : '#FF0050',
              fontSize: '0.7rem',
            }}
          >
            {isDark ? '🌙 DARK MODE' : '☀️ LIGHT MODE'}
          </p>

          <div className="flex gap-3">
            {['버튼 1', '버튼 2', '버튼 3'].map(btn => (
              <div
                key={btn}
                className="px-3 py-1 pixel-text"
                style={{
                  background: isDark ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,80,0.12)',
                  border: `1px solid ${isDark ? 'rgba(0,255,65,0.3)' : 'rgba(255,0,80,0.6)'}`,
                  color: isDark ? '#00FF41' : '#FF0050',
                  fontSize: '0.45rem',
                }}
              >
                {btn}
              </div>
            ))}
          </div>

          <p
            style={{
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,0,80,0.6)',
              fontFamily: 'Galmuri11, Space Mono, monospace',
              fontSize: '0.6rem',
            }}
          >
            마우스 속도: {speed}
          </p>
        </div>

        {/* 전환 플래시 — opacity 1로 강렬하게 */}
        <motion.div
          key={switchCount}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? '#FFFFFF' : '#000000' }}
        />
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>전환 횟수: {switchCount}/20</span>
        <span>현재: {isDark ? '다크' : '라이트'} 모드</span>
      </div>
    </div>
  );
}
