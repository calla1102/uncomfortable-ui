/**
 * TypingAI - 오타를 내고 백스페이스로 지우는 AI 채팅 상담사
 * Design: Retro Arcade Suffering
 * Challenge: 심리적 압박 (Psychological War)
 */
import { useStress } from '@/contexts/StressContext';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  final: boolean;
}

const USER_QUESTIONS = [
  '안녕하세요, 도움이 필요합니다.',
  '비밀번호를 잊어버렸어요.',
  '환불 요청하고 싶습니다.',
];

interface CorrectionStep {
  wrong: string;
  right: string;
  deleteAll?: boolean;
}

interface AIResponseDef {
  typos: string;
  corrections: CorrectionStep[];
  final: string;
}

const AI_RESPONSES: AIResponseDef[] = [
  {
    // 두 군데 오타 → 끝 수정 → 앞 오타도 발견해서 또 수정
    typos:
      '안녕하세요! 무엇을 도와드릴까요? 저는 AI 상담사입니다. 어떤 문재가 이쓰신가요? 제가 최선을 다해 도와드리겠슴니다',
    corrections: [
      { wrong: '겠슴니다', right: '겠습니다.' },
      {
        wrong: '문재가 이쓰신가요? 제가 최선을 다해 도와드리겠습니다.',
        right: '문제가 있으신가요? 제가 최선을 다해 도와드리겠습니다.',
      },
    ],
    final:
      '안녕하세요! 무엇을 도와드릴까요? 저는 AI 상담사입니다. 어떤 문제가 있으신가요? 제가 최선을 다해 도와드리겠습니다.',
  },
  {
    // "잠싲만요..." 타이핑 후 삭제, 끝 오타 수정, 그러나 앞에 쥐소 발견 → 처음부터 전부 삭제
    typos:
      '비밀번호 재설정을 도와드리겠습니다. 이메일 쥐소를 입력해 주세요. 잠시만 기다려 주시면 인증 코드를 발솽해 드리겠습니다. 잠싲만요...',
    corrections: [
      { wrong: ' 잠싲만요...', right: '' },
      { wrong: '발솽해 드리겠습니다.', right: '발송해 드리겠습니다.' },
      {
        deleteAll: true,
        wrong: '',
        right: '비밀번호 재설정을 도와드리겠습니다. 이메일 주소를 입력해 주세요. 잠시만 기다려 주시면 인증 코드를 발송해 드리겠습니다.',
      },
    ],
    final:
      '비밀번호 재설정을 도와드리겠습니다. 이메일 주소를 입력해 주세요. 잠시만 기다려 주시면 인증 코드를 발송해 드리겠습니다.',
  },
  {
    // 수정하다 또 오타 → 또 수정 → 처음에 환뷸이었던 거 발견 → 전부 삭제
    typos:
      '환뷸 요청을 접수해 드리겠습니다. 구매 내역을 확인하겠습니다... 처리까지 영업일 기준 3-5일이 소요됩니다. 불편을 드려서 죄숑합니다',
    corrections: [
      { wrong: '죄숑합니다', right: '죄솟합니다.' },
      { wrong: '죄솟합니다.', right: '죄송합니다.' },
      {
        deleteAll: true,
        wrong: '',
        right: '환불 요청을 접수해 드리겠습니다. 구매 내역을 확인하겠습니다... 처리까지 영업일 기준 3-5일이 소요됩니다. 불편을 드려서 죄송합니다.',
      },
    ],
    final:
      '환불 요청을 접수해 드리겠습니다. 구매 내역을 확인하겠습니다... 처리까지 영업일 기준 3-5일이 소요됩니다. 불편을 드려서 죄송합니다.',
  },
];

interface TypingState {
  text: string;
  phase: 'typing' | 'correcting';
}

