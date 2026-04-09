/**
 * FontSizeHell - 조건부 폰트 크기
 * 입력 중: 2px (안 보임) | 입력창 밖: 72px 오버레이 (화면 가림)
 */
import { useStress } from '@/contexts/StressContext';
import { useRef, useState } from 'react';

const TARGETS = ['동의합니다', '확인했습니다', '계속하겠습니다'];

export default function FontSizeHell({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const completedRef = useRef(false);

  const target = TARGETS[step];

  const submit = () => {
    const v = value;
    setValue('');
    if (v === target) {
      const next = step + 1;
      if (next >= TARGETS.length && !completedRef.current) {
        completedRef.current = true;
        addScore(350);
        completeChallenge('font-size-hell');
        setMsg('✓ 완료!');
        onComplete?.();
      } else {
        setStep(next);
        setMsg('✓ 정확합니다! 다음 단계');
        setTimeout(() => { setMsg(''); inputRef.current?.focus(); }, 1000);
      }
    } else {
      addStress(10);
      setMsg('✗ 틀렸습니다. 다시 시도하세요');
      setTimeout(() => { setMsg(''); inputRef.current?.focus(); }, 1200);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span style={{ color: '#00B4FF', fontFamily: 'monospace', fontSize: '0.55rem' }}>
          단계 {step + 1}/{TARGETS.length}
        </span>
        <span style={{
          color: focused ? '#FF006E' : 'rgba(0,180,255,0.45)',
          fontFamily: 'monospace', fontSize: '0.5rem',
        }}>
          {focused ? '⌨ 입력 중 — 2px' : '👁 보기 모드 — 72px'}
        </span>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 3, background: '#111', border: '1px solid rgba(0,180,255,0.1)' }}>
        <div style={{ width: `${(step / TARGETS.length) * 100}%`, height: '100%', background: '#00B4FF' }} />
      </div>

      {/* 목표 표시 */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(0,180,255,0.05)',
        border: '1px solid rgba(0,180,255,0.2)',
      }}>
        <span style={{ color: 'rgba(0,180,255,0.5)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          입력 목표:{' '}
        </span>
        <strong style={{ color: '#FFE600', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          "{target}"
        </strong>
      </div>

      {/* 입력창 — focused: 2px invisible, unfocused: 14px */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur(); // blur → 오버레이 등장
          }
        }}
        autoComplete="off"
        spellCheck={false}
        placeholder={focused ? '' : '여기를 클릭해서 입력'}
        style={{
          width: '100%',
          background: '#020202',
          border: `1px solid ${focused ? 'rgba(0,180,255,0.5)' : 'rgba(0,180,255,0.2)'}`,
          padding: '10px 12px',
          fontFamily: 'monospace',
          // 핵심: 포커스 시 2px, 아닐 때 14px
          fontSize: focused ? '2px' : '14px',
          color: focused ? 'rgba(0,0,0,0.01)' : '#00B4FF',
          outline: 'none',
          transition: 'none',
        }}
      />

      {/* 72px 전체 화면 오버레이 — 포커스를 잃고 내용이 있을 때 */}
      {!focused && value && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(2,2,2,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <p style={{
            color: 'rgba(0,180,255,0.3)', fontFamily: 'monospace',
            fontSize: '0.55rem', marginBottom: 12,
          }}>
            지금 입력한 내용
          </p>
          <p style={{
            fontSize: 'clamp(48px, 10vw, 72px)',
            color: '#FF006E',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            textAlign: 'center',
            padding: '0 24px',
            textShadow: '0 0 30px rgba(255,0,110,0.5)',
            lineHeight: 1.15,
          }}>
            {value}
          </p>
          <p style={{
            color: 'rgba(255,230,0,0.5)', fontFamily: 'monospace',
            fontSize: '0.6rem', marginTop: 16, marginBottom: 24,
          }}>
            목표: "{target}"
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onMouseDown={(e) => e.preventDefault()} // blur 재발 방지
              onClick={() => { setValue(''); inputRef.current?.focus(); }}
              style={{
                background: 'rgba(0,180,255,0.08)',
                border: '1px solid rgba(0,180,255,0.35)',
                color: '#00B4FF', fontFamily: 'monospace',
                fontSize: '0.65rem', padding: '7px 18px',
              }}
            >
              지우고 다시
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={submit}
              style={{
                background: 'rgba(0,255,65,0.08)',
                border: '1px solid rgba(0,255,65,0.35)',
                color: '#00FF41', fontFamily: 'monospace',
                fontSize: '0.65rem', padding: '7px 18px',
              }}
            >
              제출
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p style={{
          color: msg.startsWith('✓') ? '#00FF41' : '#FF006E',
          fontFamily: 'monospace', fontSize: '0.6rem',
        }}>{msg}</p>
      )}

      <p style={{ color: 'rgba(0,180,255,0.2)', fontFamily: 'monospace', fontSize: '0.45rem' }}>
        입력 중: 2px(안 보임) | 클릭 해제: 72px 화면 가림 | Enter 키로 제출 화면 열기
      </p>
    </div>
  );
}
