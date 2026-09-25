/**
 * Home - 메인 페이지
 * Design: Retro Arcade Suffering
 * - Stress-reactive background
 * - All challenge components integrated
 * - Section headers with neon dividers
 */
import ChallengeCard from '@/components/ChallengeCard';
import HeroSection from '@/components/HeroSection';
import StressHUD from '@/components/StressHUD';
import { useStress } from '@/contexts/StressContext';
import { CHALLENGE_SECTIONS, TOTAL_CHALLENGES } from '@/data/challenges';
import { motion, AnimatePresence } from 'framer-motion';
import { Fragment } from 'react';
import { toast } from 'sonner';


function SectionHeader({ title, subtitle, color, icon, num }: {
  title: string; subtitle: string; color: string; icon: string; num: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-4 mb-6"
    >
      <div
        className="flex-shrink-0 w-14 h-14 flex items-center justify-center"
        style={{
          border: `2px solid ${color}`,
          boxShadow: `0 0 15px ${color}44, inset 0 0 10px ${color}11`,
          background: `${color}08`,
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <span className="pixel-text" style={{ color: `${color}66`, fontSize: '0.65rem' }}>{num}</span>
          <h2 className="pixel-text" style={{ color, fontSize: '0.9rem', textShadow: `0 0 8px ${color}88` }}>
            {title}
          </h2>
        </div>
        <p className="mt-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.82rem' }}>
          {subtitle}
        </p>
      </div>
      <div className="flex-1 h-px hidden sm:block" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
    </motion.div>
  );
}

function PageBackground({ stress }: { stress: number }) {
  const intensity = stress / 100;
  return (
    <>
      {/* ① 히어로 이미지 전체 페이지 fixed — 아주 어둡게 깔아서 연속성 확보 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663532247958/TKxhQT4fj4iwLcJKEebZQA/hero-banner-F3cFHPgjM5UsX6JZwrK7da.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'brightness(0.08) saturate(1.4)',
          zIndex: 0,
        }}
      />

      {/* ② 전체 사이버 그리드 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '48px 48px',
          zIndex: 1,
        }}
      />

      {/* ③ 앰비언트 글로우 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(255,0,110,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '-5%',
          width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(0,180,255,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '25%',
          width: 500, height: 300,
          background: 'radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* ④ CRT 스캔라인 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
          zIndex: 2,
        }}
      />

      {/* ⑤ 스트레스 오버레이 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(255,0,110,${intensity * 0.1}) 0%, transparent 65%)`,
          zIndex: 2,
          transition: 'background 1.2s ease',
        }}
      />

      {/* ⑥ 비네트 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
          zIndex: 2,
        }}
      />
    </>
  );
}

export default function Home() {
  const { stress, completedChallenges, totalScore, stressLevel } = useStress();

  const handleComplete = (name: string, points: number) => {
    toast.success(`✓ ${name} 클리어! +${points}점`, {
      style: {
        background: '#0A0A0A',
        border: '1px solid #00FF41',
        color: '#00FF41',
        fontFamily: 'Galmuri11, Space Mono, monospace',
        fontSize: '0.65rem',
        boxShadow: '0 0 15px rgba(0,255,65,0.3)',
      },
      duration: 3000,
    });
  };

  const totalChallenges = TOTAL_CHALLENGES;

  return (
    <div className="min-h-screen relative" style={{ background: '#050505' }}>
      {/* 전체 배경 레이어 */}
      <PageBackground stress={stress} />

      {/* 전역 스트레스 HUD */}
      <StressHUD />

      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 메인 컨텐츠 — 간격 없이 바로 이어지도록 pt-0 */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-2 pb-10 space-y-10">

        {CHALLENGE_SECTIONS.map((section, sIdx) => (
          <Fragment key={section.num}>
            {sIdx > 0 && <div className="section-divider" />}
            <section>
              <SectionHeader
                num={section.num}
                title={section.title}
                subtitle={section.subtitle}
                color={section.color}
                icon={section.icon}
              />
              <div className="space-y-2">
                {section.challenges.map(({ id, title, toastName, subtitle, category, difficulty, points, Component }) => (
                  <ChallengeCard
                    key={id}
                    id={id}
                    title={title}
                    subtitle={subtitle}
                    category={category}
                    categoryColor={section.color}
                    difficulty={difficulty}
                    points={points}
                  >
                    <Component onComplete={() => handleComplete(toastName, points)} />
                  </ChallengeCard>
                ))}
              </div>
            </section>
          </Fragment>
        ))}

        {/* ─── 최종 점수판 ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="arcade-panel p-8 text-center relative overflow-hidden"
          style={{
            border: '2px solid #FF006E',
            boxShadow: '0 0 40px rgba(255,0,110,0.15), inset 0 0 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* 배경 그리드 */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,0,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,110,0.5) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          <div className="relative z-10">
            <p className="pixel-text neon-pink mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.4em' }}>
              ── FINAL SCORE ──
            </p>

            <motion.p
              key={totalScore}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="pixel-text"
              style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#FFE600', textShadow: '0 0 20px #FFE600, 0 0 40px rgba(255,230,0,0.3)' }}
            >
              {totalScore.toLocaleString()}
            </motion.p>
            <p className="pixel-text mb-6" style={{ color: 'rgba(255,230,0,0.3)', fontSize: '0.65rem', letterSpacing: '0.3em' }}>
              POINTS
            </p>

            <div className="flex justify-center gap-10 mb-6">
              <div className="text-center">
                <p className="pixel-text neon-green" style={{ fontSize: '1.8rem' }}>
                  {completedChallenges.size}
                </p>
                <p className="pixel-text" style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.6rem' }}>
                  / {totalChallenges} CLEARED
                </p>
              </div>
              <div className="text-center">
                <p className="pixel-text" style={{ fontSize: '1.8rem', color: '#FF006E', textShadow: '0 0 10px #FF006E' }}>
                  {Math.round(stress)}%
                </p>
                <p className="pixel-text" style={{ color: 'rgba(255,0,110,0.4)', fontSize: '0.6rem' }}>
                  STRESS LEVEL
                </p>
              </div>
            </div>

            {/* 스트레스 레벨 메시지 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stressLevel}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="px-4 py-2 inline-block"
                style={{
                  border: `1px solid ${
                    stressLevel === 'rage' ? '#FF006E' :
                    stressLevel === 'frustrated' ? '#FF8C00' :
                    stressLevel === 'annoyed' ? '#FFE600' : '#00FF41'
                  }`,
                  background: `${
                    stressLevel === 'rage' ? 'rgba(255,0,110,0.1)' :
                    stressLevel === 'frustrated' ? 'rgba(255,140,0,0.1)' :
                    stressLevel === 'annoyed' ? 'rgba(255,230,0,0.1)' : 'rgba(0,255,65,0.1)'
                  }`,
                }}
              >
                <p className="pixel-text" style={{
                  fontSize: '0.8rem',
                  color: stressLevel === 'rage' ? '#FF006E' :
                    stressLevel === 'frustrated' ? '#FF8C00' :
                    stressLevel === 'annoyed' ? '#FFE600' : '#00FF41'
                }}>
                  {stressLevel === 'rage' && '🔥 RAGE QUIT 직전입니다'}
                  {stressLevel === 'frustrated' && '😤 많이 힘드시죠?'}
                  {stressLevel === 'annoyed' && '😒 짜증이 쌓이고 있습니다'}
                  {stressLevel === 'calm' && '😌 아직 여유롭군요'}
                </p>
              </motion.div>
            </AnimatePresence>

            {completedChallenges.size === totalChallenges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 pixel-text neon-green"
                style={{ fontSize: '1rem' }}
              >
                🏆 ALL CHALLENGES CLEARED! 🏆
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* 푸터 */}
        <footer className="text-center pb-6 space-y-2">
          <div className="section-divider mb-4" />
          <p className="pixel-text" style={{ color: 'rgba(0,255,65,0.2)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
            UNCOMFORTABLE UI CHALLENGE v1.0
          </p>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.8rem' }}>
            당신의 인내심에 경의를 표합니다
          </p>
        </footer>
      </div>
    </div>
  );
}
