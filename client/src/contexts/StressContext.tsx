/**
 * StressContext - 전역 스트레스 지수 관리
 * 사용자가 불편한 UI를 경험할수록 스트레스 지수가 올라가고
 * UI가 점점 더 불편해지는 적응형 방해 시스템
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface StressContextType {
  stress: number; // 0-100
  addStress: (amount: number) => void;
  reduceStress: (amount: number) => void;
  resetStress: () => void;
  completedChallenges: Set<string>;
  completeChallenge: (id: string) => void;
  totalScore: number;
  addScore: (points: number) => void;
  stressLevel: 'calm' | 'annoyed' | 'frustrated' | 'rage';
}

const StressContext = createContext<StressContextType | null>(null);

export function StressProvider({ children }: { children: React.ReactNode }) {
  const [stress, setStress] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const decayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 스트레스 자연 감소
  useEffect(() => {
    decayTimerRef.current = setInterval(() => {
      setStress(prev => Math.max(0, prev - 0.2));
    }, 1000);
    return () => {
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
    };
  }, []);

  const addStress = useCallback((amount: number) => {
    setStress(prev => Math.min(100, prev + amount));
  }, []);

  const reduceStress = useCallback((amount: number) => {
    setStress(prev => Math.max(0, prev - amount));
  }, []);

  const resetStress = useCallback(() => {
    setStress(0);
  }, []);

  const completeChallenge = useCallback((id: string) => {
    setCompletedChallenges(prev => { const next = new Set(Array.from(prev)); next.add(id); return next; });
  }, []);

  const addScore = useCallback((points: number) => {
    setTotalScore(prev => prev + points);
  }, []);

  const stressLevel: StressContextType['stressLevel'] =
    stress < 25 ? 'calm' :
    stress < 50 ? 'annoyed' :
    stress < 75 ? 'frustrated' : 'rage';

  return (
    <StressContext.Provider value={{
      stress,
      addStress,
      reduceStress,
      resetStress,
      completedChallenges,
      completeChallenge,
      totalScore,
      addScore,
      stressLevel,
    }}>
      {children}
    </StressContext.Provider>
  );
}

export function useStress() {
  const ctx = useContext(StressContext);
  if (!ctx) throw new Error('useStress must be used within StressProvider');
  return ctx;
}
