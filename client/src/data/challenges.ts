/**
 * 챌린지 목록 데이터 — 히어로 카운트, 목록, 최종 점수판이 모두 이 배열을 참조한다.
 */
import type { ComponentType } from 'react';
import BalloonButton from '@/components/challenges/BalloonButton';
import BeggingPopup from '@/components/challenges/BeggingPopup';
import ChaosTheme from '@/components/challenges/ChaosTheme';
import DistortedInput from '@/components/challenges/DistortedInput';
import EscapeButton from '@/components/challenges/EscapeButton';
import FontSizeHell from '@/components/challenges/FontSizeHell';
import InertiaScroll from '@/components/challenges/InertiaScroll';
import InvertedScroll from '@/components/challenges/InvertedScroll';
import LongPressButton from '@/components/challenges/LongPressButton';
import LowResTerms from '@/components/challenges/LowResTerms';
import PasswordCham from '@/components/challenges/PasswordCham';
import PhysicsEmail from '@/components/challenges/PhysicsEmail';
import RandomKeyboard from '@/components/challenges/RandomKeyboard';
import RobotCaptcha from '@/components/challenges/RobotCaptcha';
import SlotMachineDatePicker from '@/components/challenges/SlotMachineDatePicker';
import SlowInput from '@/components/challenges/SlowInput';
import SlowLoadingBar from '@/components/challenges/SlowLoadingBar';
import TimingButton from '@/components/challenges/TimingButton';
import TypingAI from '@/components/challenges/TypingAI';
import WeightUI from '@/components/challenges/WeightUI';

export const SECTION_COLORS = {
  input: '#FF006E',
  precision: '#00B4FF',
  psych: '#FFE600',
  visual: '#FF8C00',
  time: '#00FF41',
  feedback: '#FF006E',
};

export interface ChallengeDef {
  id: string;
  title: string;
  /** 완료 토스트에 표시되는 이름 (카드 제목과 다를 수 있음) */
  toastName: string;
  subtitle: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  points: number;
  Component: ComponentType<{ onComplete?: () => void }>;
}

export interface ChallengeSection {
  num: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  challenges: ChallengeDef[];
}

