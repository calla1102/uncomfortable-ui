/**
 * SlowInput - 글자 수가 늘어날수록 입력이 점점 느려지는 텍스트 입력
 * Design: Retro Arcade Suffering
 * Challenge: 시간 기반 고문 (Time Torture)
 */
import { useStress } from '@/contexts/StressContext';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';

const TARGET_LENGTH = 10;

function getDelay(charCount: number): number {
  if (charCount < 3) return 0;
  if (charCount < 6) return 500;
  if (charCount < 9) return 1500;
  return 3000;
}

interface Props {
  onComplete?: () => void;
}

export default function SlowInput({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [displayText, setDisplayText] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitProgress, setWaitProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWaiting || completed) return;
    const val = e.target.value;
    const currentLen = displayText.length;
    const delay = getDelay(currentLen);

    if (delay === 0) {
      setDisplayText(val);
      if (val.length >= TARGET_LENGTH && !completed) {
        setCompleted(true);
        addScore(400);
        completeChallenge('slow-input');
        onComplete?.();
      }
    } else {
      setPendingText(val);
      setIsWaiting(true);
      setWaitProgress(0);
      addStress(5);

      // 진행 바 업데이트
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setWaitProgress(Math.min(100, (elapsed / delay) * 100));
      }, 50);

      timerRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(val);
        setIsWaiting(false);
        setWaitProgress(0);
        if (val.length >= TARGET_LENGTH && !completed) {
          setCompleted(true);
          addScore(400);
          completeChallenge('slow-input');
          onComplete?.();
        }
      }, delay);
    }
  }, [isWaiting, completed, displayText, addStress, addScore, completeChallenge, onComplete]);

  const currentDelay = getDelay(displayText.length);
  const delayLabel = currentDelay === 0 ? '즉시' : currentDelay < 1000 ? `${currentDelay}ms` : `${currentDelay / 1000}초`;

  return (
    <div className="space-y-4">
      {/* 딜레이 표시 */}
      <div className="flex justify-between items-center">
        <span className="pixel-text" style={{ color: 'rgba(0,255,65,0.5)', fontSize: '0.5rem' }}>
          현재 딜레이:
        </span>
        <motion.span
          key={currentDelay}
          initial={{ scale: 1.5, color: '#FF006E' }}
          animate={{ scale: 1, color: currentDelay === 0 ? '#00FF41' : currentDelay < 1000 ? '#FFE600' : '#FF006E' }}
          className="pixel-text"
          style={{ fontSize: '0.7rem' }}
        >
          {delayLabel}
        </motion.span>
      </div>

      {/* 딜레이 곡선 시각화 */}
      <div className="flex gap-1 items-end h-8">
        {Array.from({ length: TARGET_LENGTH }, (_, i) => {
          const d = getDelay(i);
          const height = d === 0 ? 4 : d < 500 ? 12 : d < 1500 ? 20 : 32;
          const isActive = i === displayText.length;
          return (
            <div
              key={i}
              className="flex-1 transition-all"
              style={{
                height: `${height}px`,
                background: i < displayText.length ? '#00FF41' : isActive ? '#FFE600' : 'rgba(0,255,65,0.2)',
                boxShadow: isActive ? '0 0 8px #FFE600' : undefined,
              }}
            />
          );
        })}
      </div>

      {/* 입력 필드 */}
      <div className="relative">
        <input
          type="text"
          value={isWaiting ? pendingText : displayText}
          onChange={handleInput}
          disabled={completed}
          maxLength={TARGET_LENGTH}
          placeholder="여기에 입력하세요..."
          className="w-full px-3 py-3 text-sm outline-none"
          style={{
            background: '#050505',
            border: `1px solid ${completed ? '#00FF41' : isWaiting ? '#FF006E' : 'rgba(0,255,65,0.3)'}`,
            color: completed ? '#00FF41' : '#00FF41',
            fontFamily: 'Galmuri11, Space Mono, monospace',
            fontSize: '0.8rem',
            boxShadow: completed ? '0 0 10px rgba(0,255,65,0.3)' : undefined,
          }}
        />

        {/* 대기 오버레이 */}
        {isWaiting && (
          <div className="absolute inset-0 flex items-center justify-end pr-3 pointer-events-none">
            <span className="pixel-text neon-pink blink" style={{ fontSize: '0.5rem' }}>
              처리 중...
            </span>
          </div>
        )}
      </div>

      {/* 대기 진행 바 */}
      {isWaiting && (
        <div className="h-1 w-full" style={{ background: '#111', border: '1px solid rgba(255,0,110,0.3)' }}>
          <motion.div
            className="h-full"
            style={{ background: '#FF006E', width: `${waitProgress}%` }}
          />
        </div>
      )}

      {/* 실제 표시 텍스트 */}
      <div className="arcade-panel px-3 py-2">
        <span className="text-xs" style={{ color: 'rgba(0,255,65,0.4)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.55rem' }}>
          화면에 표시된 텍스트:
        </span>
        <p className="pixel-text mt-1" style={{ color: '#00FF41', fontSize: '0.65rem', minHeight: '1.2rem' }}>
          {displayText || <span style={{ opacity: 0.3 }}>없음</span>}
          {!completed && <span className="blink">_</span>}
          {completed && <span className="neon-green"> ✓</span>}
        </p>
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>글자 수: {displayText.length}/{TARGET_LENGTH}</span>
        <span>⚠ 글자가 늘수록 딜레이 증가</span>
      </div>
    </div>
  );
}
