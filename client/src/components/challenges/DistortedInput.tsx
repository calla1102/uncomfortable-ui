/**
 * DistortedInput - 입력한 값이 변형되어 표시되는 컴포넌트
 * Design: Retro Arcade Suffering
 * Challenge: 피드백 왜곡 (Feedback Distortion)
 */
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';

function distortText(text: string): string {
  // 숫자 순서 섞기
  const chars = text.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function substituteChars(text: string): string {
  const substitutions: Record<string, string> = {
    'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '5',
    'A': '4', 'E': '€', 'I': '!', 'O': 'Ø', 'S': '$',
    '1': 'l', '0': 'O', '5': 'S',
  };
  return text.split('').map(c => Math.random() < 0.3 ? (substitutions[c] || c) : c).join('');
}

function addNoise(text: string): string {
  const noiseChars = '!@#$%^&*';
  return text.split('').map(c => {
    if (Math.random() < 0.15) {
      return c + noiseChars[Math.floor(Math.random() * noiseChars.length)];
    }
    return c;
  }).join('');
}

const DISTORT_MODES = [
  { name: '순서 섞기', fn: distortText, color: '#FF006E' },
  { name: '문자 치환', fn: substituteChars, color: '#FFE600' },
  { name: '노이즈 추가', fn: addNoise, color: '#00B4FF' },
];

interface Props {
  onComplete?: () => void;
}

export default function DistortedInput({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [modeIdx, setModeIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    const mode = DISTORT_MODES[modeIdx];
    setDisplayText(mode.fn(val));
    addStress(1);
  }, [modeIdx, addStress]);

  const handleSubmit = useCallback(() => {
    setSubmitCount(c => c + 1);
    addStress(10);
    // 3번 제출하면 완료
    if (submitCount >= 2 && !completed) {
      setCompleted(true);
      addScore(350);
      completeChallenge('distorted-input');
      onComplete?.();
    }
    // 모드 변경
    setModeIdx(prev => (prev + 1) % DISTORT_MODES.length);
    setDisplayText(DISTORT_MODES[(modeIdx + 1) % DISTORT_MODES.length].fn(inputText));
  }, [submitCount, completed, modeIdx, inputText, addStress, addScore, completeChallenge, onComplete]);

  const currentMode = DISTORT_MODES[modeIdx];

  return (
    <div className="space-y-4">
      {/* 왜곡 모드 표시 */}
      <div className="flex justify-between items-center">
        <span className="pixel-text" style={{ color: 'rgba(0,255,65,0.5)', fontSize: '0.5rem' }}>
          왜곡 모드:
        </span>
        <motion.span
          key={modeIdx}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="pixel-text"
          style={{ color: currentMode.color, fontSize: '0.55rem' }}
        >
          {currentMode.name}
        </motion.span>
      </div>

      {/* 입력 필드 */}
      <div className="space-y-2">
        <label className="text-xs" style={{ color: 'rgba(0,255,65,0.5)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
          입력:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          disabled={completed}
          placeholder="텍스트를 입력하세요..."
          className="w-full px-3 py-2 outline-none"
          style={{
            background: '#050505',
            border: '1px solid rgba(0,255,65,0.3)',
            color: '#00FF41',
            fontFamily: 'Galmuri11, Space Mono, monospace',
            fontSize: '0.8rem',
          }}
        />
      </div>

      {/* 왜곡된 표시 */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs" style={{ color: 'rgba(0,255,65,0.5)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
            화면에 표시되는 값:
          </label>
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            className="text-xs"
            style={{ color: 'rgba(0,180,255,0.5)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.55rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            [꾹 눌러서 원본 보기]
          </button>
        </div>
        <div
          className="px-3 py-2 min-h-[2.5rem]"
          style={{
            background: '#050505',
            border: `1px solid ${currentMode.color}66`,
            color: currentMode.color,
            fontFamily: 'Galmuri11, Space Mono, monospace',
            fontSize: '0.8rem',
            boxShadow: `0 0 5px ${currentMode.color}33`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={showOriginal ? 'original' : displayText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {showOriginal ? (
                <span style={{ color: '#00FF41' }}>{inputText}</span>
              ) : (
                displayText || <span style={{ opacity: 0.3 }}>왜곡된 텍스트...</span>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={completed || !inputText}
        className="w-full arcade-btn py-2"
        style={{ fontSize: '0.55rem', opacity: (!inputText || completed) ? 0.3 : 1 }}
      >
        {completed ? '✓ 완료!' : `제출 (${submitCount}/3)`}
      </button>

      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        ⚠ 입력한 값이 변형되어 표시됩니다 | 3번 제출하면 완료
      </p>
    </div>
  );
}
