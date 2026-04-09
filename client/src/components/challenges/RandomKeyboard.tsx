/**
 * RandomKeyboard - 매 입력마다 키 위치가 무작위로 섞이는 키보드
 * Design: Retro Arcade Suffering
 * Challenge: 입력의 고통 (Input Hell)
 */
import { useStress } from '@/contexts/StressContext';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── 두벌식 키보드 ──
const DUBEOLSIK_KEYS = ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ','ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'];

const DEL_KEY   = '__DEL__';
const TRAP_KEY  = '__TRAP__';
const ALL_KEYS  = [...DUBEOLSIK_KEYS, DEL_KEY, TRAP_KEY, TRAP_KEY]; // 29개
const ROW_SIZES = [10, 10, 9];

const PHYSICAL_TO_JAMO: Record<string, string> = {
  q:'ㅂ', w:'ㅈ', e:'ㄷ', r:'ㄱ', t:'ㅅ', y:'ㅛ', u:'ㅕ', i:'ㅑ', o:'ㅐ', p:'ㅔ',
  a:'ㅁ', s:'ㄴ', d:'ㅇ', f:'ㄹ', g:'ㅎ', h:'ㅗ', j:'ㅓ', k:'ㅏ', l:'ㅣ',
  z:'ㅋ', x:'ㅌ', c:'ㅊ', v:'ㅍ', b:'ㅠ', n:'ㅜ', m:'ㅡ',
};

// ── 한글 조합 ──
const CHOSEONG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const JAMO_TO_CHO:  Record<string, number> = Object.fromEntries(CHOSEONG.map((c, i) => [c, i]));
const JAMO_TO_JUNG: Record<string, number> = Object.fromEntries(JUNGSEONG.map((c, i) => [c, i]));
const JAMO_TO_JONG: Record<string, number> = {
  'ㄱ':1,'ㄲ':2,'ㄴ':4,'ㄷ':7,'ㄹ':8,'ㅁ':16,'ㅂ':17,
  'ㅅ':19,'ㅆ':20,'ㅇ':21,'ㅈ':22,'ㅊ':23,'ㅋ':24,'ㅌ':25,'ㅍ':26,'ㅎ':27,
};

function composeChar(cho: number, jung: number, jong = 0): string {
  return String.fromCharCode(0xAC00 + cho * 21 * 28 + jung * 28 + jong);
}

interface Composing { cho: number | null; jung: number | null; jong: number | null; }
const EMPTY: Composing = { cho: null, jung: null, jong: null };

function getComposingChar(c: Composing): string {
  if (c.cho === null) return '';
  if (c.jung === null) return CHOSEONG[c.cho];
  if (c.jong === null) return composeChar(c.cho, c.jung);
  return composeChar(c.cho, c.jung, c.jong);
}

