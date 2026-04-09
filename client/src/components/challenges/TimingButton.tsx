/**
 * TimingButton - 특정 타이밍에만 클릭 가능한 리듬게임 버튼
 * Design: Retro Arcade Suffering
 * Challenge: 시간 기반 고문 (Time Torture)
 */
import { useStress } from '@/contexts/StressContext';
import { motion, useAnimation } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete?: () => void;
}

const BASE_WINDOW  = 0.15; // 활성화 윈도우 (초) - 기존 0.3에서 절반으로
const BASE_CYCLE   = 3;    // 기본 사이클 (초)
const REQUIRED_HITS = 5;   // 필요 성공 횟수 (기존 3 → 5)
const MISS_RESET_AT = 3;   // 미스 N번 시 히트 리셋

function randomActiveStart() {
  // 10%~65% 사이에서 랜덤 (끝에 걸리지 않게)
  return 10 + Math.random() * 55;
}

function randomFakeZones(activeStart: number, windowPct: number): { start: number; width: number }[] {
  const zones: { start: number; width: number }[] = [];
  let attempts = 0;
  while (zones.length < 2 && attempts < 20) {
    attempts++;
    const s = 5 + Math.random() * 80;
    const w = windowPct * (0.8 + Math.random() * 0.4);
    // 실제 구간과 겹치지 않게
    if (s + w < activeStart - 2 || s > activeStart + windowPct + 2) {
      zones.push({ start: s, width: w });
    }
  }
  return zones;
}

