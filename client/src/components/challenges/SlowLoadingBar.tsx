/**
 * SlowLoadingBar - 99%에서 멈추는 로딩바
 * Design: Retro Arcade Suffering
 * Challenge: 심리적 압박 (Psychological War)
 */
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete?: () => void;
}

const LOADING_MESSAGES = [
  '시스템 초기화 중...',
  '데이터 불러오는 중...',
  '캐시 정리 중...',
  '거의 다 됐어요...',
  '조금만 더...',
  '정말 거의 다 됐어요...',
  '진짜로 거의 다 됐어요...',
  '아직도 로딩 중...',
  '왜 이렇게 오래 걸리지...',
  '서버가 잠시 생각 중...',
  '거의 99%...',
  '99%에서 멈춤 ■',
];

const TAUNT_MESSAGES = [
  '아직도 기다려요?',
  '화장실이라도 다녀오세요',
  '커피 한 잔 마시고 오세요',
  '퇴근하고 오세요',
  '내일 다시 시도해보세요',
  '이 로딩바는 영원합니다',
  '포기하실 건가요?',
  '이 정도면 그냥 창 닫으세요',
];

type Phase = 'loading' | 'stuck' | 'taunting' | 'complete';

export default function SlowLoadingBar({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();

  const [progress, setProgress]                   = useState(0);
  const [phase, setPhaseState]                    = useState<Phase>('loading');
  const [frozen, setFrozen]                       = useState(false);
  const [showFakeComplete, setShowFakeComplete]   = useState(false);
  const [messageIdx, setMessageIdx]               = useState(0);
  const [tauntIdx, setTauntIdx]                   = useState(0);
  const [restartCount, setRestartCount]           = useState(0);
  const [completed, setCompleted]                 = useState(false);
  const [waitTime, setWaitTime]                   = useState(0);
  const [mouseMoveCount, setMouseMoveCount]       = useState(0);
  const [runKey, setRunKey]                       = useState(0);

  // Mutable refs — avoid stale closures
  const progressRef      = useRef(0);
  const phaseRef         = useRef<Phase>('loading');
  const frozenRef        = useRef(false);
  const fakeShownRef     = useRef(false);
  const completedRef     = useRef(false);
  const restartCountRef  = useRef(0);

  // Timer refs — all cleared in clearAll()
  const mainIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const creepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const tauntTimeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const freezeTimeoutRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const unfreezeTimeoutRef = useRef<ReturnType<typeof setTimeout>| null>(null);
  const fakeTimeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const clearAll = useCallback(() => {
    if (mainIntervalRef.current)    clearInterval(mainIntervalRef.current);
    if (creepIntervalRef.current)   clearInterval(creepIntervalRef.current);
    if (waitIntervalRef.current)    clearInterval(waitIntervalRef.current);
    if (tauntTimeoutRef.current)    clearTimeout(tauntTimeoutRef.current);
    if (freezeTimeoutRef.current)   clearTimeout(freezeTimeoutRef.current);
    if (unfreezeTimeoutRef.current) clearTimeout(unfreezeTimeoutRef.current);
    if (fakeTimeoutRef.current)     clearTimeout(fakeTimeoutRef.current);
  }, []);

  // Option 3: schedule random freeze bursts
  const scheduleNextFreeze = useCallback(() => {
    if (completedRef.current) return;
    const delay = 2500 + Math.random() * 4000;
    freezeTimeoutRef.current = setTimeout(() => {
      if (phaseRef.current !== 'loading' || completedRef.current) return;
      frozenRef.current = true;
      setFrozen(true);
      const duration = 700 + Math.random() * 1300;
      unfreezeTimeoutRef.current = setTimeout(() => {
        if (completedRef.current) return;
        frozenRef.current = false;
        setFrozen(false);
        scheduleNextFreeze();
      }, duration);
    }, delay);
  }, []);

  // ─── Main loading effect (re-runs on runKey) ───
  useEffect(() => {
    if (completedRef.current) return;
    phaseRef.current = 'loading';

    mainIntervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'loading' || frozenRef.current) return;

      setProgress(prev => {
        const p = prev;

        // Option 6: fake complete on first 99% hit
        if (p >= 99) {
          if (!fakeShownRef.current) {
            fakeShownRef.current = true;
            setShowFakeComplete(true);
            fakeTimeoutRef.current = setTimeout(() => {
              setShowFakeComplete(false);
              progressRef.current = 99;
              setProgress(99);
              phaseRef.current = 'stuck';
              setPhaseState('stuck');
            }, 2000);
          }
          return p;
        }

        // Option 1: random retreat at 95%+
        if (p >= 95 && Math.random() < 0.06) {
          const retreat = 2 + Math.random() * 4;
          const newP = Math.max(50, p - retreat);
          progressRef.current = newP;
          return newP;
        }

        // Speed with restart penalty
        const penalty = Math.max(0.3, 1 - restartCountRef.current * 0.12);
        const base = p < 50 ? 3 : p < 80 ? 1.5 : p < 95 ? 0.5 : 0.08;
        const newP = Math.min(99, p + base * penalty);
        progressRef.current = newP;

        setMessageIdx(i => Math.min(i + 1, LOADING_MESSAGES.length - 2));
        return newP;
      });
    }, 200);

    scheduleNextFreeze();

    return () => {
      if (mainIntervalRef.current)  clearInterval(mainIntervalRef.current);
      if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
      if (unfreezeTimeoutRef.current) clearTimeout(unfreezeTimeoutRef.current);
    };
  }, [runKey, scheduleNextFreeze]);

  // ─── Stuck phase ───
  useEffect(() => {
    if (phase !== 'stuck') return;
    if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
    setMessageIdx(LOADING_MESSAGES.length - 1);
    addStress(15);

    // Option 2: slowly creep back from 99% → ~98.2%
    creepIntervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'stuck' && phaseRef.current !== 'taunting') return;
      setProgress(prev => {
        const newP = Math.max(98.2, prev - 0.025);
        progressRef.current = newP;
        return newP;
      });
    }, 200);

    // Option 8: taunting messages every 3s
    waitIntervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'stuck' && phaseRef.current !== 'taunting') return;
      setWaitTime(t => {
        const next = t + 1;
        if (next % 3 === 0) setTauntIdx(i => Math.min(i + 1, TAUNT_MESSAGES.length - 1));
        return next;
      });
    }, 1000);

    tauntTimeoutRef.current = setTimeout(() => {
      phaseRef.current = 'taunting';
      setPhaseState('taunting');
    }, 5000);

    return () => {
      if (creepIntervalRef.current)  clearInterval(creepIntervalRef.current);
      if (waitIntervalRef.current)   clearInterval(waitIntervalRef.current);
      if (tauntTimeoutRef.current)   clearTimeout(tauntTimeoutRef.current);
    };
  }, [phase, addStress]);

  // ─── Handlers ───
  const handleRestart = useCallback(() => {
    clearAll();
    progressRef.current   = 0;
    frozenRef.current     = false;
    fakeShownRef.current  = false;
    setProgress(0);
    setFrozen(false);
    setShowFakeComplete(false);
    setMessageIdx(0);
    setWaitTime(0);
    setTauntIdx(0);
    setRestartCount(c => { const n = c + 1; restartCountRef.current = n; return n; });
    setRunKey(k => k + 1);
    addStress(20);
  }, [clearAll, addStress]);

  const handleWait = useCallback(() => {
    if (completed || waitTime < 10) return;
    completedRef.current = true;
    clearAll();
    setCompleted(true);
    setPhase('complete');
    setProgress(100);
    addScore(600);
    completeChallenge('slow-loading');
    onComplete?.();
  }, [completed, waitTime, clearAll, setPhase, addScore, completeChallenge, onComplete]);

  // Mouse move → reset to 0
  const handleMouseMove = useCallback(() => {
    if (completedRef.current) return;
    if (phaseRef.current !== 'loading' && phaseRef.current !== 'stuck') return;
    if (progressRef.current < 3) return; // small grace zone at start

    clearAll();
    progressRef.current  = 0;
    frozenRef.current    = false;
    fakeShownRef.current = false;
    setProgress(0);
    setFrozen(false);
    setShowFakeComplete(false);
    setMessageIdx(0);
    setWaitTime(0);
    setTauntIdx(0);
    setMouseMoveCount(c => c + 1);
    setRunKey(k => k + 1);
    addStress(8);
  }, [clearAll, addStress]);

  useEffect(() => () => clearAll(), [clearAll]);

  const displayProgress = showFakeComplete ? 100 : progress;
  const barColor =
    displayProgress < 50 ? '#00FF41' :
    displayProgress < 80 ? '#FFE600' :
    displayProgress < 99 ? '#FF8C00' : '#FF006E';
  const displayColor = showFakeComplete ? '#00FF41' : barColor;

  return (
    <div className="space-y-4" onMouseMove={handleMouseMove}>
      <div className="arcade-panel p-4 space-y-3">
        {/* 이미지 */}
        <div className="flex justify-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663532247958/TKxhQT4fj4iwLcJKEebZQA/loading-99-U3XWJNAsbJXYWx6x5x9Dpx.webp"
            alt="loading"
            className="w-full max-w-xs opacity-60"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* 진행 바 */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="pixel-text" style={{ color: displayColor, fontSize: '0.55rem' }}>
              {showFakeComplete ? '✓ 완료!' : frozen ? '■ FREEZE' : phase === 'complete' ? 'COMPLETE!' : 'LOADING...'}
            </span>
            <span className="pixel-text" style={{ color: displayColor, fontSize: '0.55rem' }}>
              {Math.floor(displayProgress)}%
            </span>
          </div>

          <div
            className="relative h-5 w-full overflow-hidden"
            style={{ background: '#050505', border: `1px solid ${displayColor}`, boxShadow: `0 0 5px ${displayColor}` }}
          >
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${displayColor}, ${displayColor}88)`,
                boxShadow: `0 0 10px ${displayColor}`,
              }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: showFakeComplete ? 0.6 : 0.3 }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 10px)' }}
            />
            {(phase === 'stuck' || phase === 'taunting') && !showFakeComplete && (
              <div
                className="absolute right-0 top-0 bottom-0 flex items-center px-1 blink"
                style={{ color: '#FF006E', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}
              >
                ■
              </div>
            )}
          </div>
        </div>

        {/* 가짜 완료 메시지 */}
        <AnimatePresence>
          {showFakeComplete && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center pixel-text neon-green"
              style={{ fontSize: '0.65rem' }}
            >
              ✓ 로딩 완료! 잠깐...
            </motion.p>
          )}
        </AnimatePresence>

        {/* 로딩 메시지 */}
        {!showFakeComplete && (
          <p
            className="text-center"
            style={{ color: 'rgba(0,255,65,0.7)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.65rem', minHeight: '1.2rem' }}
          >
            {phase === 'complete' ? '✓ 인내심 테스트 통과!' : LOADING_MESSAGES[messageIdx]}
          </p>
        )}

        {/* Option 8: 조롱 메시지 */}
        {(phase === 'stuck' || phase === 'taunting') && !completed && tauntIdx > 0 && (
          <motion.p
            key={tauntIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pixel-text neon-pink"
            style={{ fontSize: '0.5rem' }}
          >
            {TAUNT_MESSAGES[tauntIdx - 1]}
          </motion.p>
        )}

        {/* 대기 시간 */}
        {(phase === 'stuck' || phase === 'taunting') && !completed && (
          <p className="text-center neon-pink pixel-text" style={{ fontSize: '0.5rem' }}>
            {waitTime}초 대기 중... ({Math.max(0, 10 - waitTime)}초 남음)
          </p>
        )}

        {/* 마우스 경고 */}
        {!completed && (phase === 'loading' || phase === 'stuck') && mouseMoveCount === 0 && (
          <p className="text-center pixel-text" style={{ color: 'rgba(255,230,0,0.4)', fontSize: '0.45rem' }}>
            ⚠ 마우스를 움직이면 처음부터
          </p>
        )}

        <AnimatePresence>
          {mouseMoveCount > 0 && (phase === 'loading' || phase === 'stuck') && (
            <motion.p
              key={mouseMoveCount}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="text-center pixel-text neon-pink"
              style={{ fontSize: '0.5rem', pointerEvents: 'none' }}
            >
              손 댔잖아요! ({mouseMoveCount}번째)
            </motion.p>
          )}
        </AnimatePresence>

        {/* 조롱 버튼 */}
        {phase === 'taunting' && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRestart}
                className="arcade-btn arcade-btn-pink"
                style={{ fontSize: '0.5rem' }}
              >
                처음부터 다시
              </button>
              <button
                onClick={handleWait}
                className="arcade-btn"
                style={{ fontSize: '0.5rem', opacity: waitTime >= 10 ? 1 : 0.3 }}
              >
                {waitTime >= 10 ? '완료!' : `기다리기 (${10 - waitTime}초)`}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>재시작: {restartCount}회</span>
        <span>마우스 실수: {mouseMoveCount}회</span>
      </div>
    </div>
  );
}
