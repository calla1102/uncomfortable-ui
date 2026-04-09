/**
 * BeggingPopup - 아니오 버튼이 5배 크고 화려한 삭제 확인 팝업
 * Design: Retro Arcade Suffering
 * Challenge: 심리적 압박 (Psychological War)
 * Features:
 *   - 3단계 확인 팝업 (정말요? → 진짜로요? → 확실해요?)
 *   - 아니오 버튼 텍스트가 클릭마다 변경
 *   - 첫 "예" 클릭 시 가짜 진행 바가 역주행
 */
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onComplete?: () => void;
}

const NO_TEXTS = [
  '🎉 아니오! 취소! 살려줘! 🎉',
  '😭 그만해! 제발 그만!',
  '🏃 도망가자! 어서!',
  '💀 절대 안돼요!',
  '🔥 살려줘요 제발!',
  '😱 싫어요 싫어 싫어!',
  '🙏 취소해줘요 부탁이야!',
];

const STAGES = [
  { title: '정말 삭제하시겠습니까?', sub: '이 작업은 되돌릴 수 없습니다.', icon: '⚠️' },
  { title: '정말요?',               sub: '진심으로 삭제하실 건가요?',    icon: '😰' },
  { title: '진짜로요??',            sub: '후회하지 않으시겠어요?',       icon: '😱' },
  { title: '확실해요???',           sub: '마지막 기회입니다...',         icon: '💀' },
];

