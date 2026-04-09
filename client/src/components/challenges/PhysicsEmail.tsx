/**
 * PhysicsEmail - 떨어지는 글자를 드래그해서 입력창에 차곡차곡 쌓기
 * 글자가 커서를 피해 도망다닙니다.
 */
import { useStress } from '@/contexts/StressContext';
import { useCallback, useEffect, useRef, useState } from 'react';

const TARGET = 'user@hello.com';
const CONTAINER_W = 360;
const CONTAINER_H = 215;
const DROP_ZONE_H = 36;       // 더 좁은 드롭존
const CHAR_W = 28;
const CHAR_H = 28;
const FLEE_R_DECOY = 90;      // 데코이 글자 도주 반경
const FLEE_R_NEXT  = 55;      // 다음 글자 도주 반경
const CHAR_TIMER_SEC = 10;    // 캐릭터 당 제한 시간

interface FallingChar {
  id: number;
  char: string;
  index: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
}

interface PlacedChar {
  char: string;
  tilt: number;
}

export default function PhysicsEmail({ onComplete }: { onComplete?: () => void }) {
  const { addStress, addScore, completeChallenge } = useStress();

  const [chars, setChars] = useState<FallingChar[]>(() =>
    TARGET.split('').map((char, i) => ({
      id: i,
      char,
      index: i,
      x: 20 + (i % 7) * 46,
      y: -CHAR_H - i * 90,
      vy: 1.5 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 1.0,
    }))
  );
  const [placed, setPlaced]         = useState<PlacedChar[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragPos, setDragPos]       = useState({ x: 0, y: 0 });
  const [message, setMessage]       = useState<{ text: string; ok: boolean } | null>(null);
  const [charTimeLeft, setCharTimeLeft] = useState(CHAR_TIMER_SEC);

  const containerRef      = useRef<HTMLDivElement>(null);
  const draggingIdRef     = useRef<number | null>(null);
  const placedRef         = useRef<PlacedChar[]>([]);
  const charsRef          = useRef<FallingChar[]>(chars);
  const completedRef      = useRef(false);
  const mouseVelRef       = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastTime: 0 });
  const mousePosRef       = useRef({ x: -999, y: -999 }); // container-relative
  const charTimeLeftRef   = useRef(CHAR_TIMER_SEC);
  const windRef           = useRef(0);
  const windTimerRef      = useRef(30);

  useEffect(() => { draggingIdRef.current = draggingId; }, [draggingId]);
  useEffect(() => { placedRef.current = placed; }, [placed]);
  useEffect(() => { charsRef.current = chars; }, [chars]);

  // ── 캐릭터 타이머: 글자를 하나 쌓을 때마다 리셋 ─────────────────
  useEffect(() => {
    if (completedRef.current) return;
    charTimeLeftRef.current = CHAR_TIMER_SEC;
    setCharTimeLeft(CHAR_TIMER_SEC);

    const iv = setInterval(() => {
      charTimeLeftRef.current -= 1;
      setCharTimeLeft(charTimeLeftRef.current);
      if (charTimeLeftRef.current <= 0) {
        charTimeLeftRef.current = CHAR_TIMER_SEC;
        setCharTimeLeft(CHAR_TIMER_SEC);
        addStress(10);
        setMessage({ text: '시간 초과! +10 스트레스', ok: false });
        setTimeout(() => setMessage(null), 2000);
        // 다음 글자 위로 튕겨 올림
        setChars(prev => prev.map(c =>
          c.index === placedRef.current.length
            ? { ...c, x: 20 + Math.random() * (CONTAINER_W - CHAR_W - 40), y: -CHAR_H - 30, vy: 2.5 + Math.random(), vx: (Math.random() - 0.5) * 3 }
            : c
        ));
      }
    }, 1000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed.length]);

  // ── 물리 루프 ────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      // 바람 업데이트
      windTimerRef.current--;
      if (windTimerRef.current <= 0) {
        windRef.current = (Math.random() - 0.5) * 2.0;
        windTimerRef.current = 20 + Math.floor(Math.random() * 40);
      }
      const wind = windRef.current;
      const { x: mx, y: my } = mousePosRef.current;
      const nextIdx = placedRef.current.length;

      setChars(prev => {
        // 1차: 위치 업데이트 + 도주 로직
        const step1 = prev.map(c => {
          if (draggingIdRef.current === c.id || c.index < nextIdx) return c;
          let { x, y, vx, vy } = c;

          // 중력 + 바람
          vy += 0.04;
          vx += wind * 0.06;

          // 커서 도주
          const cx = x + CHAR_W / 2;
          const cy = y + CHAR_H / 2;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const fleeR  = c.index === nextIdx ? FLEE_R_NEXT : FLEE_R_DECOY;
          const fleeF  = c.index === nextIdx ? 1.0         : 2.8;
          if (dist < fleeR && dist > 0) {
            const scale = ((fleeR - dist) / fleeR) * fleeF;
            vx += (dx / dist) * scale;
            vy += (dy / dist) * scale * 0.6;
          }

          // 속도 클램프
          vx = Math.max(-5, Math.min(5, vx));
          vy = Math.max(-1, Math.min(5, vy));

          x += vx;
          y += vy;

          // 벽 반사
          if (x < 0)               { x = 0;               vx = Math.abs(vx) * 0.8; }
          if (x > CONTAINER_W - CHAR_W) { x = CONTAINER_W - CHAR_W; vx = -Math.abs(vx) * 0.8; }
          // 바닥 너머로 나가면 위로 리스폰
          if (y > CONTAINER_H + 10) {
            y = -CHAR_H;
            x = 20 + Math.random() * (CONTAINER_W - CHAR_W - 40);
            vx = (Math.random() - 0.5) * 1.5;
            vy = 1.5 + Math.random() * 1.2;
          }
          return { ...c, x, y, vx, vy };
        });

        // 2차: 글자 간 충돌 반발
        return step1.map((c, i) => {
          if (draggingIdRef.current === c.id || c.index < nextIdx) return c;
          let { vx, vy } = c;
          for (let j = 0; j < step1.length; j++) {
            if (i === j) continue;
            const o = step1[j];
            if (o.index < nextIdx || draggingIdRef.current === o.id) continue;
            const dx = (c.x + CHAR_W / 2) - (o.x + CHAR_W / 2);
            const dy = (c.y + CHAR_H / 2) - (o.y + CHAR_H / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CHAR_W * 1.2 && dist > 0) {
              const force = ((CHAR_W * 1.2 - dist) / (CHAR_W * 1.2)) * 1.2;
              vx += (dx / dist) * force;
              vy += (dy / dist) * force * 0.4;
            }
          }
          return { ...c, vx, vy };
        });
      });
    }, 40);
    return () => clearInterval(iv);
  }, []);

  const showMsg = useCallback((text: string, ok = false) => {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 2200);
  }, []);

  // ── 마우스 이벤트 ─────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt  = Math.max(1, now - mouseVelRef.current.lastTime);
      mouseVelRef.current.vx    = (e.clientX - mouseVelRef.current.lastX) / dt;
      mouseVelRef.current.vy    = (e.clientY - mouseVelRef.current.lastY) / dt;
      mouseVelRef.current.lastX = e.clientX;
      mouseVelRef.current.lastY = e.clientY;
      mouseVelRef.current.lastTime = now;

      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        mousePosRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      if (draggingIdRef.current !== null && containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDragPos({ x: e.clientX - r.left - CHAR_W / 2, y: e.clientY - r.top - CHAR_H / 2 });
      }
    };

    const onUp = (e: MouseEvent) => {
      const id = draggingIdRef.current;
      if (id === null) return;
      setDraggingId(null);
      draggingIdRef.current = null;

      if (!containerRef.current) return;
      const r    = containerRef.current.getBoundingClientRect();
      const relY = e.clientY - r.top;
      const inW  = e.clientX >= r.left && e.clientX <= r.right;
      const inDZ = relY >= CONTAINER_H - DROP_ZONE_H && relY <= CONTAINER_H;
      if (!inW || !inDZ) return;

      const dragged = charsRef.current.find(c => c.id === id);
      if (!dragged) return;
      const expected = placedRef.current.length;

      if (dragged.index !== expected) {
        showMsg(`'${TARGET[expected]}' 을(를) 먼저 넣어야 합니다!`);
        addStress(3);
        return;
      }

      // 내려놓는 속도로 기울기 결정 — 0.25 px/ms 이하만 성공 가능
      const speed = Math.sqrt(mouseVelRef.current.vx ** 2 + mouseVelRef.current.vy ** 2);
      let tilt: number;
      if (speed < 0.20) {
        tilt = (Math.random() - 0.5) * 8;           // ±4° — 항상 통과
      } else if (speed < 0.45) {
        tilt = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 9); // 8-17° — 아슬
      } else {
        tilt = (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 25); // 반드시 실패
      }

      if (Math.abs(tilt) > 10) {                    // 기준 10° (이전 15°)
        showMsg('글자가 쓰러졌습니다! 더 천천히 내려놓으세요');
        addStress(5);
        return;
      }

      const newPlaced = [...placedRef.current, { char: dragged.char, tilt }];
      placedRef.current = newPlaced;
      setPlaced(newPlaced);
      showMsg(`'${dragged.char}' 쌓기 성공!`, true);

      if (newPlaced.length === TARGET.length && !completedRef.current) {
        completedRef.current = true;
        addScore(800);
        completeChallenge('physics-email');
        onComplete?.();
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [addStress, addScore, completeChallenge, onComplete, showMsg]);

  const nextIdx     = placed.length;
  const timerPct   = (charTimeLeft / CHAR_TIMER_SEC) * 100;
  const timerColor = charTimeLeft <= 3 ? '#FF006E' : charTimeLeft <= 6 ? '#FFE600' : '#00FF41';

  return (
    <div className="space-y-2">
      {/* 입력창 */}
      <div style={{
        minHeight: 44, padding: '6px 10px',
        background: '#050505', border: '1px solid rgba(0,255,65,0.2)',
        display: 'flex', alignItems: 'flex-end', gap: 1,
      }}>
        {placed.length === 0 ? (
          <span style={{ color: 'rgba(0,255,65,0.12)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
            여기에 글자를 차곡차곡 쌓으세요...
          </span>
        ) : placed.map((p, i) => (
          <span key={i} style={{
            display: 'inline-block',
            transform: `rotate(${p.tilt}deg)`,
            transformOrigin: 'bottom center',
            color: '#00FF41', fontFamily: 'monospace', fontSize: '1.05rem', lineHeight: 1,
          }}>
            {p.char}
          </span>
        ))}
      </div>

      {/* 타이머 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: timerColor, fontFamily: 'monospace', fontSize: '0.5rem', width: 14, textAlign: 'right' }}>
          {charTimeLeft}
        </span>
        <div style={{ flex: 1, height: 3, background: '#111', border: '1px solid rgba(0,255,65,0.1)' }}>
          <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
        </div>
        <span style={{ color: 'rgba(0,255,65,0.3)', fontFamily: 'monospace', fontSize: '0.45rem' }}>
          {placed.length}/{TARGET.length}
        </span>
      </div>

      {/* 물리 아레나 */}
      <div ref={containerRef} style={{
        position: 'relative', width: CONTAINER_W, height: CONTAINER_H,
        background: '#020202', border: '1px solid rgba(255,0,110,0.25)',
        overflow: 'hidden', userSelect: 'none', cursor: 'crosshair',
      }}>
        {/* 드롭존 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: DROP_ZONE_H,
          background: 'rgba(0,255,65,0.03)', borderTop: '1px dashed rgba(0,255,65,0.3)',
          pointerEvents: 'none',
        }}>
          <span style={{ color: 'rgba(0,255,65,0.3)', fontSize: '0.4rem', fontFamily: 'monospace', position: 'absolute', bottom: 4, left: 6 }}>
            ▼ DROP ZONE — 손 멈추고 천천히
          </span>
        </div>

        {/* 떨어지는 글자들 */}
        {chars.map(c => {
          if (c.index < placed.length) return null;
          const isDragging = draggingId === c.id;
          const isNext     = c.index === nextIdx;
          return (
            <div
              key={c.id}
              onMouseDown={e => {
                e.preventDefault();
                if (!isNext) {
                  showMsg(`순서가 틀렸습니다 — '${TARGET[nextIdx]}' 먼저!`);
                  addStress(2);
                  return;
                }
                const r = containerRef.current?.getBoundingClientRect();
                if (r) setDragPos({ x: e.clientX - r.left - CHAR_W / 2, y: e.clientY - r.top - CHAR_H / 2 });
                setDraggingId(c.id);
                draggingIdRef.current = c.id;
              }}
              style={{
                position: 'absolute',
                left: isDragging ? dragPos.x : c.x,
                top:  isDragging ? dragPos.y : c.y,
                width: CHAR_W, height: CHAR_H,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDragging ? 'rgba(0,255,65,0.4)'
                  : isNext ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,110,0.05)',
                border: `1px solid ${isDragging ? '#00FF41' : isNext ? 'rgba(0,255,65,0.55)' : 'rgba(255,0,110,0.2)'}`,
                color: isNext ? '#00FF41' : 'rgba(255,0,110,0.4)',
                cursor: isNext ? (isDragging ? 'grabbing' : 'grab') : 'not-allowed',
                fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 'bold',
                zIndex: isDragging ? 100 : 1,
                boxShadow: isNext ? `0 0 ${charTimeLeft <= 3 ? 12 : 6}px rgba(0,255,65,0.35)` : 'none',
                transition: isDragging ? 'none' : 'left 0ms, top 0ms',
              }}
            >
              {c.char}
            </div>
          );
        })}
      </div>

      {/* 메시지 */}
      <p style={{ color: message?.ok ? '#00FF41' : '#FF006E', fontFamily: 'monospace', fontSize: '0.58rem', minHeight: '1rem' }}>
        {message ? `${message.ok ? '✓' : '⚠'} ${message.text}` : ''}
      </p>

      <p style={{ color: 'rgba(0,255,65,0.2)', fontFamily: 'monospace', fontSize: '0.48rem' }}>
        목표: {TARGET} | 초록 글자를 잡아 드롭존에 아주 천천히 내려놓으세요 | 글자들이 커서를 피해 도망칩니다
      </p>
    </div>
  );
}
