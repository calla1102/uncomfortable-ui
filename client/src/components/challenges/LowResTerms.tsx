/**
 * LowResTerms - 저해상도 모드 강제
 * 단계가 올라갈수록 캔버스 해상도가 낮아져 약관을 읽기 어려워집니다.
 * 틀린 답변 시 노이즈 픽셀 추가.
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState } from 'react';

// 약관 내용 + 퀴즈 (정답은 항상 index 1)
const STEPS = [
  {
    title: '약관 1조 (서비스 이용)',
    lines: [
      '본 서비스 이용 시 당사가 원하는',
      '모든 사항에 동의하신 것으로 간주.',
      '계약 유효 기간: 5년.',
      '자동 갱신 포함. 해지 불가.',
    ],
    question: '이 약관의 유효 기간은 몇 년입니까?',
    options: ['1년', '5년', '영구'],
    correct: 1,
  },
  {
    title: '약관 2조 (화면 품질)',
    lines: [
      '화면이 저해상도로 표시되는 현상은',
      '당사의 의도된 보안 기능입니다.',
      '버그가 아니므로 문의 금지.',
      '이의 제기 시 스트레스 가중.',
    ],
    question: '저해상도 화면은 무엇으로 분류됩니까?',
    options: ['버그', '보안 기능', '오류'],
    correct: 1,
  },
  {
    title: '약관 3조 (최종 동의)',
    lines: [
      '최종 동의 버튼 클릭 시 귀하의',
      '인내심을 당사에 위임합니다.',
      '환불 및 철회 불가.',
      '동의를 강력히 권장드립니다.',
    ],
    question: '최종 동의 시 당사에 위임되는 것은?',
    options: ['재산', '인내심', '개인정보'],
    correct: 1,
  },
];

// 단계별 캔버스 크기 (낮을수록 더 픽셀화)
const CANVAS_SIZES = [
  { w: 85, h: 50 },
  { w: 52, h: 30 },
  { w: 30, h: 17 },
];
const DISPLAY_W = 320;
const DISPLAY_H = 190;

function drawTerms(
  canvas: HTMLCanvasElement,
  step: number,
  noise: number,
) {
  const { w, h } = CANVAS_SIZES[step];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 배경
  ctx.fillStyle = '#020202';
  ctx.fillRect(0, 0, w, h);

  // 테두리
  ctx.strokeStyle = 'rgba(255,0,110,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

  const titlePx = [4, 3, 2][step];
  const bodyPx = [3, 2, 1][step];
  const lineH = bodyPx + 2;
  const titleY = titlePx + 2;

  // 제목
  ctx.fillStyle = '#FF006E';
  ctx.font = `bold ${titlePx}px monospace`;
  ctx.fillText(STEPS[step].title, 2, titleY);

  // 구분선
  ctx.fillStyle = 'rgba(255,0,110,0.25)';
  ctx.fillRect(2, titleY + 2, w - 4, 1);

  // 본문
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${bodyPx}px monospace`;
  STEPS[step].lines.forEach((line, i) => {
    ctx.fillText(line, 2, titleY + 4 + i * lineH);
  });

  // 오답 노이즈 픽셀
  if (noise > 0) {
    for (let i = 0; i < noise * 25; i++) {
      ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 100)},110,${Math.random() * 0.5 + 0.2})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }
}

export default function LowResTerms({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [noise, setNoise] = useState(0);
  const [msg, setMsg] = useState('');
  const completedRef = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawTerms(canvasRef.current, step, noise);
    }
  }, [step, noise]);

  const handleAnswer = (idx: number) => {
    if (completedRef.current) return;

    if (idx === STEPS[step].correct) {
      const next = step + 1;
      if (next >= STEPS.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          addScore(300);
          completeChallenge('low-res-terms');
          setMsg('✓ 모든 약관 동의 완료');
          onComplete?.();
        }
      } else {
        setStep(next);
        setNoise(0);
        setMsg('✓ 정답 — 다음 약관');
        setTimeout(() => setMsg(''), 1000);
      }
    } else {
      addStress(8);
      const newNoise = noise + 1;
      setNoise(newNoise);
      setMsg('✗ 오답 — 약관을 다시 읽어보세요');
      setTimeout(() => setMsg(''), 1200);
    }
  };

  const { w, h } = CANVAS_SIZES[step];
  const scaleX = (DISPLAY_W / w).toFixed(1);

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <span style={{ color: '#FF006E', fontFamily: 'monospace', fontSize: '0.55rem' }}>
          저해상도 강제 모드
        </span>
        <span style={{ color: 'rgba(255,0,110,0.4)', fontFamily: 'monospace', fontSize: '0.5rem' }}>
          {w}×{h}px → {scaleX}배 확대 | 단계 {step + 1}/{STEPS.length}
        </span>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 3, background: '#111', border: '1px solid rgba(255,0,110,0.1)' }}>
        <div style={{ width: `${(step / STEPS.length) * 100}%`, height: '100%', background: '#FF006E', transition: 'width 0.3s' }} />
      </div>

      {/* 픽셀화된 캔버스 */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: DISPLAY_W,
            height: DISPLAY_H,
            imageRendering: 'pixelated',
            display: 'block',
            border: '1px solid rgba(255,0,110,0.2)',
          }}
        />
        {/* 해상도 경고 뱃지 */}
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(255,0,110,0.15)',
          border: '1px solid rgba(255,0,110,0.4)',
          color: '#FF006E', fontFamily: 'monospace', fontSize: '0.4rem',
          padding: '2px 5px',
          pointerEvents: 'none',
        }}>
          {w}×{h}
        </div>
        {noise > 0 && (
          <div style={{
            position: 'absolute', bottom: 6, left: 6,
            color: 'rgba(255,0,110,0.6)', fontFamily: 'monospace', fontSize: '0.4rem',
            pointerEvents: 'none',
          }}>
            노이즈 레벨: {noise}
          </div>
        )}
      </div>

      {/* 퀴즈 */}
      <div style={{
        padding: '10px 12px',
        background: 'rgba(255,0,110,0.04)',
        border: '1px solid rgba(255,0,110,0.15)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '0.6rem', marginBottom: 8 }}>
          ❓ {STEPS[step].question}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {STEPS[step].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              style={{
                flex: 1,
                background: 'rgba(255,0,110,0.06)',
                border: '1px solid rgba(255,0,110,0.25)',
                color: 'rgba(255,0,110,0.7)',
                fontFamily: 'Galmuri11, monospace',
                fontSize: '0.6rem',
                padding: '6px 4px',
              }}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <p style={{ color: msg.startsWith('✓') ? '#00FF41' : '#FF006E', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          {msg}
        </p>
      )}

      <p style={{ color: 'rgba(255,0,110,0.2)', fontFamily: 'monospace', fontSize: '0.45rem' }}>
        ⚠ 단계가 올라갈수록 해상도가 낮아집니다 | 오답 시 노이즈 추가
      </p>
    </div>
  );
}
