/**
 * ChallengeCard - 각 챌린지를 감싸는 카드 컴포넌트
 * Design: Retro Arcade Suffering
 * - Expandable with smooth animation
 * - Completed state with green glow
 * - Difficulty bars
 */
import { useStress } from '@/contexts/StressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  points: number;
  children: React.ReactNode;
}

export default function ChallengeCard({
  id, title, subtitle, category, categoryColor, difficulty, points, children
}: Props) {
  const { completedChallenges } = useStress();
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = completedChallenges.has(id);

  return (
    <motion.div
      layout
      className={`challenge-card overflow-hidden ${isCompleted ? 'completed' : ''} ${isExpanded ? 'active' : ''}`}
      style={{
        borderColor: isCompleted
          ? 'rgba(0,255,65,0.5)'
          : isExpanded
          ? `${categoryColor}66`
          : 'rgba(0,255,65,0.12)',
        boxShadow: isCompleted
          ? '0 0 20px rgba(0,255,65,0.1)'
          : isExpanded
          ? `0 0 20px ${categoryColor}18`
          : undefined,
      }}
    >
      {/* 카드 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-white/[0.02]"
      >
        {/* 상태 아이콘 */}
        <div
          className="flex-shrink-0 w-10 h-10 mt-0.5"
          style={{
            display: 'grid',
            placeItems: 'center',
            border: `1px solid ${isCompleted ? '#00FF41' : `${categoryColor}44`}`,
            background: isCompleted ? 'rgba(0,255,65,0.08)' : `${categoryColor}08`,
            boxShadow: isCompleted ? '0 0 8px rgba(0,255,65,0.2)' : undefined,
          }}
        >
          {isCompleted ? (
            <span className="pixel-text neon-green" style={{ fontSize: '1rem' }}>✓</span>
          ) : (
            <span style={{ color: `${categoryColor}cc`, fontSize: '1rem', fontFamily: 'Galmuri11, Space Mono, monospace', fontWeight: 700, lineHeight: 1 }}>
              {difficulty}
            </span>
          )}
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="pixel-text"
              style={{ color: `${categoryColor}88`, fontSize: '0.6rem', letterSpacing: '0.05em' }}
            >
              [{category}]
            </span>
            <span className="pixel-text" style={{ color: '#FFE60088', fontSize: '0.6rem' }}>
              +{points}pt
            </span>
            {isCompleted && (
              <span className="pixel-text neon-green" style={{ fontSize: '0.6rem' }}>
                CLEARED
              </span>
            )}
          </div>
          <h3
            className="pixel-text"
            style={{
              color: isCompleted ? '#00FF41' : '#e0e0e0',
              fontSize: '0.82rem',
              lineHeight: '1.7',
              textShadow: isCompleted ? '0 0 5px rgba(0,255,65,0.3)' : undefined,
            }}
          >
            {title}
          </h3>
          <p
            className="mt-1.5"
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Galmuri11, Space Mono, monospace',
              fontSize: '0.78rem',
              lineHeight: '1.5',
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* 오른쪽: 난이도 + 화살표 */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '14px',
                  background: i < difficulty ? categoryColor : 'rgba(255,255,255,0.08)',
                  boxShadow: i < difficulty ? `0 0 4px ${categoryColor}88` : undefined,
                }}
              />
            ))}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </motion.div>
        </div>
      </button>

      {/* 확장 컨텐츠 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-5"
              style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}
            >
              <div className="pt-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
