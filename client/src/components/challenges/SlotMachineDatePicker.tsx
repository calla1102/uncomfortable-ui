/**
 * SlotMachineDatePicker - 슬롯머신처럼 돌려서 날짜를 맞추는 컴포넌트
 * Design: Retro Arcade Suffering
 * Challenge: 입력의 고통 (Input Hell)
 */
import { useStress } from '@/contexts/StressContext';
import { motion, useAnimation } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const YEARS  = Array.from({ length: 50 }, (_, i) => 1975 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);

const TARGET = { year: 1995, month: 8, day: 15 };

interface SlotColumnProps {
  values: number[];
  current: number;
  label: string;
  unit: string;
  onUp: () => void;
  onDown: () => void;
  isCorrect: boolean;
  inverted: boolean;
}

function SlotColumn({ values, current, label, unit, onUp, onDown, isCorrect, inverted }: SlotColumnProps) {
  const controls = useAnimation();
  const [spinning, setSpinning] = useState(false);

  const animate = async (dir: 'up' | 'down', action: () => void) => {
    if (spinning) return;
    setSpinning(true);
    const fromY = dir === 'up' ? -20 : 20;
    await controls.start({ y: fromY, opacity: 0, transition: { duration: 0.1 } });
    action();
    await controls.start({ y: -fromY, opacity: 0, transition: { duration: 0 } });
    await controls.start({ y: 0, opacity: 1, transition: { duration: 0.15, type: 'spring' } });
    setSpinning(false);
  };

  const handleUp   = () => animate('up',   inverted ? onDown : onUp);
  const handleDown = () => animate('down', inverted ? onUp   : onDown);

  const idx  = values.indexOf(current);
  const prev = values[(idx - 1 + values.length) % values.length];
  const next = values[(idx + 1) % values.length];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="pixel-text text-xs mb-1" style={{ color: '#00B4FF', fontSize: '0.5rem' }}>{label}</span>

      <button
        onClick={handleUp}
        className="w-10 h-8 flex items-center justify-center transition-all hover:text-[#00FF41]"
        style={{ color: inverted ? 'rgba(255,0,110,0.7)' : 'rgba(0,255,65,0.5)', border: `1px solid ${inverted ? 'rgba(255,0,110,0.3)' : 'rgba(0,255,65,0.2)'}` }}
      >
        {inverted ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      <div
        className="relative overflow-hidden"
        style={{
          width: '4rem', height: '4rem',
          background: '#050505',
          border: `2px solid ${isCorrect ? '#00FF41' : 'rgba(0,255,65,0.3)'}`,
          boxShadow: isCorrect ? '0 0 15px #00FF41' : undefined,
        }}
      >
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center h-4 opacity-20"
          style={{ color: '#00FF41', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
          {prev}
        </div>
        <motion.div animate={controls} className="absolute inset-0 flex items-center justify-center">
          <span className="pixel-text" style={{
            color: isCorrect ? '#00FF41' : '#FFE600',
            fontSize: label === '연도' ? '0.65rem' : '0.9rem',
            textShadow: isCorrect ? '0 0 10px #00FF41' : '0 0 5px #FFE600',
            fontWeight: 400,
          }}>
            {String(current).padStart(label === '연도' ? 4 : 2, '0')}
          </span>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-4 opacity-20"
          style={{ color: '#00FF41', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
          {next}
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)' }}
        />
      </div>

      <button
        onClick={handleDown}
        className="w-10 h-8 flex items-center justify-center transition-all hover:text-[#00FF41]"
        style={{ color: inverted ? 'rgba(255,0,110,0.7)' : 'rgba(0,255,65,0.5)', border: `1px solid ${inverted ? 'rgba(255,0,110,0.3)' : 'rgba(0,255,65,0.2)'}` }}
      >
        {inverted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <span className="text-xs" style={{ color: 'rgba(0,255,65,0.4)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.55rem' }}>
        {unit}
      </span>
    </div>
  );
}

interface Props { onComplete?: () => void; }

export default function SlotMachineDatePicker({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [year,  setYear]  = useState(2000);
  const [month, setMonth] = useState(1);
  const [day,   setDay]   = useState(1);
  const [completed,  setCompleted]  = useState(false);
  const [attempts,   setAttempts]   = useState(0);
  const [inverted,   setInverted]   = useState(false);
  const [jitterMsg,  setJitterMsg]  = useState('');

  const yearIdx  = YEARS.indexOf(year);
  const monthIdx = MONTHS.indexOf(month);
  const dayIdx   = DAYS.indexOf(day);

  // 버튼 방향 반전: 5초마다 20% 확률
  useEffect(() => {
    if (completed) return;
    const id = setInterval(() => {
      if (Math.random() < 0.2) {
        setInverted(true);
        setTimeout(() => setInverted(false), 3000);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [completed]);

  const check = useCallback(() => {
    setAttempts(a => a + 1);
    addStress(5);

    // 40% 확률로 확인 시 슬롯 이탈
    if (Math.random() < 0.4) {
      const slot = Math.floor(Math.random() * 3);
      const dir  = Math.random() > 0.5 ? 1 : -1;
      if (slot === 0) setYear(y  => YEARS[(YEARS.indexOf(y) + dir + YEARS.length) % YEARS.length]);
      if (slot === 1) setMonth(m => MONTHS[(MONTHS.indexOf(m) + dir + MONTHS.length) % MONTHS.length]);
      if (slot === 2) setDay(d   => DAYS[(DAYS.indexOf(d) + dir + DAYS.length) % DAYS.length]);
      setJitterMsg('!! 슬롯이 튕겼습니다 !!');
      setTimeout(() => setJitterMsg(''), 1000);
      addStress(8);
      return;
    }

    if (year === TARGET.year && month === TARGET.month && day === TARGET.day) {
      setCompleted(true);
      addScore(300);
      completeChallenge('slot-date');
      onComplete?.();
    }
  }, [year, month, day, addStress, addScore, completeChallenge, onComplete]);

  return (
    <div className="space-y-4">
      {/* 목표 */}
      <div className="text-center">
        <p className="text-xs mb-1" style={{ color: 'rgba(0,255,65,0.5)', fontFamily: 'Galmuri11, Space Mono, monospace' }}>
          맞춰야 할 생년월일:
        </p>
        <p className="pixel-text neon-yellow" style={{ fontSize: '0.7rem' }}>
          {TARGET.year}년 {TARGET.month}월 {TARGET.day}일
        </p>
      </div>

      {/* 방향 반전 경고 */}
      <div style={{ minHeight: '1.2rem' }} className="text-center">
        {inverted && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pixel-text"
            style={{ fontSize: '0.55rem', color: '#FF006E', textShadow: '0 0 8px #FF006E' }}
          >
            !! 버튼 방향이 반전됨 !!
          </motion.p>
        )}
        {jitterMsg && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pixel-text"
            style={{ fontSize: '0.55rem', color: '#FF006E' }}
          >
            {jitterMsg}
          </motion.p>
        )}
      </div>

      {/* 슬롯 */}
      <div className="arcade-panel p-4">
        <div className="flex justify-center gap-4">
          <SlotColumn
            values={YEARS} current={year} label="연도" unit="YEAR" inverted={inverted}
            onUp={()   => { setYear(YEARS[(yearIdx + 1) % YEARS.length]); addStress(1); }}
            onDown={()  => { setYear(YEARS[(yearIdx - 1 + YEARS.length) % YEARS.length]); addStress(1); }}
            isCorrect={year === TARGET.year}
          />
          <div className="flex items-center pixel-text" style={{ color: 'rgba(0,255,65,0.3)', fontSize: '1rem', paddingTop: '2rem' }}>/</div>
          <SlotColumn
            values={MONTHS} current={month} label="월" unit="MON" inverted={inverted}
            onUp={()   => { setMonth(MONTHS[(monthIdx + 1) % MONTHS.length]); addStress(1); }}
            onDown={()  => { setMonth(MONTHS[(monthIdx - 1 + MONTHS.length) % MONTHS.length]); addStress(1); }}
            isCorrect={month === TARGET.month}
          />
          <div className="flex items-center pixel-text" style={{ color: 'rgba(0,255,65,0.3)', fontSize: '1rem', paddingTop: '2rem' }}>/</div>
          <SlotColumn
            values={DAYS} current={day} label="일" unit="DAY" inverted={inverted}
            onUp={()   => { setDay(DAYS[(dayIdx + 1) % DAYS.length]); addStress(1); }}
            onDown={()  => { setDay(DAYS[(dayIdx - 1 + DAYS.length) % DAYS.length]); addStress(1); }}
            isCorrect={day === TARGET.day}
          />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={check}
            disabled={completed}
            className="arcade-btn px-6 py-2"
            style={{ fontSize: '0.55rem' }}
          >
            {completed ? '✓ CONFIRMED' : '확인'}
          </button>
        </div>
      </div>

      <div className="flex justify-between text-xs px-1" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        <span>시도 횟수: {attempts}</span>
        <span>⚠ 슬롯이 멋대로 움직입니다</span>
      </div>
    </div>
  );
}
