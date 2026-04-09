/**
 * RobotCaptcha - 로봇이 아님을 500자 논술로 증명하세요
 */
import { useStress } from '@/contexts/StressContext';
import { useRef, useState } from 'react';

const REJECTION_REASONS = [
  'AI 생성 텍스트 의심 (진정성 점수: 9/100) — 재작성 요망',
  '인간 고유의 감정 패턴이 감지되지 않았습니다',
  '행복·슬픔·분노 핵심 감정 지표 미검출',
  '유사 답변 데이터베이스에서 97.3% 일치 항목 발견됨',
  '감정 표현 다양성 부족 (어휘 엔트로피 0.18 / 기준 2.00)',
  '문장 구조가 지나치게 논리적입니다. 인간은 이렇게 쓰지 않습니다',
  '진정성 점수: 3/100 — 로봇으로 판정됨',
];

type Phase = 'unchecked' | 'essay' | 'analyzing' | 'rejected' | 'accepted';

export default function RobotCaptcha({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [phase, setPhase] = useState<Phase>('unchecked');
  const [essay, setEssay] = useState('');
  const [reason, setReason] = useState('');
  const [attempts, setAttempts] = useState(0);
  const completedRef = useRef(false);

  const handleCheck = () => {
    if (phase === 'unchecked') {
      setPhase('essay');
      addStress(3);
    }
  };

  const handleSubmit = () => {
    if (essay.length < 500) { addStress(2); return; }
    setPhase('analyzing');
    addStress(5);
    const next = attempts + 1;
    setAttempts(next);

    setTimeout(() => {
      // 70% 반려, 5회 초과 시 합격 허용
      const reject = Math.random() < 0.7 && next < 5;
      if (reject) {
        setReason(REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)]);
        setPhase('rejected');
        addStress(10);
      } else {
        setPhase('accepted');
        if (!completedRef.current) {
          completedRef.current = true;
          addScore(400);
          completeChallenge('robot-captcha');
          onComplete?.();
        }
      }
    }, 3000);
  };

  if (phase === 'unchecked') {
    return (
      <div className="p-4">
        <div
          onClick={handleCheck}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            border: '1px solid rgba(0,255,65,0.3)', background: 'rgba(0,255,65,0.03)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 20, height: 20, flexShrink: 0,
            border: '2px solid rgba(0,255,65,0.5)', background: '#050505',
          }} />
          <span style={{ color: '#00FF41', fontFamily: 'Galmuri11, monospace', fontSize: '0.75rem' }}>
            저는 로봇이 아닙니다
          </span>
          <span style={{ marginLeft: 'auto', color: 'rgba(0,255,65,0.25)', fontSize: '0.45rem' }}>
            reCAPTCHA v∞
          </span>
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <p className="pixel-text" style={{ color: '#FFE600', fontSize: '0.6rem' }}>감정 분석 중...</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="animate-bounce"
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFE600', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p style={{ color: 'rgba(255,230,0,0.35)', fontFamily: 'monospace', fontSize: '0.5rem' }}>
          AI 감정 분석 엔진 v4.2 가동 중...
        </p>
      </div>
    );
  }

  if (phase === 'rejected') {
    return (
      <div className="space-y-3 p-4">
        <div style={{ border: '1px solid #FF006E', background: 'rgba(255,0,110,0.05)', padding: '12px 14px' }}>
          <p className="pixel-text" style={{ color: '#FF006E', fontSize: '0.55rem', marginBottom: 6 }}>✗ 인증 실패</p>
          <p style={{ color: 'rgba(255,0,110,0.85)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{reason}</p>
        </div>
        <button
          onClick={() => { setPhase('essay'); setEssay(''); }}
          className="arcade-btn w-full"
          style={{ fontSize: '0.55rem' }}
        >
          다시 작성하기
        </button>
        <p style={{ color: 'rgba(255,0,110,0.3)', fontFamily: 'monospace', fontSize: '0.5rem', textAlign: 'center' }}>
          시도: {attempts}회 | {attempts < 5 ? `${5 - attempts}회 더 실패 가능` : '한계 도달'}
        </p>
      </div>
    );
  }

  if (phase === 'accepted') {
    return (
      <div className="p-4 space-y-3 text-center">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          border: '1px solid #00FF41', background: 'rgba(0,255,65,0.05)',
        }}>
          <div style={{
            width: 20, height: 20, flexShrink: 0,
            border: '2px solid #00FF41', background: '#00FF41',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontSize: '0.8rem', fontWeight: 'bold',
          }}>✓</div>
          <span style={{ color: '#00FF41', fontFamily: 'Galmuri11, monospace', fontSize: '0.75rem' }}>
            인간임이 확인되었습니다
          </span>
        </div>
        <p style={{ color: 'rgba(0,255,65,0.35)', fontFamily: 'monospace', fontSize: '0.52rem' }}>
          총 {attempts}번의 시도 끝에 통과하셨습니다
        </p>
      </div>
    );
  }

  // essay phase
  return (
    <div className="space-y-2">
      <div style={{ border: '1px solid rgba(255,230,0,0.4)', background: 'rgba(255,230,0,0.03)', padding: '10px 12px' }}>
        <p className="pixel-text" style={{ color: '#FFE600', fontSize: '0.52rem', marginBottom: 4 }}>
          ⚠ 로봇이 아님을 증명하세요
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Galmuri11, monospace', fontSize: '0.68rem' }}>
          지금 이 순간의 기분을 500자 이상 서술하시오.
        </p>
        <p style={{ color: 'rgba(255,230,0,0.35)', fontFamily: 'monospace', fontSize: '0.47rem', marginTop: 3 }}>
          AI 감정 분석 엔진이 진정성을 평가합니다. {attempts > 0 && `(${attempts}번째 시도)`}
        </p>
      </div>

      <textarea
        value={essay}
        onChange={e => setEssay(e.target.value)}
        placeholder="지금의 기분을 솔직하게 작성해 주세요..."
        style={{
          width: '100%', height: 130,
          background: '#0A0A0A',
          border: `1px solid ${essay.length >= 500 ? '#00FF41' : 'rgba(0,255,65,0.2)'}`,
          color: '#00FF41',
          fontFamily: 'Galmuri11, monospace',
          fontSize: '0.65rem',
          padding: 8,
          resize: 'none',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          color: essay.length >= 500 ? '#00FF41' : '#FF006E',
          fontFamily: 'monospace', fontSize: '0.52rem',
        }}>
          {essay.length}자 / 500자 {essay.length < 500 ? `(${500 - essay.length}자 더 필요)` : '✓'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={essay.length < 500}
          className="arcade-btn px-4"
          style={{ fontSize: '0.5rem', opacity: essay.length < 500 ? 0.35 : 1 }}
        >
          제출
        </button>
      </div>
    </div>
  );
}
