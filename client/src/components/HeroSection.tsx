/**
 * HeroSection - 메인 히어로 배너
 * Design: Retro Arcade Suffering
 * - CRT scanline effect
 * - Glitch text animation
 * - Neon glow effects
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const GLITCH_CHARS = '!@#$%^&*<>?/\\|{}[]ㄱㄴㄷㄹ';

function GlitchText({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState(text);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      let count = 0;
      const iv = setInterval(() => {
        setDisplay(
          text.split('').map(c =>
            Math.random() < 0.25 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
          ).join('')
        );
        count++;
        if (count > 6) {
          clearInterval(iv);
          setDisplay(text);
          setGlitching(false);
        }
      }, 60);
    };

    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => { trigger(); schedule(); }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [text]);

  return (
    <span style={{ ...style, filter: glitching ? 'blur(0.3px)' : undefined }}>
      {display}
    </span>
  );
}

const TYPING_TEXTS = [
  '당신의 인내심을 시험합니다',
  '불편함을 즐기세요',
  '포기하면 편해집니다',
  '하지만 버텨보세요',
];

function TypingSubtitle() {
  const [textIdx, setTextIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'deleting'>('typing');

  useEffect(() => {
    const target = TYPING_TEXTS[textIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (displayed.length < target.length) {
        timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setPhase('waiting'), 2000);
      }
    } else if (phase === 'waiting') {
      timeout = setTimeout(() => setPhase('deleting'), 500);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setTextIdx(i => (i + 1) % TYPING_TEXTS.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase, textIdx]);

  return (
    <span>
      {displayed}
      <span className="blink" style={{ color: '#00FF41' }}>_</span>
    </span>
  );
}

export default function HeroSection() {
  const [scanlineY, setScanlineY] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setScanlineY(y => (y + 1.5) % 100), 20);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '62vh' }}>
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663532247958/TKxhQT4fj4iwLcJKEebZQA/hero-banner-F3cFHPgjM5UsX6JZwrK7da.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'brightness(0.35) saturate(1.2)',
        }}
      />

      {/* 그라디언트 오버레이 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.1) 40%, rgba(5,5,5,0.7) 100%)',
        }}
      />

      {/* CRT 스캔라인 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          zIndex: 2,
        }}
      />

      {/* 이동 스캔라인 */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `${scanlineY}%`,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.06), transparent)',
          zIndex: 3,
        }}
      />

      {/* 비네트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)',
          zIndex: 2,
        }}
      />

      {/* 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[62vh] text-center px-4 py-20">

        {/* 상단 태그 */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-5"
        >
          <span
            className="pixel-text"
            style={{ color: '#FF006E', fontSize: '0.65rem', letterSpacing: '0.5em', textShadow: '0 0 5px #FF006E' }}
          >
            ── STAGE SELECT ──
          </span>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
          className="pixel-text mb-3"
          style={{
            fontSize: 'clamp(1.7rem, 6vw, 3.2rem)',
            color: '#00FF41',
            textShadow: '0 0 20px #00FF41, 0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.2)',
            lineHeight: '1.5',
          }}
        >
          <GlitchText text="불편함을 이기다" />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pixel-text mb-5"
          style={{
            fontSize: 'clamp(0.55rem, 1.6vw, 0.85rem)',
            color: '#FF006E',
            letterSpacing: '0.3em',
            textShadow: '0 0 8px #FF006E',
          }}
        >
          UNCOMFORTABLE UI CHALLENGE
        </motion.p>

        {/* 타이핑 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
          style={{
            color: 'rgba(0,255,65,0.7)',
            fontFamily: 'Galmuri11, Space Mono, monospace',
            fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
            minHeight: '1.5rem',
          }}
        >
          <TypingSubtitle />
        </motion.p>

        {/* 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-8 sm:gap-12"
        >
          {[
            { label: 'CHALLENGES', value: '11', color: '#00FF41' },
            { label: 'STRESS MAX', value: '100%', color: '#FF006E' },
            { label: 'ESCAPE RATE', value: '0%', color: '#00B4FF' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p
                className="pixel-text"
                style={{
                  color: stat.color,
                  fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
                  textShadow: `0 0 10px ${stat.color}88`,
                }}
              >
                {stat.value}
              </p>
              <p className="pixel-text mt-1" style={{ color: `${stat.color}55`, fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* 스크롤 힌트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="pixel-text"
            style={{ color: 'rgba(0,255,65,0.35)', fontSize: '0.6rem', letterSpacing: '0.2em' }}
          >
            ▼ SCROLL TO START ▼
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
