/**
 * PasswordCham - 참참참 게임으로 비밀번호 해독
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState } from 'react';

const TARGET = 'pa$$w0rd';
const DIRS = ['←', '→', '↑', '↓'] as const;
type Dir = typeof DIRS[number];
type Phase = 'idle' | 'counting' | 'choosing' | 'result';

const DIR_ICONS: Record<Dir, string> = { '←': '◀', '→': '▶', '↑': '▲', '↓': '▼' };
const SCRAMBLE = 'ABCDEFGHIJKLMNabcdefghijklmn0123456789!@#%&';

function randomDir(): Dir { return DIRS[Math.floor(Math.random() * 4)]; }
function randomChar(): string { return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]; }

export default function PasswordCham({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [phase, setPhase] = useState<Phase>('idle');
  const [countStep, setCountStep] = useState(0);
  const [playerDir, setPlayerDir] = useState<Dir | null>(null);
  const [aiDir, setAiDir] = useState<Dir | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [display, setDisplay] = useState<string[]>(Array(TARGET.length).fill(''));
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);

  const revealedRef = useRef(0);
  const displayRef = useRef<string[]>(Array(TARGET.length).fill(''));
  const completedRef = useRef(false);
  const choiceTimerRef = useRef<ReturnType<typeof setInterval>>();

  const resolve = (choice: Dir | null) => {
    clearInterval(choiceTimerRef.current);
    const ai = randomDir();
    setAiDir(ai);
    setPlayerDir(choice);
    setPhase('result');

    const win = choice !== null && choice !== ai;
    setResult(win ? 'win' : 'lose');
    addStress(win ? 0 : 6);

    if (win) {
      const r = revealedRef.current;
      const next = [...displayRef.current];
      next[r] = TARGET[r];
      displayRef.current = next;
      setDisplay([...next]);
      revealedRef.current = r + 1;
      setRevealed(r + 1);

      if (r + 1 === TARGET.length && !completedRef.current) {
        completedRef.current = true;
        addScore(500);
        completeChallenge('password-cham');
        onComplete?.();
      }
    } else {
      const r = revealedRef.current;
      if (r > 0) {
        const next = [...displayRef.current];
        next[r - 1] = randomChar();
        displayRef.current = next;
        setDisplay([...next]);
      }
    }
  };

  // 참참참 카운트
  useEffect(() => {
    if (phase !== 'counting') return;
    if (countStep < 3) {
      const t = setTimeout(() => setCountStep(s => s + 1), 650);
      return () => clearTimeout(t);
    }
    setPhase('choosing');
    setTimeLeft(100);
  }, [phase, countStep]);

  // 선택 타이머
  useEffect(() => {
    if (phase !== 'choosing') return;
    choiceTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(choiceTimerRef.current);
          resolve(null);
          return 0;
        }
        return prev - 5;
      });
    }, 80);
    return () => clearInterval(choiceTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startRound = () => {
    setPhase('counting');
    setCountStep(0);
    setPlayerDir(null);
    setAiDir(null);
    setResult(null);
  };

  const face =
    result === 'win' ? '😈' :
    result === 'lose' ? '😂' :
    phase === 'counting' ? '🎲' :
    phase === 'choosing' ? '😤' : '🤖';

  return (
    <div className="space-y-3">
      {/* 비밀번호 디스플레이 */}
      <div className="flex gap-1 justify-center">
        {TARGET.split('').map((_, i) => (
          <div
            key={i}
            style={{
              width: 36, height: 42,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < revealed ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,110,0.05)',
              border: `1px solid ${i < revealed ? 'rgba(0,255,65,0.4)' : 'rgba(255,0,110,0.2)'}`,
              color: i < revealed ? '#00FF41' : 'rgba(255,0,110,0.3)',
              fontFamily: 'monospace',
              fontSize: i < revealed && display[i] !== TARGET[i] ? '0.8rem' : '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {i < revealed ? (display[i] || '?') : i === revealed ? '?' : '·'}
          </div>
        ))}
      </div>
      <p style={{ color: 'rgba(0,255,65,0.4)', fontFamily: 'monospace', fontSize: '0.7rem', textAlign: 'center' }}>
        {revealed}/{TARGET.length} 해독 완료
      </p>

      {/* 게임 영역 */}
      <div
        className="arcade-panel p-4 text-center"
        style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}
      >
        <div style={{ fontSize: '2.8rem' }}>{face}</div>

        {phase === 'idle' && (
          <>
            <p style={{ color: 'rgba(0,255,65,0.6)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {revealed === 0 ? '참참참 게임으로 비밀번호를 해독하세요' : `${revealed}번째 글자까지 해독! 계속!`}
            </p>
            <button onClick={startRound} className="arcade-btn px-6" style={{ fontSize: '0.7rem' }}>
              {revealed === 0 ? '게임 시작' : '다음 글자'}
            </button>
          </>
        )}

        {phase === 'counting' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {['참', '참', '참'].map((w, i) => (
              <span
                key={i}
                className="pixel-text"
                style={{
                  color: i < countStep ? '#FF006E' : 'rgba(255,0,110,0.2)',
                  fontSize: i < countStep ? '1.8rem' : '1.1rem',
                  transition: 'all 0.15s',
                }}
              >
                {w}!
              </span>
            ))}
          </div>
        )}

        {phase === 'choosing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <p style={{ color: '#FFE600', fontFamily: 'monospace', fontSize: '0.8rem' }}>방향을 선택하세요!</p>
            <div style={{ background: '#111', border: '1px solid rgba(255,230,0,0.2)', width: 140, height: 5 }}>
              <div style={{ width: `${timeLeft}%`, height: '100%', background: '#FFE600', transition: 'width 0.08s linear' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: 5 }}>
              <div /><button onClick={() => resolve('↑')} className="arcade-btn" style={{ fontSize: '1rem', padding: '5px' }}>▲</button><div />
              <button onClick={() => resolve('←')} className="arcade-btn" style={{ fontSize: '1rem', padding: '5px' }}>◀</button>
              <div />
              <button onClick={() => resolve('→')} className="arcade-btn" style={{ fontSize: '1rem', padding: '5px' }}>▶</button>
              <div /><button onClick={() => resolve('↓')} className="arcade-btn" style={{ fontSize: '1rem', padding: '5px' }}>▼</button><div />
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(0,255,65,0.5)', fontFamily: 'monospace', fontSize: '0.65rem' }}>나</p>
                <p style={{ fontSize: '1.8rem' }}>{playerDir ? DIR_ICONS[playerDir] : '⏰'}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,0,110,0.5)', fontFamily: 'monospace', fontSize: '0.65rem' }}>AI</p>
                <p style={{ fontSize: '1.8rem' }}>{aiDir ? DIR_ICONS[aiDir] : '?'}</p>
              </div>
            </div>
            <p className="pixel-text" style={{ color: result === 'win' ? '#00FF41' : '#FF006E', fontSize: '0.9rem' }}>
              {result === 'win' ? '✓ 승리!' : '✗ 패배...'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {result === 'win'
                ? `"${TARGET[revealed - 1]}" 해독 성공`
                : revealed > 0 ? '이전 글자가 변형되었습니다!' : '다시 도전하세요'}
            </p>
            {!completedRef.current && (
              <button onClick={startRound} className="arcade-btn px-4" style={{ fontSize: '0.65rem' }}>
                {result === 'win' && revealed < TARGET.length ? '다음 글자' : '다시'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