export default function TypingAI({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTyping, setCurrentTyping] = useState<TypingState | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, currentTyping]);

  const typePartial = (baseText: string, newPart: string, onDone: (fullText: string) => void) => {
    if (newPart.length === 0) {
      setTimeout(() => onDone(baseText), 200);
      return;
    }
    let idx = 0;
    const type = () => {
      if (idx < newPart.length) {
        idx++;
        setCurrentTyping(prev =>
          prev ? { ...prev, text: baseText + newPart.slice(0, idx), phase: 'typing' } : null
        );
        timerRef.current = setTimeout(type, 45 + Math.random() * 35);
      } else {
        onDone(baseText + newPart);
      }
    };
    setTimeout(type, 250);
  };

  const finalizeMessage = (finalText: string, isLast: boolean) => {
    setCurrentTyping(null);
    setMessages(msgs => [
      ...msgs,
      { id: Date.now(), sender: 'ai', text: finalText, final: true },
    ]);
    if (isLast && !completedRef.current) {
      completedRef.current = true;
      addScore(300);
      completeChallenge('typing-ai');
      onComplete?.();
    }
  };

  const startCorrection = (
    response: AIResponseDef,
    currentText: string,
    stepIndex: number,
    isLast: boolean
  ) => {
    if (stepIndex >= response.corrections.length) {
      setTimeout(() => finalizeMessage(response.final, isLast), 400);
      return;
    }

    const correction = response.corrections[stepIndex];

    if (correction.deleteAll) {
      let text = currentText;
      const del = () => {
        if (text.length > 0) {
          text = text.slice(0, -1);
          setCurrentTyping(prev => (prev ? { ...prev, text, phase: 'correcting' } : null));
          timerRef.current = setTimeout(del, 115 + Math.random() * 45);
        } else {
          typePartial('', correction.right, fullText => {
            startCorrection(response, fullText, stepIndex + 1, isLast);
          });
        }
      };
      timerRef.current = setTimeout(del, 700);
      return;
    }

    const wrongIdx = currentText.lastIndexOf(correction.wrong);
    if (wrongIdx === -1) {
      startCorrection(response, currentText, stepIndex + 1, isLast);
      return;
    }

    const deleteCount = currentText.length - wrongIdx;
    let deletedSoFar = 0;
    const baseText = currentText.slice(0, wrongIdx);

    const deleteChar = () => {
      if (deletedSoFar < deleteCount) {
        deletedSoFar++;
        setCurrentTyping(prev =>
          prev
            ? {
                ...prev,
                text: currentText.slice(0, currentText.length - deletedSoFar),
                phase: 'correcting',
              }
            : null
        );
        timerRef.current = setTimeout(deleteChar, 115 + Math.random() * 45);
      } else {
        typePartial(baseText, correction.right, fullText => {
          startCorrection(response, fullText, stepIndex + 1, isLast);
        });
      }
    };
    timerRef.current = setTimeout(deleteChar, 600);
  };

  const startAIResponse = (responseIdx: number, isLast: boolean) => {
    const response = AI_RESPONSES[responseIdx];
    setCurrentTyping({ text: '', phase: 'typing' });

    let charIdx = 0;
    const typoText = response.typos;

    const typeChar = () => {
      if (charIdx < typoText.length) {
        charIdx++;
        setCurrentTyping(prev => (prev ? { ...prev, text: typoText.slice(0, charIdx) } : null));
        timerRef.current = setTimeout(typeChar, 40 + Math.random() * 30);
      } else {
        setTimeout(() => startCorrection(response, typoText, 0, isLast), 800);
      }
    };
    timerRef.current = setTimeout(typeChar, 500);
  };

  const handleSendQuestion = () => {
    if (currentTyping || questionIdx >= USER_QUESTIONS.length) return;
    const question = USER_QUESTIONS[questionIdx];
    const isLast = questionIdx === USER_QUESTIONS.length - 1;

    setMessages(msgs => [
      ...msgs,
      { id: Date.now(), sender: 'user', text: question, final: true },
    ]);
    addStress(3);
    setTimeout(() => startAIResponse(questionIdx, isLast), 800);
    setQuestionIdx(questionIdx + 1);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={chatRef}
        className="arcade-panel p-3 space-y-3 overflow-y-auto"
        style={{ height: '220px' }}
      >
        <div className="text-center">
          <span className="pixel-text" style={{ color: 'rgba(0,180,255,0.6)', fontSize: '0.45rem' }}>
            ── AI 상담사 연결됨 ──
          </span>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] px-3 py-2"
              style={{
                background: msg.sender === 'user' ? 'rgba(0,180,255,0.15)' : 'rgba(0,255,65,0.08)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(0,180,255,0.4)' : 'rgba(0,255,65,0.3)'}`,
                color: msg.sender === 'user' ? '#00B4FF' : '#00FF41',
                fontFamily: 'Galmuri11, Space Mono, monospace',
                fontSize: '0.65rem',
                lineHeight: '1.5',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {currentTyping && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] px-3 py-2"
              style={{
                background: 'rgba(0,255,65,0.08)',
                border: '1px solid rgba(0,255,65,0.3)',
                color: currentTyping.phase === 'correcting' ? '#FF006E' : '#00FF41',
                fontFamily: 'Galmuri11, Space Mono, monospace',
                fontSize: '0.65rem',
                lineHeight: '1.5',
              }}
            >
              {currentTyping.text}
              <span
                className="blink"
                style={{ color: currentTyping.phase === 'correcting' ? '#FF006E' : '#00FF41' }}
              >
                {currentTyping.phase === 'correcting' ? '◄' : '|'}
              </span>
              {currentTyping.phase === 'correcting' && (
                <span className="ml-1 pixel-text" style={{ color: '#FF006E', fontSize: '0.4rem' }}>
                  [수정 중...]
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div
          className="flex-1 px-3 py-2 text-xs"
          style={{
            background: '#050505',
            border: '1px solid rgba(0,255,65,0.3)',
            color: 'rgba(0,255,65,0.5)',
            fontFamily: 'Galmuri11, Space Mono, monospace',
            fontSize: '0.65rem',
          }}
        >
          {questionIdx < USER_QUESTIONS.length ? USER_QUESTIONS[questionIdx] : '(모든 질문 완료)'}
        </div>
        <button
          onClick={handleSendQuestion}
          disabled={!!currentTyping || questionIdx >= USER_QUESTIONS.length}
          className="arcade-btn px-4"
          style={{
            fontSize: '0.5rem',
            opacity: !!currentTyping || questionIdx >= USER_QUESTIONS.length ? 0.3 : 1,
          }}
        >
          전송
        </button>
      </div>

      <p
        className="text-center text-xs"
        style={{
          color: 'rgba(0,255,65,0.3)',
          fontFamily: 'Galmuri11, Space Mono, monospace',
          fontSize: '0.6rem',
        }}
      >
        ⚠ AI가 오타를 내고 수정하는 것을 지켜보세요
      </p>
    </div>
  );
}