function addJamo(fin: string, comp: Composing, jamo: string): { fin: string; comp: Composing } {
  const isVowel = jamo in JAMO_TO_JUNG;
  if (!isVowel) {
    const choIdx  = JAMO_TO_CHO[jamo];
    const jongIdx = JAMO_TO_JONG[jamo];
    if (comp.cho === null) return { fin, comp: { cho: choIdx, jung: null, jong: null } };
    if (comp.jung === null) return { fin: fin + CHOSEONG[comp.cho], comp: { cho: choIdx, jung: null, jong: null } };
    if (comp.jong === null && jongIdx !== undefined) return { fin, comp: { ...comp, jong: jongIdx } };
    const syl = comp.jong !== null ? composeChar(comp.cho, comp.jung!, comp.jong) : composeChar(comp.cho, comp.jung!);
    return { fin: fin + syl, comp: { cho: choIdx, jung: null, jong: null } };
  } else {
    const jungIdx = JAMO_TO_JUNG[jamo];
    if (comp.cho === null) return { fin, comp: { cho: 11, jung: jungIdx, jong: null } };
    if (comp.jung === null) return { fin, comp: { ...comp, jung: jungIdx } };
    if (comp.jong === null) return { fin: fin + composeChar(comp.cho, comp.jung!), comp: { cho: 11, jung: jungIdx, jong: null } };
    const jongJamo  = JONGSEONG[comp.jong];
    const newChoIdx = JAMO_TO_CHO[jongJamo] ?? 11;
    return { fin: fin + composeChar(comp.cho, comp.jung!), comp: { cho: newChoIdx, jung: jungIdx, jong: null } };
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRows(shuffled: string[]): string[][] {
  let idx = 0;
  return ROW_SIZES.map(len => { const s = shuffled.slice(idx, idx + len); idx += len; return s; });
}

const TIMER_SECONDS = 15;

interface Props { onComplete?: () => void; targetText?: string; }

export default function RandomKeyboard({ onComplete, targetText = '불편함을이기다' }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [rows, setRows]         = useState<string[][]>(buildRows(shuffleArray(ALL_KEYS)));
  const [input, setInput]       = useState({ fin: '', comp: EMPTY });
  const [wrongFlash, setWrongFlash] = useState(false);
  const [trapFlash, setTrapFlash]   = useState(false);
  const [completed, setCompleted]   = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft]     = useState(TIMER_SECONDS);
  const shuffleCount = useRef(0);

  const inputText = input.fin + getComposingChar(input.comp);

  const reshuffle = useCallback(() => {
    setRows(buildRows(shuffleArray(ALL_KEYS)));
    shuffleCount.current += 1;
  }, []);

  const resetInput = useCallback(() => {
    setInput({ fin: '', comp: EMPTY });
    setTimeLeft(TIMER_SECONDS);
  }, []);

  // 자동 리셔플: 1.5초마다
  useEffect(() => {
    if (completed) return;
    const id = setInterval(reshuffle, 3000);
    return () => clearInterval(id);
  }, [completed, reshuffle]);

  // 타이머: 8초 카운트다운 → 리셋
  useEffect(() => {
    if (completed) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          resetInput();
          reshuffle();
          addStress(15);
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [completed, resetInput, reshuffle, addStress]);

  const handleJamo = useCallback((jamo: string) => {
    if (completed) return;
    setPressedKey(jamo);
    setTimeout(() => setPressedKey(null), 150);

    setInput(prev => {
      const next = addJamo(prev.fin, prev.comp, jamo);
      const text = next.fin + getComposingChar(next.comp);
      if (text === targetText) {
        setCompleted(true);
        addScore(500);
        completeChallenge('random-keyboard');
        onComplete?.();
      }
      return { fin: next.fin, comp: next.comp };
    });

    setTimeLeft(TIMER_SECONDS); // 입력 시 타이머 리셋
    reshuffle();
    addStress(3);
  }, [completed, targetText, reshuffle, addStress, addScore, completeChallenge, onComplete]);

  const handleDel = useCallback(() => {
    if (completed) return;
    setInput(prev => {
      if (prev.comp.jong !== null) return { ...prev, comp: { ...prev.comp, jong: null } };
      if (prev.comp.jung !== null) return { ...prev, comp: { ...prev.comp, jung: null } };
      if (prev.comp.cho  !== null) return { ...prev, comp: EMPTY };
      return { fin: prev.fin.slice(0, -1), comp: EMPTY };
    });
    setWrongFlash(true);
    setTimeout(() => setWrongFlash(false), 300);
    reshuffle();
    addStress(5);
  }, [completed, reshuffle, addStress]);

  const handleTrap = useCallback(() => {
    if (completed) return;
    setInput({ fin: '', comp: EMPTY });
    setTimeLeft(TIMER_SECONDS);
    setTrapFlash(true);
    setTimeout(() => setTrapFlash(false), 600);
    reshuffle();
    addStress(20);
  }, [completed, reshuffle, addStress]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') { handleDel(); return; }
      const jamo = PHYSICAL_TO_JAMO[e.key.toLowerCase()];
      if (jamo) handleJamo(jamo);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleJamo, handleDel]);

  const timerRatio = timeLeft / TIMER_SECONDS;
  const timerColor = timerRatio > 0.5 ? '#00FF41' : timerRatio > 0.25 ? '#FFE600' : '#FF006E';

  return (
    <div className="space-y-4">
      {/* 목표 텍스트 */}
      <div className="text-center">
        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace' }}>입력 목표:</p>
        <p className="pixel-text text-sm neon-yellow">{targetText}</p>
      </div>

      {/* 타이머 */}
      <div className="space-y-1">
        <div className="flex justify-between items-center px-1">
          <span className="pixel-text" style={{ fontSize: '0.6rem', color: timerColor }}>TIME</span>
          <span className="pixel-text" style={{ fontSize: '0.6rem', color: timerColor }}>{timeLeft}s</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 overflow-hidden">
          <motion.div
            animate={{ width: `${timerRatio * 100}%`, backgroundColor: timerColor }}
            transition={{ duration: 0.3 }}
            className="h-full"
            style={{ boxShadow: `0 0 6px ${timerColor}` }}
          />
        </div>
      </div>

      {/* 입력 디스플레이 */}
      <div
        className={`arcade-panel p-3 min-h-[3rem] flex items-center relative overflow-hidden transition-all`}
        style={{
          boxShadow: trapFlash
            ? '0 0 30px rgba(255,0,110,0.8)'
            : wrongFlash
            ? '0 0 20px rgba(255,0,0,0.5)'
            : undefined,
          borderColor: trapFlash ? '#FF006E' : undefined,
        }}
      >
        {trapFlash && (
          <span className="pixel-text absolute inset-0 flex items-center justify-center" style={{ fontSize: '0.7rem', color: '#FF006E' }}>
            !! RESET !!
          </span>
        )}
        {!trapFlash && (
          <span className="pixel-text text-xs" style={{ color: '#00FF41', minHeight: '1.5rem' }}>
            {inputText || <span className="opacity-30">여기에 입력됩니다...</span>}
            {!completed && <span className="blink" style={{ color: '#00FF41' }}>_</span>}
          </span>
        )}
        {completed && <span className="ml-2 pixel-text text-xs neon-green">✓ CLEAR!</span>}
      </div>

      {/* 키보드 */}
      <div className={`arcade-panel p-3 space-y-1.5 ${wrongFlash ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key, keyIdx) => {
              if (key === DEL_KEY) return (
                <motion.button
                  key={`del-${shuffleCount.current}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.05, type: 'spring', stiffness: 500 }}
                  onClick={handleDel}
                  className="w-8 h-8 text-xs font-bold transition-all bg-[#111] hover:bg-[#1a1a1a]"
                  style={{ border: '1px solid rgba(255,0,110,0.6)', color: '#FF006E', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.55rem' }}
                >
                  DEL
                </motion.button>
              );
              if (key === TRAP_KEY) return (
                <motion.button
                  key={`trap-${keyIdx}-${shuffleCount.current}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.05, type: 'spring', stiffness: 500 }}
                  onClick={handleTrap}
                  className="w-8 h-8 text-xs font-bold transition-all bg-[#111] hover:bg-[#1a1a1a]"
                  style={{ border: '1px solid rgba(0,255,65,0.15)', color: 'rgba(0,255,65,0.25)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.75rem' }}
                >
                  ☠
                </motion.button>
              );
              return (
                <motion.button
                  key={`${key}-${shuffleCount.current}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.05, type: 'spring', stiffness: 500 }}
                  onClick={() => handleJamo(key)}
                  className={`w-8 h-8 text-xs font-bold transition-all
                    ${pressedKey === key ? 'bg-[#00FF41] text-black scale-95' : 'bg-[#111] text-[#00FF41] hover:bg-[#1a1a1a] hover:shadow-[0_0_8px_#00FF41]'}
                  `}
                  style={{ border: '1px solid rgba(0,255,65,0.4)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.75rem' }}
                >
                  {key}
                </motion.button>
              );
            })}
          </div>
        ))}

        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => { resetInput(); reshuffle(); addStress(10); }}
            className="flex items-center gap-1 px-3 h-8 text-xs bg-[#111] text-[#FFE600] hover:bg-[#1a1a1a] transition-all"
            style={{ border: '1px solid rgba(255,230,0,0.4)', fontFamily: 'Galmuri11, Space Mono, monospace' }}
          >
            <RotateCcw size={12} /> RESET
          </button>
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.4)', fontFamily: 'Galmuri11, Space Mono, monospace' }}>
        ⚠ 매 입력마다 키 위치가 바뀝니다 | 섞임 횟수: {shuffleCount.current}
      </p>
    </div>
  );
}
