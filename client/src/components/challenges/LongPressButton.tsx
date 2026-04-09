/**
 * LongPressButton - 3초 이상 눌러야 입력되는 버튼
 * Design: Retro Arcade Suffering
 * Challenge: 입력의 고통 (Input Hell)
 */
import { useStress } from '@/contexts/StressContext';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const REQUIRED_HOLD_MS = 5000;
const BUTTONS = ['시작', '확인', '제출', '저장', '완료'];

interface Props {
  onComplete?: () => void;
}

export default function LongPressButton({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedButtons, setCompletedButtons] = useState<Set<number>>(new Set());
  const [currentBtn, setCurrentBtn] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const startTime = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnOffsetRef = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const isHolding = useRef(false);

  // 마우스 위치 추적
  useEffect(() => {
    const handler = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const startHold = useCallback(() => {
    if (allCompleted) return;
    setHolding(true);
    isHolding.current = true;
    startTime.current = Date.now();
    progressRef.current = 0;

    // 진행 추적
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const p = Math.min(100, (elapsed / REQUIRED_HOLD_MS) * 100);
      progressRef.current = p;
      setProgress(p);

      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (shakeRef.current) clearInterval(shakeRef.current);
        setBtnOffset({ x: 0, y: 0 });
        setHolding(false);
        setProgress(0);
        progressRef.current = 0;

        setCompletedButtons(prev => {
          const next = new Set(Array.from(prev));
          next.add(currentBtn);
          if (next.size >= BUTTONS.length) {
            setAllCompleted(true);
            addScore(500);
            completeChallenge('long-press');
            onComplete?.();
          } else {
            setCurrentBtn(c => c + 1);
          }
          return next;
        });
        addStress(-5);
      }
    }, 50);

    // 버튼 흔들림: 600ms마다 랜덤 이동 후 마우스가 따라왔는지 확인
    shakeRef.current = setInterval(() => {
      const range = 50;
      const newX = (Math.random() - 0.5) * range * 2;
      const newY = (Math.random() - 0.5) * range * 2;
      btnOffsetRef.current = { x: newX, y: newY };
      setBtnOffset({ x: newX, y: newY });

      // transition(0.5s) 완료 후 컨테이너 기준으로 마우스 위치 계산
      setTimeout(() => {
        if (!isHolding.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const btnSize = 128; // w-32
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        const btnLeft = centerX + btnOffsetRef.current.x - btnSize / 2;
        const btnTop  = centerY + btnOffsetRef.current.y - btnSize / 2;
        const { x, y } = mousePos.current;
        if (x < btnLeft || x > btnLeft + btnSize || y < btnTop || y > btnTop + btnSize) {
          isHolding.current = false;
          setHolding(false);
          setProgress(0);
          progressRef.current = 0;
          setBtnOffset({ x: 0, y: 0 });
          btnOffsetRef.current = { x: 0, y: 0 };
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (shakeRef.current) clearInterval(shakeRef.current);
          setFailCount(f => f + 1);
          addStress(8);
        }
      }, 520);
    }, 600);
  }, [allCompleted, currentBtn, addStress, addScore, completeChallenge, onComplete]);

  const endHold = useCallback(() => {
    if (!holding) return;
    isHolding.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (shakeRef.current) clearInterval(shakeRef.current);
    setBtnOffset({ x: 0, y: 0 });
    if (progressRef.current < 100) {
      setFailCount(f => f + 1);
      addStress(8);
    }
    setHolding(false);
    setProgress(0);
    progressRef.current = 0;
  }, [holding, addStress]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (shakeRef.current) clearInterval(shakeRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const progressColor = progress < 33 ? '#FF006E' : progress < 66 ? '#FFE600' : '#00FF41';

  return (
    <div className="space-y-4">
      {/* 버튼 목록 */}
      <div className="grid grid-cols-5 gap-2">
        {BUTTONS.map((btn, idx) => {
          const isDone = completedButtons.has(idx);
          const isCurrent = idx === currentBtn && !allCompleted;
          return (
            <div
              key={btn}
              className="text-center"
            >
              <div
                className="w-full h-8 flex items-center justify-center pixel-text"
                style={{
                  background: isDone ? 'rgba(0,255,65,0.1)' : 'transparent',
                  border: `1px solid ${isDone ? '#00FF41' : isCurrent ? '#FFE600' : 'rgba(255,255,255,0.1)'}`,
                  color: isDone ? '#00FF41' : isCurrent ? '#FFE600' : 'rgba(255,255,255,0.2)',
                  fontSize: '0.45rem',
                }}
              >
                {isDone ? '✓' : btn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 현재 버튼 */}
      {!allCompleted && (
        <div className="flex flex-col items-center gap-3">
          <p className="pixel-text" style={{ color: '#FFE600', fontSize: '0.55rem' }}>
            현재 버튼: "{BUTTONS[currentBtn]}"
          </p>

          {/* 홀드 버튼 */}
          <div ref={containerRef} className="relative" style={{ width: '8rem', height: '8rem' }}>
            <motion.button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              className="relative w-32 h-32 rounded-full overflow-hidden select-none"
              style={{
                position: 'absolute',
                left: `calc(50% + ${btnOffset.x}px - 4rem)`,
                top: `calc(50% + ${btnOffset.y}px - 4rem)`,
                transition: holding ? 'left 0.5s ease, top 0.5s ease' : 'none',
                background: holding ? `rgba(0,255,65,0.1)` : 'transparent',
                border: `3px solid ${holding ? progressColor : 'rgba(0,255,65,0.3)'}`,
                boxShadow: holding ? `0 0 20px ${progressColor}` : undefined,
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 진행 원형 */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke="rgba(0,255,65,0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke={progressColor}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.1s' }}
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <span className="pixel-text" style={{ color: holding ? progressColor : 'rgba(0,255,65,0.5)', fontSize: '0.5rem' }}>
                  {holding ? `${Math.round(progress)}%` : '꾹 누르기'}
                </span>
                {holding && (
                  <span className="pixel-text mt-1" style={{ color: progressColor, fontSize: '0.4rem' }}>
                    {((REQUIRED_HOLD_MS * (1 - progress / 100)) / 1000).toFixed(1)}초
                  </span>
                )}
              </div>
            </motion.button>
          </div>

          <p className="pixel-text" style={{ color: 'rgba(255,0,110,0.5)', fontSize: '0.45rem' }}>
            ⚠ 손을 떼면 초기화됩니다
          </p>
        </div>
      )}

      {allCompleted && (
        <div className="text-center">
          <p className="pixel-text neon-green" style={{ fontSize: '0.7rem' }}>✓ 모든 버튼 완료!</p>
        </div>
      )}

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>실패 횟수: {failCount}</span>
        <span>완료: {completedButtons.size}/{BUTTONS.length}</span>
      </div>
    </div>
  );
}
