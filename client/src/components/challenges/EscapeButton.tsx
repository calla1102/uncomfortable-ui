/**
 * EscapeButton - 마우스가 다가가면 도망가는 확인 버튼
 * Design: Retro Arcade Suffering
 * Challenge: 정밀도 테스트 (Precision Tasks)
 */
import { useStress } from '@/contexts/StressContext';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete?: () => void;
}

export default function EscapeButton({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const containerRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const [catchCount, setCatchCount] = useState(0);
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [isNear, setIsNear] = useState(false);
  const [proximity, setProximity] = useState(1); // 1=멀다, 0=매우 가깝다

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 20 });
  const springY = useSpring(y, { stiffness: 400, damping: 20 });

  const getRandomPos = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const maxX = rect.width - 120;
    const maxY = rect.height - 50;
    return {
      x: Math.random() * maxX - maxX / 2,
      y: Math.random() * maxY - maxY / 2,
    };
  }, []);

  useEffect(() => {
    const pos = getRandomPos();
    setBtnPos(pos);
    x.set(pos.x);
    y.set(pos.y);
  }, [getRandomPos, x, y]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (completed) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const dx = mouseX - btnPos.x;
    const dy = mouseY - btnPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const opacity = Math.min(1, dist / 200);
    setProximity(opacity);

    if (dist < 130) {
      setIsNear(true);

      setEscapeCount(prev => {
        const newCount = prev + 1;

        // 3번: 도망 횟수가 늘수록 거리 증가 (최대 300)
        const escapeDist = Math.min(300, 170 + newCount * 8);

        // 4번: 30% 확률로 예측 불가능한 방향으로 도망
        const baseAngle = Math.atan2(dy, dx);
        const randomOffset = Math.random() < 0.3
          ? (Math.random() * 2 - 1) * Math.PI  // 완전 랜덤 방향
          : (Math.random() - 0.5) * (Math.PI / 2); // ±90도 편차
        const escapeAngle = baseAngle + Math.PI + randomOffset;

        const escapeX = btnPos.x + Math.cos(escapeAngle) * escapeDist;
        const escapeY = btnPos.y + Math.sin(escapeAngle) * escapeDist;

        const rect2 = container.getBoundingClientRect();
        const clampedX = Math.max(-rect2.width / 2 + 60, Math.min(rect2.width / 2 - 60, escapeX));
        const clampedY = Math.max(-rect2.height / 2 + 25, Math.min(rect2.height / 2 - 25, escapeY));
        setBtnPos({ x: clampedX, y: clampedY });
        x.set(clampedX);
        y.set(clampedY);
        addStress(2);
        return newCount;
      });
    } else {
      setIsNear(false);
    }
  }, [completed, btnPos, x, y, addStress]);

  // 6번: 마우스가 컨테이너 밖으로 나가면 버튼 위치 리셋
  const handleMouseLeave = useCallback(() => {
    if (completed) return;
    const pos = getRandomPos();
    setBtnPos(pos);
    x.set(pos.x);
    y.set(pos.y);
    setIsNear(false);
    setProximity(1);
    addStress(5);
  }, [completed, getRandomPos, x, y, addStress]);

  const handleClick = useCallback(() => {
    if (completed) return;
    setCatchCount(c => c + 1);
    setCompleted(true);
    addScore(400);
    completeChallenge('escape-button');
    onComplete?.();
  }, [completed, addScore, completeChallenge, onComplete]);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.6)', fontFamily: 'Galmuri11, Space Mono, monospace' }}>
        "확인" 버튼을 클릭하세요
      </p>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="arcade-panel relative overflow-hidden"
        style={{ height: '200px', cursor: 'crosshair' }}
      >
        {/* 배경 격자 */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <motion.button
          style={{
            x: springX, y: springY,
            position: 'absolute', top: '50%', left: '50%',
            translateX: '-50%', translateY: '-50%',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '0.55rem',
            background: completed ? '#00FF41' : isNear ? '#FF006E' : 'transparent',
            color: completed ? '#000' : isNear ? '#fff' : '#00FF41',
            border: `2px solid ${completed ? '#00FF41' : isNear ? '#FF006E' : '#00FF41'}`,
            boxShadow: isNear ? '0 0 20px #FF006E' : '0 0 10px rgba(0,255,65,0.5)',
            opacity: completed ? 1 : proximity,
            cursor: completed ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          } as React.CSSProperties}
          onClick={handleClick}
          whileTap={{ scale: 0.9 }}
          className={`pixel-text px-4 py-2 transition-all z-10 ${completed ? 'opacity-100' : ''}`}
        >
          {completed ? '✓ 잡았다!' : '확인'}
        </motion.button>

        {/* 도망 횟수 표시 */}
        {escapeCount > 0 && !completed && (
          <motion.div
            key={escapeCount}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            className="absolute top-4 right-4 pixel-text neon-pink"
            style={{ fontSize: '0.5rem', pointerEvents: 'none' }}
          >
            도망! +{escapeCount}
          </motion.div>
        )}
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>도망 횟수: {escapeCount}</span>
        <span>클릭 성공: {catchCount}</span>
      </div>
    </div>
  );
}