export const CHALLENGE_SECTIONS: ChallengeSection[] = [
  {
    num: '01',
    title: '입력의 고통',
    subtitle: 'Input Hell — 타이핑이 이렇게 힘들 줄이야',
    color: SECTION_COLORS.input,
    icon: '⌨️',
    challenges: [
      {
        id: 'random-keyboard',
        title: '랜덤 키보드',
        toastName: '랜덤 키보드',
        subtitle: '한글 두벌식 자판이 매 입력마다 섞이고, ☠ 함정키·DEL키도 숨어있습니다. 15초 안에 입력하세요',
        category: 'INPUT HELL',
        difficulty: 3,
        points: 300,
        Component: RandomKeyboard,
      },
      {
        id: 'slot-date',
        title: '슬롯머신 생년월일',
        toastName: '슬롯머신 생년월일',
        subtitle: '1995년 8월 15일을 맞추세요. 버튼 방향이 반전되고 확인 누르면 슬롯이 튕길 수 있습니다',
        category: 'INPUT HELL',
        difficulty: 2,
        points: 200,
        Component: SlotMachineDatePicker,
      },
      {
        id: 'long-press',
        title: '길게 눌러야 입력됨',
        toastName: '길게 누르기',
        subtitle: '5초 꾹 누르세요. 버튼이 도망치고 손이 따라가지 않으면 처음부터 — 5번 완료해야 클리어',
        category: 'INPUT HELL',
        difficulty: 4,
        points: 400,
        Component: LongPressButton,
      },
      {
        id: 'physics-email',
        title: '물리 엔진 이메일 입력',
        toastName: '물리 엔진 이메일',
        subtitle: '글자가 화면에서 떨어집니다. 드래그해서 입력창에 차곡차곡 쌓으세요 — 너무 빠르면 쓰러집니다',
        category: 'INPUT HELL',
        difficulty: 4,
        points: 400,
        Component: PhysicsEmail,
      },
      {
        id: 'password-cham',
        title: '패스워드 참참참',
        toastName: '패스워드 참참참',
        subtitle: '참참참 게임에서 이겨야 다음 글자를 입력할 수 있습니다 — 지면 이전 글자가 랜덤하게 바뀝니다',
        category: 'INPUT HELL',
        difficulty: 3,
        points: 300,
        Component: PasswordCham,
      },
      {
        id: 'robot-captcha',
        title: '캡차의 역습',
        toastName: '캡차의 역습',
        subtitle: '"저는 로봇이 아닙니다" 체크 → 지금 기분을 500자 이상 서술 → AI가 진정성 심사',
        category: 'INPUT HELL',
        difficulty: 5,
        points: 500,
        Component: RobotCaptcha,
      },
    ],
  },
  {
    num: '02',
    title: '정밀도 테스트',
    subtitle: 'Precision Tasks — 클릭 하나가 이렇게 어려울 줄이야',
    color: SECTION_COLORS.precision,
    icon: '🎯',
    challenges: [
      {
        id: 'escape-button',
        title: '도망가는 확인 버튼',
        toastName: '도망가는 버튼',
        subtitle: '가까이 갈수록 빠르게 도망 · 투명해짐 · 영역 이탈 시 랜덤 이동',
        category: 'PRECISION',
        difficulty: 4,
        points: 400,
        Component: EscapeButton,
      },
      {
        id: 'timing-button',
        title: '타이밍 버튼',
        toastName: '타이밍 버튼',
        subtitle: '가짜 구간 함정 · 미스 3번 리셋 · 성공할수록 빨라짐 — 5번 성공하면 완료',
        category: 'PRECISION',
        difficulty: 3,
        points: 300,
        Component: TimingButton,
      },
      {
        id: 'inertia-scroll',
        title: '마찰력 제로 관성 스크롤',
        toastName: '관성 스크롤',
        subtitle: '마찰력이 전혀 없습니다. 살짝만 굴려도 끝까지 날아갑니다. 맨 아래에서 2초간 멈춰보세요.',
        category: 'PRECISION',
        difficulty: 3,
        points: 300,
        Component: InertiaScroll,
      },
      {
        id: 'weight-ui',
        title: '무게 중심 UI',
        toastName: '무게 중심 UI',
        subtitle: '커서가 움직이면 모든 버튼이 그쪽으로 쏠려 겹칩니다 — 노란 버튼을 7번 클릭하세요',
        category: 'PRECISION',
        difficulty: 2,
        points: 200,
        Component: WeightUI,
      },
      {
        id: 'balloon-button',
        title: '풍선 버튼',
        toastName: '풍선 버튼',
        subtitle: '모든 버튼이 헬륨 풍선처럼 위로 떠오릅니다 — 탈출 전에 낚아채세요. 놓치면 5초 후 재등장',
        category: 'PRECISION',
        difficulty: 3,
        points: 300,
        Component: BalloonButton,
      },
    ],
  },
  {
    num: '03',
    title: '심리적 압박',
    subtitle: 'Psychological War — 당신의 멘탈을 공격합니다',
    color: SECTION_COLORS.psych,
    icon: '😤',
    challenges: [
      {
        id: 'begging-popup',
        title: '조건부 팝업',
        toastName: '조건부 팝업',
        subtitle: "'예' 클릭 시 가짜 진행 바 역주행 · 3단계 확인 팝업 · 아니오 버튼 멘트 변경",
        category: 'PSYCH WAR',
        difficulty: 3,
        points: 300,
        Component: BeggingPopup,
      },
      {
        id: 'slow-loading',
        title: '느릿느릿 로딩바',
        toastName: '느릿느릿 로딩바',
        subtitle: '99%에서 멈추고 처음부터 다시 하라고 합니다 — 10초 버티면 완료',
        category: 'PSYCH WAR',
        difficulty: 4,
        points: 400,
        Component: SlowLoadingBar,
      },
      {
        id: 'typing-ai',
        title: 'AI 채팅 상담사의 오타',
        toastName: 'AI 채팅 상담사',
        subtitle: 'AI가 오타를 내고 백스페이스로 지우는 걸 지켜보세요',
        category: 'PSYCH WAR',
        difficulty: 1,
        points: 100,
        Component: TypingAI,
      },
    ],
  },
  {
    num: '04',
    title: '시각적 혼란',
    subtitle: 'Visual Chaos — 눈이 혼란스러워집니다',
    color: SECTION_COLORS.visual,
    icon: '👁',
    challenges: [
      {
        id: 'chaos-theme',
        title: '다크/라이트 모드 무작위 전환',
        toastName: '카오스 테마',
        subtitle: '마우스 속도에 따라 테마가 미친 듯이 바뀝니다 — 20회 달성 시 완료',
        category: 'VISUAL CHAOS',
        difficulty: 3,
        points: 300,
        Component: ChaosTheme,
      },
      {
        id: 'inverted-scroll',
        title: '스크롤 방향 반전',
        toastName: '반전 스크롤',
        subtitle: '위로 올리면 아래로, 중간에 방향이 바뀝니다 — 끝까지 스크롤하면 완료',
        category: 'VISUAL CHAOS',
        difficulty: 2,
        points: 200,
        Component: InvertedScroll,
      },
      {
        id: 'font-size-hell',
        title: '조건부 폰트 크기',
        toastName: '조건부 폰트 크기',
        subtitle: '입력 중: 2px로 안 보임 | 커서 빼면: 72px로 화면 가림 — 입력한 내용을 실시간으로 확인 불가',
        category: 'VISUAL CHAOS',
        difficulty: 3,
        points: 300,
        Component: FontSizeHell,
      },
      {
        id: 'low-res-terms',
        title: '저해상도 모드 강제',
        toastName: '저해상도 약관',
        subtitle: '중요한 약관이 8비트 픽셀 아트로 표시됩니다 — 단계마다 해상도가 낮아져 읽기 불가',
        category: 'VISUAL CHAOS',
        difficulty: 3,
        points: 300,
        Component: LowResTerms,
      },
    ],
  },
  {
    num: '05',
    title: '피드백 왜곡',
    subtitle: 'Feedback Distortion — 입력한 값을 믿을 수 없습니다',
    color: SECTION_COLORS.feedback,
    icon: '🔀',
    challenges: [
      {
        id: 'slow-input',
        title: '점점 느려지는 입력',
        toastName: '점점 느려지는 입력',
        subtitle: '글자가 늘어날수록 딜레이가 기하급수적으로 증가합니다',
        category: 'FEEDBACK',
        difficulty: 3,
        points: 300,
        Component: SlowInput,
      },
      {
        id: 'distorted-input',
        title: '입력값 변형',
        toastName: '입력값 변형',
        subtitle: '입력한 값이 변형되어 표시됩니다. 신뢰성 붕괴 — 3번 제출하면 완료',
        category: 'FEEDBACK',
        difficulty: 2,
        points: 200,
        Component: DistortedInput,
      },
    ],
  },
];

export const ALL_CHALLENGES: ChallengeDef[] = CHALLENGE_SECTIONS.flatMap(s => s.challenges);

/** 히어로·목록·최종 점수판이 공유하는 챌린지 총 개수 */
export const TOTAL_CHALLENGES = ALL_CHALLENGES.length;
