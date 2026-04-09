/**
 * useSadSound — 클릭할 때마다 한숨/비웃음 소리 재생
 * Web Audio API로 오디오 파일 없이 생성
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  // 브라우저 자동재생 정책 — suspended 상태면 resume
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// 한숨 소리: 천천히 내려가는 노이즈 + 필터
function playSigh() {
  const ac = getCtx();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.7, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ac.currentTime);
  filter.frequency.linearRampToValueAtTime(200, ac.currentTime + 0.6);
  filter.Q.value = 1.2;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.35, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.7);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

// 비웃음 소리: 짧고 빠른 heh-heh 느낌
function playSnicker() {
  const ac = getCtx();
  const now = ac.currentTime;

  // "heh" 두 번 - 짧은 AM 변조 노이즈
  for (let rep = 0; rep < 2; rep++) {
    const offset = rep * 0.18;
    const buf = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.sin((i / data.length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;

    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200 + Math.random() * 300;
    filter.Q.value = 3;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.25, now + offset);
    gain.gain.linearRampToValueAtTime(0, now + offset + 0.13);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    src.start(now + offset);
  }
}

// 낮은 "흠..." 소리: 짧은 허밍
function playHmm() {
  const ac = getCtx();
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(180, now + 0.4);

  // 약간의 떨림
  const lfo = ac.createOscillator();
  lfo.frequency.value = 5;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.35);
  gain.gain.linearRampToValueAtTime(0, now + 0.5);

  osc.connect(gain);
  gain.connect(ac.destination);
  lfo.start(now);
  osc.start(now);
  osc.stop(now + 0.55);
  lfo.stop(now + 0.55);
}

const SOUNDS = [playSigh, playSnicker, playHmm, playSigh, playSnicker];

export async function playSadSound() {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const fn = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
    fn();
  } catch {
    // 자동재생 차단 등 무시
  }
}
