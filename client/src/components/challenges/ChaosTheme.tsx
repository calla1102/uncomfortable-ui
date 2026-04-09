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
  const containerRef = useRef<HTMLDivElement>(null);
  const switchCountRef = useRef(0);

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

    // 속도가 빠를수록 테마 전환
    if (currentSpeed > 15) {
      setIsDark(prev => !prev);
      setSwitchCount(c => {
        const next = c + 1;
        switchCountRef.current = next;
        if (next >= 20 && !completed) {
          setCompleted(true);
          addScore(300);
          completeChallenge('chaos-theme');
          onComplete?.();
        }
        return next;
      });
      addStress(2);
    }
  }, [completed, addStress, addScore, completeChallenge, onComplete]);

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
        className="relative overflow-hidden transition-all duration-100"
        style={{
          height: '200px',
          background: isDark ? '#050505' : '#F5F5F5',
          border: `1px solid ${isDark ? '#00FF41' : '#FF006E'}`,
          cursor: 'none',
        }}
      >
        {/* 내용 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <p
            className="pixel-text"
            style={{
              color: isDark ? '#00FF41' : '#000',
              fontSize: '0.7rem',
              transition: 'color 0.1s',
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
                  background: isDark ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.1)',
                  border: `1px solid ${isDark ? 'rgba(0,255,65,0.3)' : 'rgba(0,0,0,0.3)'}`,
                  color: isDark ? '#00FF41' : '#000',
                  fontSize: '0.45rem',
                  transition: 'all 0.1s',
                }}
              >
                {btn}
              </div>
            ))}
          </div>

          <p
            style={{
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              fontFamily: 'Galmuri11, Space Mono, monospace',
              fontSize: '0.6rem',
              transition: 'color 0.1s',
            }}
          >
            마우스 속도: {speed}
          </p>
        </div>

        {/* 전환 플래시 */}
        <motion.div
          key={switchCount}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? '#fff' : '#000' }}
        />
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>전환 횟수: {switchCount}/20</span>
        <span>현재: {isDark ? '다크' : '라이트'} 모드</span>
      </div>
    </div>
  );
}
