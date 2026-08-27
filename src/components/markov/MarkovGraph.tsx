"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMarkov } from "@/lib/markov/store";

interface Node2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
}

interface Particle {
  from: number;
  to: number;
  t: number; // 0..1 progress
  speed: number;
}

const STATE_COLORS = [
  "#D97757", // clay
  "#7A9271", // sage
  "#667A94", // slate
  "#B08A50", // ochre
  "#9A7B8F", // mauve
  "#8F8F87", // warm gray
  "#C99A6C", // sand
  "#5F7E70", // pine
  "#8B7CA8", // iris
  "#A65B3F", // rust
];

export default function MarkovGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node2D[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<{ node: number; dx: number; dy: number } | null>(null);
  const hoverRef = useRef<number>(-1);
  const lastStepTimeRef = useRef<number>(0);
  const jumpAnimRef = useRef<{ from: number; to: number; t: number } | null>(null);
  const sizeRef = useRef({ w: 800, h: 520 });
  const unsubRef = useRef<(() => void) | null>(null);
  const curStateRef = useRef(0);

  // sync current state for animations
  useEffect(() => {
    const unsub = useMarkov.subscribe((s) => {
      if (s.current !== curStateRef.current) {
        jumpAnimRef.current = {
          from: curStateRef.current,
          to: s.current,
          t: 0,
        };
        curStateRef.current = s.current;
      }
    });
    unsubRef.current = unsub;
    return () => unsub();
  }, []);

  const initNodes = useCallback((count: number) => {
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.32;
    nodesRef.current = Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      return {
        x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 30,
        y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let prevCount = -1;

    const render = (time: number) => {
      const state = useMarkov.getState();
      const { states, matrix, stats, current } = state;
      const n = states.length;
      const { w, h } = sizeRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (prevCount !== n) {
        initNodes(n);
        particlesRef.current = [];
        prevCount = n;
      }
      const nodes = nodesRef.current;

      /* ---------- physics ---------- */
      if (!dragRef.current) {
        const REPEL = 2600;
        const SPRING = 0.012;
        const CENTER = 0.004;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const d2 = dx * dx + dy * dy;
            const d = Math.sqrt(d2) || 1;
            const f = REPEL / d2;
            const fx = (dx / d) * f * 0.01;
            const fy = (dy / d) * f * 0.01;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const p = matrix[i]?.[j] ?? 0;
            if (p < 0.02) continue;
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const d = Math.hypot(dx, dy) || 1;
            const rest = 130;
            const f = (d - rest) * SPRING * (0.3 + p);
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            nodes[i].vx += fx;
            nodes[i].vy += fy;
            nodes[j].vx -= fx;
            nodes[j].vy -= fy;
          }
        }
        const cx = w / 2;
        const cy = h / 2;
        for (const nd of nodes) {
          nd.vx += (cx - nd.x) * CENTER;
          nd.vy += (cy - nd.y) * CENTER;
          nd.vx *= 0.85;
          nd.vy *= 0.85;
          nd.x += nd.vx;
          nd.y += nd.vy;
          const pad = 60;
          nd.x = Math.max(pad, Math.min(w - pad, nd.x));
          nd.y = Math.max(pad, Math.min(h - pad, nd.y));
        }
      }

      /* ---------- particles ---------- */
      const maxParticles = 140;
      if (time - lastStepTimeRef.current > 90 && particlesRef.current.length < maxParticles) {
        lastStepTimeRef.current = time;
        // spawn particles proportional to probability
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const p = matrix[i]?.[j] ?? 0;
            if (p > 0.12 && Math.random() < p * 0.35 && particlesRef.current.length < maxParticles) {
              particlesRef.current.push({
                from: i,
                to: j,
                t: 0,
                speed: 0.006 + Math.random() * 0.008,
              });
            }
          }
        }
      }
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.t += pt.speed * (state.running ? 1.8 : 1);
        return pt.t < 1;
      });

      /* ---------- draw edges ---------- */
      ctx.clearRect(0, 0, w, h);

      // subtle dot grid
      ctx.fillStyle = "#E5E0D4";
      for (let gx = 22; gx < w; gx += 44) {
        for (let gy = 22; gy < h; gy += 44) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const hovered = hoverRef.current;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const p = matrix[i]?.[j] ?? 0;
          if (p < 0.03) continue;
          const a = nodes[i];
          const b = nodes[j];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          // curve perpendicular offset, self-loops handled separately
          if (i === j) {
            // self loop: small circle above node
            const color = STATE_COLORS[i % STATE_COLORS.length];
            ctx.beginPath();
            const loopR = 16 + p * 14;
            const ang = -Math.PI / 2;
            const lx = a.x + Math.cos(ang) * 34;
            const ly = a.y + Math.sin(ang) * 34;
            ctx.arc(lx, ly, loopR, 0, Math.PI * 2);
            ctx.strokeStyle = color + "55";
            ctx.lineWidth = 1 + p * 7;
            ctx.stroke();
            if (p > 0.25) {
              ctx.fillStyle = "rgba(107,107,100,0.85)";
              ctx.font = "11px var(--font-geist-mono), monospace";
              ctx.textAlign = "center";
              ctx.fillText(p.toFixed(2), lx, ly - loopR - 5);
            }
            continue;
          }
          const curve = 0.18;
          const cpx = mx - dy * curve;
          const cpy = my + dx * curve;
          const isActive = hovered === i || hovered === j || current === i;
          const color =
            hovered === i
              ? STATE_COLORS[i % STATE_COLORS.length]
              : current === i && state.running
                ? "#D97757"
                : "rgba(107,107,100,0.4)";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
          ctx.strokeStyle = isActive ? color : "rgba(107,107,100,0.28)";
          ctx.globalAlpha = hovered >= 0 && !isActive ? 0.25 : 0.9;
          ctx.lineWidth = 1 + p * 6;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // arrowhead
          const t = 0.86;
          const px = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cpx + t * t * b.x;
          const py = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cpy + t * t * b.y;
          const tx = (1 - t) * 2 * (cpx - a.x) + t * 2 * (b.x - cpx);
          const ty = (1 - t) * 2 * (cpy - a.y) + t * 2 * (b.y - cpy);
          const ang2 = Math.atan2(ty, tx);
          const nodeR = 26;
          const ax = b.x - Math.cos(ang2) * (nodeR + 4);
          const ay = b.y - Math.sin(ang2) * (nodeR + 4);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(
            ax - Math.cos(ang2 - 0.5) * (5 + p * 6),
            ay - Math.sin(ang2 - 0.5) * (5 + p * 6)
          );
          ctx.lineTo(
            ax - Math.cos(ang2 + 0.5) * (5 + p * 6),
            ay - Math.sin(ang2 + 0.5) * (5 + p * 6)
          );
          ctx.closePath();
          ctx.fillStyle = isActive ? color : "rgba(107,107,100,0.4)";
          ctx.fill();

          // probability label
          if (p >= 0.18 || hovered === i) {
            const lx2 = (1 - 0.5) * (1 - 0.5) * a.x + 2 * 0.5 * 0.5 * cpx + 0.25 * b.x;
            const ly2 = (1 - 0.5) * (1 - 0.5) * a.y + 2 * 0.5 * 0.5 * cpy + 0.25 * b.y;
            ctx.fillStyle = "rgba(255,255,255,0.94)";
            ctx.beginPath();
            ctx.roundRect(lx2 - 17, ly2 - 9, 34, 16, 4);
            ctx.fill();
            ctx.strokeStyle = "#DDD9CC";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "#3D3D3A";
            ctx.font = "10px var(--font-geist-mono), monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.toFixed(2), lx2, ly2 - 1);
          }
        }
      }

      /* ---------- draw particles ---------- */
      for (const pt of particlesRef.current) {
        const a = nodes[pt.from];
        const b = nodes[pt.to];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const cpx = mx - dy * 0.18;
        const cpy = my + dx * 0.18;
        const t = pt.t;
        const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cpx + t * t * b.x;
        const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cpy + t * t * b.y;
        const color = STATE_COLORS[pt.from % STATE_COLORS.length];
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35 + 0.65 * Math.sin(t * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      /* ---------- jump animation (random walk orb) ---------- */
      const jump = jumpAnimRef.current;
      let orbX: number;
      let orbY: number;
      if (jump && jump.t < 1 && nodes[jump.from] && nodes[jump.to]) {
        jump.t += 0.08;
        const a = nodes[jump.from];
        const b = nodes[jump.to];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const cpx = mx - dy * 0.18;
        const cpy = my + dx * 0.18;
        const t = Math.min(jump.t, 1);
        orbX = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cpx + t * t * b.x;
        orbY = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cpy + t * t * b.y;
      } else {
        orbX = nodes[current]?.x ?? w / 2;
        orbY = nodes[current]?.y ?? h / 2;
      }

      /* ---------- draw nodes ---------- */
      const statDist = stats.stationary;
      const maxStat = statDist ? Math.max(...statDist) : 0;
      for (let i = 0; i < n; i++) {
        const nd = nodes[i];
        const color = STATE_COLORS[i % STATE_COLORS.length];
        const pi = statDist ? statDist[i] : 1 / n;
        const r = 18 + (maxStat > 0 ? (pi / maxStat) * 16 : 8);

        // ring pulse if current — clay, the walker's color
        if (i === current) {
          const pulse = 1 + 0.1 * Math.sin(time / 180);
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, r * pulse + 6, 0, Math.PI * 2);
          ctx.strokeStyle = "#D97757";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.75;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // paper node: white fill, state-color ink ring
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // empirical frequency arc
        const emp = state.empirical[i] ?? 0;
        if (emp > 0.01) {
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, r + 4, -Math.PI / 2, -Math.PI / 2 + emp * Math.PI * 2);
          ctx.strokeStyle = "#1F1E1D";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.65;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // label
        ctx.fillStyle = "#1F1E1D";
        ctx.font = "600 12px var(--font-inter), ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = states[i].length > 9 ? states[i].slice(0, 8) + "…" : states[i];
        ctx.fillText(label, nd.x, nd.y - r - 12);

        // stationary prob below
        if (statDist) {
          ctx.fillStyle = color;
          ctx.font = "10px var(--font-geist-mono), monospace";
          ctx.fillText(`π=${pi.toFixed(2)}`, nd.x, nd.y + r + 13);
        }
      }

      /* ---------- draw orb (clay walker, soft halo) ---------- */
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 1, orbX, orbY, 14);
      orbGrad.addColorStop(0, "rgba(217,119,87,0.5)");
      orbGrad.addColorStop(1, "rgba(217,119,87,0)");
      ctx.beginPath();
      ctx.arc(orbX, orbY, 14, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(orbX, orbY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#D97757";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (unsubRef.current) unsubRef.current();
    };
  }, [initNodes]);

  /* ---------- pointer interactions ---------- */
  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const hitTest = (x: number, y: number) => {
    const nodes = nodesRef.current;
    const states = useMarkov.getState().states;
    for (let i = 0; i < Math.min(nodes.length, states.length); i++) {
      if (Math.hypot(nodes[i].x - x, nodes[i].y - y) < 30) return i;
    }
    return -1;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const { x, y } = getPos(e);
    const hit = hitTest(x, y);
    if (hit >= 0) {
      dragRef.current = { node: hit, dx: x - nodesRef.current[hit].x, dy: y - nodesRef.current[hit].y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { x, y } = getPos(e);
    const drag = dragRef.current;
    if (drag) {
      const nd = nodesRef.current[drag.node];
      if (nd) {
        nd.x = x - drag.dx;
        nd.y = y - drag.dy;
        nd.vx = 0;
        nd.vy = 0;
      }
    } else {
      hoverRef.current = hitTest(x, y);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (hit >= 0) useMarkov.getState().jumpTo(hit);
  };

  return (
    <div
      ref={wrapRef}
      className="panel relative h-[420px] w-full overflow-hidden rounded-xl bg-white sm:h-[520px]"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        style={{ cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (hoverRef.current = -1)}
        onClick={onClick}
      />
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-hairline bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-3 backdrop-blur">
        drag nodes · click a state to teleport the walker
      </div>
    </div>
  );
}
