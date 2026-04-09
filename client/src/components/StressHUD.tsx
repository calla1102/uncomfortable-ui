/**
 * StressHUD - 화면 상단에 고정된 스트레스 지수 HUD
 * Design: Retro Arcade Suffering - Game HUD style
 * Features: Stress-reactive colors, score display, challenge counter
 */
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const STRESS_MESSAGES: Record<string, string[]> = {
  calm: ['CALM', 'RELAXED', 'EASY MODE'],
  annoyed: ['ANNOYED', 'IRRITATED', 'GETTING WORSE'],
  frustrated: ['FRUSTRATED', 'RAGE BUILDING', 'ALMOST THERE'],
  rage: ['RAGE MODE', 'KEYBOARD SMASH', '🔥 MAX STRESS 🔥'],
};

export default function StressHUD() {
  const { stress, stressLevel, totalScore, completedChallenges } = useStress();
  const [messageIdx, setMessageIdx] = useState(0);
  const [prevStress, setPrevStress] = useState(stress);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const diff = stress - prevStress;
    if (Math.abs(diff) > 2) {
      setDelta(diff);
      setPrevStress(stress);
      const t = setTimeout(() => setDelta(0), 1200);
      return () => clearTimeout(t);
    }
  }, [stress, prevStress]);

  useEffect(() => {
    const iv = setInterval(() => {
      setMessageIdx(i => (i + 1) % (STRESS_MESSAGES[stressLevel]?.length || 1));
    }, 2500);
    return () => clearInterval(iv);
  }, [stressLevel]);

  const barColor =
    stress < 25 ? '#00FF41' :
    stress < 50 ? '#FFE600' :
    stress < 75 ? '#FF8C00' : '#FF006E';

  const messages = STRESS_MESSAGES[stressLevel] || STRESS_MESSAGES.calm;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(3,3,3,0.97)',
        borderBottom: `1px solid ${barColor}`,
        boxShadow: `0 0 15px ${barColor}22`,
      }}
      animate={{
        borderBottomColor: barColor,
        boxShadow: stress > 75
          ? [`0 0 15px ${barColor}22`, `0 0 25px ${barColor}44`, `0 0 15px ${barColor}22`]
          : `0 0 15px ${barColor}22`,
      }}
      transition={{ duration: 1.5, repeat: stress > 75 ? Infinity : 0 }}
    >
      <div className="max-w-5xl mx-auto px-3 py-1.5 relative flex items-center" style={{ minHeight: '2.5rem' }}>
        {/* 로고 - 왼쪽 고정 */}
        <div className="flex-shrink-0">
          <span className="pixel-text hidden sm:block" style={{ color: '#FF006E', fontSize: '0.6rem', textShadow: '0 0 5px #FF006E', letterSpacing: '0.05em' }}>
            UNCOMFORTABLE UI
          </span>
          <span className="pixel-text sm:hidden" style={{ color: '#FF006E', fontSize: '0.6rem' }}>UUI</span>
        </div>

        {/* 스트레스 바 - 절대 중앙 */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ width: '45%' }}>
          <span className="pixel-text flex-shrink-0" style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.6rem' }}>
            STRESS
          </span>

          <div className="flex-1 h-2.5 relative overflow-hidden" style={{ background: '#0A0A0A', border: `1px solid ${barColor}33` }}>
            <motion.div
              className="h-full relative"
              animate={{ width: `${stress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${barColor}66, ${barColor})`, boxShadow: `0 0 6px ${barColor}88` }}
            >
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.25) 5px, rgba(0,0,0,0.25) 6px)' }} />
            </motion.div>
            <div className="absolute top-0 bottom-0 right-0" style={{ width: '25%', background: 'rgba(255,0,110,0.05)', borderLeft: '1px solid rgba(255,0,110,0.2)' }} />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 relative">
            <motion.span
              key={Math.round(stress)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="pixel-text"
              style={{ color: barColor, fontSize: '0.65rem', minWidth: '2.8rem', textAlign: 'right' }}
            >
              {Math.round(stress)}%
            </motion.span>
            <AnimatePresence>
              {delta !== 0 && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: delta > 0 ? -12 : 12 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="pixel-text absolute"
                  style={{ color: delta > 0 ? '#FF006E' : '#00FF41', fontSize: '0.6rem', pointerEvents: 'none' }}
                >
                  {delta > 0 ? `+${Math.round(delta)}` : Math.round(delta)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 오른쪽 - 메시지 + 점수 */}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:block" style={{ width: '8.5rem', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={`${stressLevel}-${messageIdx}`}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3 }}
                className="pixel-text"
                style={{ color: barColor, fontSize: '0.6rem' }}
              >
                {messages[messageIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(0,255,65,0.15)' }} />
          <div className="text-right">
            <motion.p key={totalScore} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="pixel-text" style={{ color: '#FFE600', fontSize: '0.75rem', textShadow: '0 0 5px #FFE60066' }}>
              {totalScore.toLocaleString()}
            </motion.p>
            <p className="pixel-text" style={{ color: 'rgba(255,230,0,0.3)', fontSize: '0.55rem' }}>SCORE</p>
          </div>
          <div className="text-right">
            <p className="pixel-text" style={{ color: '#00B4FF', fontSize: '0.75rem', textShadow: '0 0 5px #00B4FF66' }}>{completedChallenges.size}</p>
            <p className="pixel-text" style={{ color: 'rgba(0,180,255,0.3)', fontSize: '0.55rem' }}>CLEAR</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
