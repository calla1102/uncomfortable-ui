/**
 * InertiaScroll - 마찰력이 없는 관성 스크롤
 * 수정 사항:
 * 1. 기존 한국어 텍스트 및 스타일 완벽 복구
 * 2. 물리 로직 안정화 (무한 떨림 방지)
 * 3. 2초 대기 타이머 버그 수정
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { label: '📋 약관 1항', text: '본 서비스를 이용하기 위해서는 아래 모든 항목을 직접 확인하셔야 합니다.' },
  { label: '📋 약관 2항', text: '스크롤 속도를 조절하지 못하면 당사는 책임지지 않습니다.' },
  { label: '📋 약관 3항', text: '관성으로 인한 스크롤 사고는 사용자 과실로 처리됩니다.' },
  { label: '📋 약관 4항', text: '페이지가 날아가는 현상은 기능입니다. 버그가 아닙니다.' },
  { label: '📋 약관 5항', text: '스트레스로 인한 건강 피해는 당사의 의도된 서비스입니다.' },
  { label: '📋 약관 6항', text: '반동으로 다시 올라가는 현상은 "자연스러운 물리 법칙"입니다.' },
  { label: '📋 약관 7항', text: '이 화면을 끄고 싶은 충동이 드는 것은 정상 반응입니다.' },
  { label: '📋 약관 8항', text: '당사는 인간공학을 철저히 무시하는 방향으로 설계되었습니다.' },
  { label: '📋 약관 9항', text: '위 내용을 읽고 이해했다면 아직 충분히 스트레스 받지 않은 것입니다.' },
  { label: '✅ 최종 항목', text: '축하합니다. 맨 아래에 도달했습니다. 2초만 더 버티세요.' },
];

const CONTAINER_H = 210;

export default function InertiaScroll({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const containerRef = useRef<HTMLDivElement>(null);
  const velRef = useRef(0);
  const scrollRef = useRef(0);
  const maxScrollRef = useRef(0);
  const animRef = useRef<number>(0);
  const completedRef = useRef(false);
  const bottomTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const [scrollPct, setScrollPct] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMaxScroll = () => {
      maxScrollRef.current = container.scrollHeight - container.clientHeight;
    };
    updateMaxScroll();

    const loop = () => {
      // 1. 마찰 계수 적용 (0.994)
      velRef.current *= 0.994;
      scrollRef.current += velRef.current;

      // 2. 상단/하단 경계 반동 로직
      if (scrollRef.current <= 0) {
        scrollRef.current = 0;
        if (velRef.current < -0.5) velRef.current = -velRef.current * 0.55;
        else velRef.current = 0;
      }
      if (scrollRef.current >= maxScrollRef.current) {
        scrollRef.current = maxScrollRef.current;
        if (velRef.current > 0.5) velRef.current = -velRef.current * 0.55;
        else velRef.current = 0;
      }

      // 3. 실제 스크롤 위치 적용
      container.scrollTop = scrollRef.current;
      
      const pct = maxScrollRef.current > 0 ? scrollRef.current / maxScrollRef.current : 0;
      setScrollPct(pct);
      setVelocity(Math.round(velRef.current * 10) / 10);

      // 4. 맨 아래 2초 유지 로직 (96% 이상 도달 시)
      if (pct > 0.96 && !completedRef.current) {
        if (!bottomTimerRef.current) {
          bottomTimerRef.current = setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              setCompleted(true);
              addScore(400);
              completeChallenge('inertia-scroll');
              onComplete?.();
            }
          }, 2000);
        }
      } else {
        if (bottomTimerRef.current) {
          clearTimeout(bottomTimerRef.current);
          bottomTimerRef.current = undefined;
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    window.addEventListener('resize', updateMaxScroll);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (bottomTimerRef.current) clearTimeout(bottomTimerRef.current);
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, [addScore, completeChallenge, onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (completedRef.current) return;
      e.preventDefault();
      velRef.current += e.deltaY * 1.1; 
      addStress(2);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [addStress]);

  const progress = Math.min(100, scrollPct * 100);
  const isNearBottom = scrollPct > 0.96 && !completed;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="pixel-text" style={{ color: '#FF006E', fontSize: '0.55rem' }}>
          마찰력: 0% | 반동: 55%
        </span>
        <span style={{ 
          color: Math.abs(velocity) > 5 ? '#FF006E' : 'rgba(0,255,65,0.4)', 
          fontFamily: 'monospace', 
          fontSize: '0.55rem' 
        }}>
          속도: {velocity}
        </span>
      </div>

      <div style={{ height: 4, background: '#111', border: '1px solid rgba(0,255,65,0.15)' }}>
        <div style={{
          width: `${progress}%`, 
          height: '100%',
          background: completed ? '#00FF41' : isNearBottom ? '#FFE600' : '#FF006E',
          transition: 'background 0.3s',
        }} />
      </div>

      <div
        ref={containerRef}
        style={{
          height: CONTAINER_H,
          overflow: 'hidden',
          background: '#020202',
          border: '1px solid rgba(255,0,110,0.2)',
          cursor: 'ns-resize',
        }}
      >
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: i === ITEMS.length - 1 ? 'rgba(0,255,65,0.05)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${i === ITEMS.length - 1 ? 'rgba(0,255,65,0.3)' : 'rgba(255,0,110,0.1)'}`,
              }}
            >
              <p style={{ 
                color: i === ITEMS.length - 1 ? '#00FF41' : '#FF006E', 
                fontFamily: 'Galmuri11, monospace', 
                fontSize: '0.6rem', 
                marginBottom: 3, 
                fontWeight: 'bold' 
              }}>
                {item.label}
              </p>
              <p style={{ 
                color: 'rgba(255,255,255,0.4)', 
                fontFamily: 'Galmuri11, monospace', 
                fontSize: '0.65rem', 
                lineHeight: 1.5 
              }}>
                {item.text}
              </p>
            </div>
          ))}
          <div style={{ height: 40 }} />
        </div>
      </div>

      <div style={{ height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isNearBottom && (
          <p className="pixel-text" style={{ color: '#FFE600', fontSize: '0.55rem', textAlign: 'center' }}>
            ⚡ 잠깐만요! 2초 버티면 완료...
          </p>
        )}
        {completed && (
          <p className="pixel-text" style={{ color: '#00FF41', fontSize: '0.6rem', textAlign: 'center' }}>
            ✓ 버텨냈습니다
          </p>
        )}
      </div>

      <p style={{ color: 'rgba(0,255,65,0.2)', fontFamily: 'monospace', fontSize: '0.5rem', textAlign: 'center' }}>
        ⚠ 마찰력 제로 — 살짝만 스크롤해도 끝까지 날아갑니다 | 맨 아래 2초 유지 시 완료
      </p>
    </div>
  );
}