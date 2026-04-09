/**
 * InvertedScroll - 스크롤 방향이 반전되는 컴포넌트
 * Design: Retro Arcade Suffering
 * Challenge: 인지 혼란 유도 UI
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { id: 1, text: '🎮 레벨 1: 입력의 고통', color: '#00FF41' },
  { id: 2, text: '🎯 레벨 2: 정밀도 테스트', color: '#00B4FF' },
  { id: 3, text: '😤 레벨 3: 심리적 압박', color: '#FF006E' },
  { id: 4, text: '👁 레벨 4: 시각적 혼란', color: '#FFE600' },
  { id: 5, text: '⏳ 레벨 5: 시간 기반 고문', color: '#FF8C00' },
  { id: 6, text: '🔀 레벨 6: 피드백 왜곡', color: '#00FF41' },
  { id: 7, text: '🧩 레벨 7: 인터랙션 과도화', color: '#00B4FF' },
  { id: 8, text: '⭐ 레벨 8: 스트레스 지수 MAX', color: '#FF006E' },
  { id: 9, text: '💀 GAME OVER', color: '#FF006E' },
  { id: 10, text: '🔄 다시 시작하기', color: '#FFE600' },
];

interface Props {
  onComplete?: () => void;
}

export default function InvertedScroll({ onComplete }: Props) {
  const { addStress, addScore, completeChallenge } = useStress();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);
  const [isInverted, setIsInverted] = useState(true);
  const maxScroll = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    maxScroll.current = container.scrollHeight - container.clientHeight;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = isInverted ? -e.deltaY : e.deltaY;
      const newScroll = Math.max(0, Math.min(maxScroll.current, container.scrollTop + delta));
      container.scrollTop = newScroll;
      setScrollPos(newScroll);
      setScrollCount(c => c + 1);
      addStress(1);

      // 중간에 방향 바뀜
      if (scrollCount > 0 && scrollCount % 15 === 0) {
        setIsInverted(prev => !prev);
      }

      // 맨 아래까지 스크롤하면 완료
      if (newScroll >= maxScroll.current - 5 && !completed) {
        setCompleted(true);
        addScore(250);
        completeChallenge('inverted-scroll');
        onComplete?.();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isInverted, scrollCount, completed, addStress, addScore, completeChallenge, onComplete]);

  const progress = maxScroll.current > 0 ? (scrollPos / maxScroll.current) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* 방향 표시 */}
      <div className="flex justify-between items-center">
        <span className="pixel-text" style={{ color: isInverted ? '#FF006E' : '#00FF41', fontSize: '0.5rem' }}>
          스크롤 방향: {isInverted ? '⬆ 반전됨' : '⬇ 정상'}
        </span>
        <span className="pixel-text" style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.5rem' }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* 진행 바 */}
      <div className="h-1 w-full" style={{ background: '#111', border: '1px solid rgba(0,255,65,0.2)' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${progress}%`, background: completed ? '#00FF41' : '#FF006E' }}
        />
      </div>

      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        className="arcade-panel overflow-hidden"
        style={{ height: '180px', cursor: 'ns-resize' }}
      >
        <div className="p-3 space-y-2">
          {ITEMS.map(item => (
            <div
              key={item.id}
              className="px-3 py-2 flex items-center gap-2"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${item.color}33`,
                color: item.color,
                fontFamily: 'Galmuri11, Space Mono, monospace',
                fontSize: '0.65rem',
              }}
            >
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'Galmuri11, Space Mono, monospace', fontSize: '0.6rem' }}>
        ⚠ 스크롤 방향이 반전됩니다 | 15번마다 방향 전환 | 스크롤 횟수: {scrollCount}
      </p>
    </div>
  );
}