export default function BeggingPopup({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [isOpen, setIsOpen]       = useState(false);
  const [result, setResult]       = useState<'yes' | 'no' | null>(null);
  const [yesClicks, setYesClicks] = useState(0);
  const [noClicks, setNoClicks]   = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stage, setStage]         = useState(0); // 0~3
  const [isFaking, setIsFaking]   = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0); // 0~85
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  // 가짜 진행 바 시퀀스
  useEffect(() => {
    if (!isFaking) return;
    setFakeProgress(0);

    const t1 = setTimeout(() => setFakeProgress(85), 80);          // 올라가기 시작
    const t2 = setTimeout(() => setFakeProgress(0),  1800);        // 역주행
    const t3 = setTimeout(() => {                                   // 완료 → 다음 스테이지
      setIsFaking(false);
      setStage(1);
    }, 2900);

    timerRefs.current = [t1, t2, t3];
    return clearTimers;
  }, [isFaking]);

  const handleOpen = () => {
    setIsOpen(true);
    setResult(null);
    setStage(0);
    setIsFaking(false);
    setFakeProgress(0);
    addStress(5);
  };

  const handleYes = useCallback(() => {
    setYesClicks(c => c + 1);

    if (stage === 0) {
      // 옵션 7: 가짜 진행 바 역주행
      setIsFaking(true);
      addStress(15);
    } else if (stage < 3) {
      // 옵션 2: 다음 확인 단계로
      setStage(s => s + 1);
      addStress(5);
    } else {
      // 최종 단계 — 실제 완료
      setIsOpen(false);
      setResult('yes');
      setIsFaking(false);
      clearTimers();
      if (!completed) {
        setCompleted(true);
        addScore(200);
        completeChallenge('begging-popup');
        onComplete?.();
      }
      addStress(10);
    }
  }, [stage, completed, addStress, addScore, completeChallenge, onComplete]);

  const handleNo = useCallback(() => {
    setResult('no');
    setNoClicks(c => c + 1);
    setIsOpen(false);
    setIsFaking(false);
    setFakeProgress(0);
    setStage(0);
    clearTimers();
    addStress(3);
  }, [addStress]);

  const noText       = NO_TEXTS[noClicks % NO_TEXTS.length];
  const currentStage = STAGES[stage];

  return (
    <div className="space-y-3">
      {/* 트리거 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleOpen}
          className="arcade-btn arcade-btn-pink px-6 py-2"
          style={{ fontSize: '0.55rem' }}
        >
          ⚠ 계정 삭제하기
        </button>
      </div>

      {/* 결과 표시 */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {result === 'yes' ? (
            <p className="pixel-text neon-green" style={{ fontSize: '0.6rem' }}>
              ✓ 용감하게 '예'를 눌렀습니다! +200점
            </p>
          ) : (
            <p className="pixel-text neon-pink" style={{ fontSize: '0.6rem' }}>
              '아니오'를 선택했습니다. 다시 도전하세요.
            </p>
          )}
        </motion.div>
      )}

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>예 클릭: {yesClicks}</span>
        <span>아니오 클릭: {noClicks}</span>
      </div>

      {/* 팝업 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
          >
            <motion.div
              key={stage}
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="arcade-panel p-6 max-w-sm w-full mx-4"
              style={{ border: '2px solid #FF006E', boxShadow: '0 0 30px rgba(255,0,110,0.5)' }}
            >
              {/* 경고 아이콘 */}
              <div className="text-center mb-3">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  style={{ fontSize: '2.2rem' }}
                >
                  {currentStage.icon}
                </motion.div>
              </div>

              {/* 단계 표시 (stage > 0) */}
              {stage > 0 && (
                <div className="flex justify-center gap-1.5 mb-3">
                  {[1, 2, 3].map(s => (
                    <div
                      key={s}
                      style={{
                        width: '0.45rem', height: '0.45rem',
                        borderRadius: '50%',
                        background: s <= stage ? '#FF006E' : 'rgba(255,0,110,0.2)',
                        boxShadow: s <= stage ? '0 0 6px #FF006E' : 'none',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              )}

              <h3 className="pixel-text text-center neon-pink mb-2" style={{ fontSize: '0.65rem' }}>
                {currentStage.title}
              </h3>
              <p className="text-center mb-4" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.65rem' }}>
                {currentStage.sub}
              </p>

              {/* 가짜 진행 바 (옵션 7) */}
              {isFaking ? (
                <div className="mb-2">
                  <p className="pixel-text text-center mb-2" style={{ color: '#FFE600', fontSize: '0.5rem' }}>
                    {fakeProgress > 60 ? '역시 망설여지시죠? ↩' : '삭제 처리 중...'}
                  </p>
                  <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,0,110,0.3)', height: '0.6rem', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${fakeProgress}%` }}
                      transition={{
                        duration: fakeProgress > 0 ? 1.5 : 0.8,
                        ease:     fakeProgress > 0 ? 'easeIn' : 'easeOut',
                      }}
                      style={{
                        height: '100%',
                        background: fakeProgress > 60
                          ? 'linear-gradient(90deg, #FF006E, #FFE600)'
                          : 'linear-gradient(90deg, #FF006E88, #FF006E)',
                      }}
                    />
                  </div>
                  <p className="pixel-text text-center mt-1" style={{ color: 'rgba(255,0,110,0.4)', fontSize: '0.4rem' }}>
                    {Math.round(fakeProgress)}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 items-center">
                  {/* 아니오 버튼 - 크고 화려함 */}
                  <motion.button
                    onClick={handleNo}
                    animate={{
                      boxShadow: ['0 0 10px #00FF41', '0 0 30px #00FF41, 0 0 60px #00FF41', '0 0 10px #00FF41'],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-full py-4 pixel-text font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00FF41, #00B4FF)',
                      color: '#000',
                      border: '3px solid #00FF41',
                      fontSize: '0.9rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {noText}
                  </motion.button>

                  {/* 예 버튼 - 투명하고 아주 작음 */}
                  <button
                    onClick={handleYes}
                    className="pixel-text"
                    style={{
                      opacity: 0.2,
                      color: '#FF006E',
                      background: 'transparent',
                      border: '1px solid rgba(255,0,110,0.4)',
                      fontSize: '0.45rem',
                      padding: '0.2rem 0.6rem',
                      cursor: 'pointer',
                    }}
                  >
                    {stage === 3 ? '예 (마지막 기회)' : '예'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