export default function TimingButton({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [phase, setPhase]       = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hits, setHits]         = useState(0);
  const [misses, setMisses]     = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback]   = useState<'hit' | 'miss' | 'reset' | null>(null);
  const [activeStart, setActiveStart] = useState(randomActiveStart);
  const [fakeZones, setFakeZones]     = useState(() => {
    const start = randomActiveStart();
    const windowPct = BASE_WINDOW * 100 / BASE_CYCLE * 100;
    return randomFakeZones(start, BASE_WINDOW * 100);
  });

  const controls   = useAnimation();
  const startTime  = useRef(Date.now());
  const rafRef     = useRef<number>(0);
  const hitsRef    = useRef(0);
  const missesRef  = useRef(0);
  const hitUsed    = useRef(false); // 현재 활성 구간에서 이미 히트했는지

  // 현재 사이클: 히트할수록 빨라짐
  const currentCycle = Math.max(1.0, BASE_CYCLE - hitsRef.current * 0.45);
  const windowPct    = (BASE_WINDOW / currentCycle) * 100;

  const reshuffleZones = useCallback((newStart: number) => {
    setActiveStart(newStart);
    setFakeZones(randomFakeZones(newStart, (BASE_WINDOW / Math.max(1.0, BASE_CYCLE - hitsRef.current * 0.45)) * 100));
  }, []);

  const animate = useCallback(() => {
    const cycle = Math.max(1.0, BASE_CYCLE - hitsRef.current * 0.45);
    const elapsed = (Date.now() - startTime.current) / 1000;
    const p = (elapsed % cycle) / cycle;
    setPhase(p);

    const winPct = (BASE_WINDOW / cycle) * 100;
    const activeS = (activeStart / 100);
    const active = p >= activeS && p <= activeS + BASE_WINDOW / cycle;
    if (!active) hitUsed.current = false; // 구간 벗어나면 리셋
    setIsActive(active);

    rafRef.current = requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStart]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const handleClick = useCallback(async () => {
    if (completed) return;

    if (isActive && !hitUsed.current) {
      hitUsed.current = true;
      const newHits = hitsRef.current + 1;
      hitsRef.current = newHits;
      setHits(newHits);
      setFeedback('hit');
      await controls.start({ scale: [1, 1.3, 1], transition: { duration: 0.2 } });
      addStress(-3);

      if (newHits >= REQUIRED_HITS) {
        setCompleted(true);
        addScore(400);
        completeChallenge('timing-button');
        onComplete?.();
      } else {
        // 구간 위치 랜덤 변경
        const newStart = randomActiveStart();
        reshuffleZones(newStart);
        startTime.current = Date.now(); // 사이클 리셋
      }
    } else {
      const newMisses = missesRef.current + 1;
      missesRef.current = newMisses;
      setMisses(newMisses);
      setFeedback('miss');
      await controls.start({ x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } });
      addStress(10);

      // 미스 3번마다 히트 리셋
      if (newMisses % MISS_RESET_AT === 0) {
        hitsRef.current = 0;
        setHits(0);
        setFeedback('reset');
        addStress(20);
        const newStart = randomActiveStart();
        reshuffleZones(newStart);
      }
    }
    setTimeout(() => setFeedback(null), 600);
  }, [completed, isActive, controls, addScore, addStress, completeChallenge, onComplete, reshuffleZones]);

  const barPos = phase * 100;

  return (
    <div className="space-y-4">
      {/* 속도 표시 */}
      <div className="flex justify-between items-center">
        <span className="pixel-text" style={{ color: 'rgba(0,255,65,0.5)', fontSize: '0.5rem' }}>타이밍 바</span>
        <span className="pixel-text" style={{ color: isActive ? '#00FF41' : '#FF006E', fontSize: '0.5rem' }}>
          {isActive ? '▶ 지금 클릭!' : '대기 중...'}
        </span>
        <span className="pixel-text" style={{ color: '#FFE600', fontSize: '0.45rem' }}>
          SPEED x{(BASE_CYCLE / Math.max(1.0, BASE_CYCLE - hitsRef.current * 0.45)).toFixed(1)}
        </span>
      </div>

      {/* 타이밍 바 */}
      <div
        className="relative h-8 w-full overflow-hidden"
        style={{ background: '#050505', border: '1px solid rgba(0,255,65,0.3)' }}
      >
        {/* 가짜 구간 (빨간) */}
        {fakeZones.map((z, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${z.start}%`,
              width: `${z.width}%`,
              background: 'rgba(255,0,110,0.2)',
              border: '1px solid rgba(255,0,110,0.5)',
            }}
          />
        ))}

        {/* 실제 활성 구간 (초록) */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: `${activeStart}%`,
            width: `${windowPct}%`,
            background: 'rgba(0,255,65,0.2)',
            border: '1px solid rgba(0,255,65,0.6)',
          }}
        />

        {/* 이동 커서 */}
        <motion.div
          className="absolute top-0 bottom-0 w-1"
          style={{
            left: `${barPos}%`,
            background: isActive ? '#00FF41' : '#FF006E',
            boxShadow: isActive ? '0 0 10px #00FF41' : '0 0 5px #FF006E',
          }}
        />

        {/* HIT 레이블 */}
        <div
          className="absolute top-1/2 pixel-text"
          style={{
            left: `${activeStart + windowPct / 2}%`,
            transform: 'translateX(-50%) translateY(-50%)',
            color: 'rgba(0,255,65,0.7)',
            fontSize: '0.4rem',
            pointerEvents: 'none',
          }}
        >
          HIT
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center">
        <motion.button
          animate={controls}
          onClick={handleClick}
          disabled={completed}
          className="relative"
          style={{
            width: '100px', height: '100px',
            borderRadius: '50%',
            background: completed ? '#00FF41' : isActive ? 'rgba(0,255,65,0.2)' : 'rgba(255,0,110,0.05)',
            border: `3px solid ${completed ? '#00FF41' : isActive ? '#00FF41' : 'rgba(255,0,110,0.4)'}`,
            boxShadow: isActive ? '0 0 30px #00FF41, 0 0 60px rgba(0,255,65,0.3)' : '0 0 5px rgba(255,0,110,0.2)',
            transition: 'background 0.1s, border-color 0.1s, box-shadow 0.1s',
            cursor: completed ? 'default' : 'pointer',
          }}
        >
          <span className="pixel-text" style={{ color: completed ? '#000' : isActive ? '#00FF41' : 'rgba(255,0,110,0.5)', fontSize: '0.5rem', display: 'block', textAlign: 'center' }}>
            {completed ? '✓ CLEAR' : 'CLICK'}
          </span>

          {feedback && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -40, scale: 1.5 }}
              transition={{ duration: 0.6 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 pixel-text"
              style={{
                color: feedback === 'hit' ? '#00FF41' : feedback === 'reset' ? '#FFE600' : '#FF006E',
                fontSize: '0.6rem',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {feedback === 'hit' ? 'PERFECT!' : feedback === 'reset' ? 'RESET!!' : 'MISS!'}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* 점수 */}
      <div className="flex justify-center gap-6">
        <div className="text-center">
          <p className="pixel-text neon-green" style={{ fontSize: '1rem' }}>{hits}</p>
          <p className="pixel-text" style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.45rem' }}>HIT</p>
        </div>
        <div className="text-center">
          <p className="pixel-text neon-pink" style={{ fontSize: '1rem' }}>{misses}</p>
          <p className="pixel-text" style={{ color: 'rgba(255,0,110,0.4)', fontSize: '0.45rem' }}>MISS</p>
        </div>
        <div className="text-center">
          <p className="pixel-text" style={{ color: '#FFE600', fontSize: '1rem', textShadow: '0 0 10px #FFE600' }}>
            {Math.max(0, REQUIRED_HITS - hits)}
          </p>
          <p className="pixel-text" style={{ color: 'rgba(255,230,0,0.4)', fontSize: '0.45rem' }}>남은 횟수</p>
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        ⚠ 초록 구간만 유효 | {MISS_RESET_AT}번 미스 시 리셋 | {REQUIRED_HITS}번 성공하면 완료
      </p>
    </div>
  );
}
