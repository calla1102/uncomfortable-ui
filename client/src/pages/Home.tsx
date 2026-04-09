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
import BeggingPopup from '@/components/challenges/BeggingPopup';
import ChaosTheme from '@/components/challenges/ChaosTheme';
import DistortedInput from '@/components/challenges/DistortedInput';
import EscapeButton from '@/components/challenges/EscapeButton';
import InvertedScroll from '@/components/challenges/InvertedScroll';
import LongPressButton from '@/components/challenges/LongPressButton';
import RandomKeyboard from '@/components/challenges/RandomKeyboard';
import SlotMachineDatePicker from '@/components/challenges/SlotMachineDatePicker';
import SlowInput from '@/components/challenges/SlowInput';
import SlowLoadingBar from '@/components/challenges/SlowLoadingBar';
import TimingButton from '@/components/challenges/TimingButton';
import TypingAI from '@/components/challenges/TypingAI';
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SECTION_COLORS = {
  input: '#FF006E',
  precision: '#00B4FF',
  psych: '#FFE600',
  visual: '#FF8C00',
  time: '#00FF41',
  feedback: '#FF006E',
};

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

function StressReactiveBackground({ stress }: { stress: number }) {
  const intensity = stress / 100;
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, rgba(255,0,110,${intensity * 0.05}) 0%, transparent 70%)`,
        zIndex: 0,
        transition: 'background 1s ease',
      }}
    />
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

  const totalChallenges = 11;

  return (
    <div className="min-h-screen relative" style={{ background: '#050505' }}>
      {/* 스트레스 반응형 배경 */}
      <StressReactiveBackground stress={stress} />

      {/* 전역 스트레스 HUD */}
      <StressHUD />

      {/* 히어로 섹션 */}
      <div style={{ paddingTop: '2.5rem' }}>
        <HeroSection />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* ─── 섹션 1: 입력의 고통 ─── */}
        <section>
          <SectionHeader
            num="01"
            title="입력의 고통"
            subtitle="Input Hell — 타이핑이 이렇게 힘들 줄이야"
            color={SECTION_COLORS.input}
            icon="⌨️"
          />
          <div className="space-y-2">
            <ChallengeCard
              id="random-keyboard"
              title="랜덤 키보드"
              subtitle="한글 두벌식 자판이 매 입력마다 섞이고, ☠ 함정키·DEL키도 숨어있습니다. 15초 안에 입력하세요"
              category="INPUT HELL"
              categoryColor={SECTION_COLORS.input}
              difficulty={5}
              points={500}
            >
              <RandomKeyboard onComplete={() => handleComplete('랜덤 키보드', 500)} />
            </ChallengeCard>

            <ChallengeCard
              id="slot-date"
              title="슬롯머신 생년월일"
              subtitle="1995년 8월 15일을 맞추세요. 버튼 방향이 반전되고 확인 누르면 슬롯이 튕길 수 있습니다"
              category="INPUT HELL"
              categoryColor={SECTION_COLORS.input}
              difficulty={3}
              points={300}
            >
              <SlotMachineDatePicker onComplete={() => handleComplete('슬롯머신 생년월일', 300)} />
            </ChallengeCard>

            <ChallengeCard
              id="long-press"
              title="길게 눌러야 입력됨"
              subtitle="5초 꾹 누르세요. 버튼이 도망치고 손이 따라가지 않으면 처음부터 — 5번 완료해야 클리어"
              category="INPUT HELL"
              categoryColor={SECTION_COLORS.input}
              difficulty={5}
              points={500}
            >
              <LongPressButton onComplete={() => handleComplete('길게 누르기', 500)} />
            </ChallengeCard>
          </div>
        </section>

        <div className="section-divider" />

        {/* ─── 섹션 2: 정밀도 테스트 ─── */}
        <section>
          <SectionHeader
            num="02"
            title="정밀도 테스트"
            subtitle="Precision Tasks — 클릭 하나가 이렇게 어려울 줄이야"
            color={SECTION_COLORS.precision}
            icon="🎯"
          />
          <div className="space-y-2">
            <ChallengeCard
              id="escape-button"
              title="도망가는 확인 버튼"
              subtitle="가까이 갈수록 빠르게 도망 · 투명해짐 · 영역 이탈 시 랜덤 이동"
              category="PRECISION"
              categoryColor={SECTION_COLORS.precision}
              difficulty={4}
              points={400}
            >
              <EscapeButton onComplete={() => handleComplete('도망가는 버튼', 400)} />
            </ChallengeCard>

            <ChallengeCard
              id="timing-button"
              title="타이밍 버튼"
              subtitle="가짜 구간 함정 · 미스 3번 리셋 · 성공할수록 빨라짐 — 5번 성공하면 완료"
              category="PRECISION"
              categoryColor={SECTION_COLORS.precision}
              difficulty={4}
              points={400}
            >
              <TimingButton onComplete={() => handleComplete('타이밍 버튼', 400)} />
            </ChallengeCard>
          </div>
        </section>

        <div className="section-divider" />

        {/* ─── 섹션 3: 심리적 압박 ─── */}
        <section>
          <SectionHeader
            num="03"
            title="심리적 압박"
            subtitle="Psychological War — 당신의 멘탈을 공격합니다"
            color={SECTION_COLORS.psych}
            icon="😤"
          />
          <div className="space-y-2">
            <ChallengeCard
              id="begging-popup"
              title="조건부 팝업"
              subtitle="'예' 클릭 시 가짜 진행 바 역주행 · 3단계 확인 팝업 · 아니오 버튼 멘트 변경"
              category="PSYCH WAR"
              categoryColor={SECTION_COLORS.psych}
              difficulty={3}
              points={200}
            >
              <BeggingPopup onComplete={() => handleComplete('조건부 팝업', 200)} />
            </ChallengeCard>

            <ChallengeCard
              id="slow-loading"
              title="느릿느릿 로딩바"
              subtitle="99%에서 멈추고 처음부터 다시 하라고 합니다 — 10초 버티면 완료"
              category="PSYCH WAR"
              categoryColor={SECTION_COLORS.psych}
              difficulty={4}
              points={600}
            >
              <SlowLoadingBar onComplete={() => handleComplete('느릿느릿 로딩바', 600)} />
            </ChallengeCard>

            <ChallengeCard
              id="typing-ai"
              title="AI 채팅 상담사의 오타"
              subtitle="AI가 오타를 내고 백스페이스로 지우는 걸 지켜보세요"
              category="PSYCH WAR"
              categoryColor={SECTION_COLORS.psych}
              difficulty={1}
              points={300}
            >
              <TypingAI onComplete={() => handleComplete('AI 채팅 상담사', 300)} />
            </ChallengeCard>
          </div>
        </section>

        <div className="section-divider" />

        {/* ─── 섹션 4: 시각적 혼란 ─── */}
        <section>
          <SectionHeader
            num="04"
            title="시각적 혼란"
            subtitle="Visual Chaos — 눈이 혼란스러워집니다"
            color={SECTION_COLORS.visual}
            icon="👁"
          />
          <div className="space-y-2">
            <ChallengeCard
              id="chaos-theme"
              title="다크/라이트 모드 무작위 전환"
              subtitle="마우스 속도에 따라 테마가 미친 듯이 바뀝니다 — 20회 달성 시 완료"
              category="VISUAL CHAOS"
              categoryColor={SECTION_COLORS.visual}
              difficulty={2}
              points={300}
            >
              <ChaosTheme onComplete={() => handleComplete('카오스 테마', 300)} />
            </ChallengeCard>

            <ChallengeCard
              id="inverted-scroll"
              title="스크롤 방향 반전"
              subtitle="위로 올리면 아래로, 중간에 방향이 바뀝니다 — 끝까지 스크롤하면 완료"
              category="VISUAL CHAOS"
              categoryColor={SECTION_COLORS.visual}
              difficulty={2}
              points={250}
            >
              <InvertedScroll onComplete={() => handleComplete('반전 스크롤', 250)} />
            </ChallengeCard>
          </div>
        </section>

        <div className="section-divider" />

        {/* ─── 섹션 5: 피드백 왜곡 ─── */}
        <section>
          <SectionHeader
            num="05"
            title="피드백 왜곡"
            subtitle="Feedback Distortion — 입력한 값을 믿을 수 없습니다"
            color={SECTION_COLORS.feedback}
            icon="🔀"
          />
          <div className="space-y-2">
            <ChallengeCard
              id="slow-input"
              title="점점 느려지는 입력"
              subtitle="글자가 늘어날수록 딜레이가 기하급수적으로 증가합니다"
              category="FEEDBACK"
              categoryColor={SECTION_COLORS.feedback}
              difficulty={3}
              points={400}
            >
              <SlowInput onComplete={() => handleComplete('점점 느려지는 입력', 400)} />
            </ChallengeCard>

            <ChallengeCard
              id="distorted-input"
              title="입력값 변형"
              subtitle="입력한 값이 변형되어 표시됩니다. 신뢰성 붕괴 — 3번 제출하면 완료"
              category="FEEDBACK"
              categoryColor={SECTION_COLORS.feedback}
              difficulty={2}
              points={350}
            >
              <DistortedInput onComplete={() => handleComplete('입력값 변형', 350)} />
            </ChallengeCard>
          </div>
        </section>

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
