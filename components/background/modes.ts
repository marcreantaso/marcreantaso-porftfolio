import { Delaunay } from "d3-delaunay";
import { createNoise2D } from "@/lib/math/perlin";

export type ModeId = "vector" | "fibonacci" | "voronoi" | "perlin";

export interface PointerState {
  x: number;
  y: number;
  strength: number;
}

export interface FieldState {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  dt: number;
  pointer: PointerState;
}

export interface Renderer {
  frame: (state: FieldState) => void;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function clear(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#08080a";
  ctx.fillRect(0, 0, width, height);
}

function pointerFalloff(state: FieldState, x: number, y: number, radius: number): number {
  const dx = x - state.pointer.x;
  const dy = y - state.pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance > radius) return 0;
  return (1 - distance / radius) * state.pointer.strength;
}

function createVectorField(): Renderer {
  interface Particle {
    x: number;
    y: number;
    px: number;
    py: number;
    life: number;
    maxLife: number;
    tone: number;
    speed: number;
  }

  let particles: Particle[] = [];
  let width = 0;
  let height = 0;

  const spawn = (particle?: Particle): Particle => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const maxLife = 90 + Math.random() * 180;
    return {
      x,
      y,
      px: x,
      py: y,
      life: Math.random() * maxLife,
      maxLife,
      tone: Math.floor(Math.random() * 3),
      speed: 0.55 + Math.random() * 0.9,
    };
  };

  const ensure = (state: FieldState) => {
    if (width === state.width && height === state.height && particles.length > 0) return;
    width = state.width;
    height = state.height;
    const count = Math.max(60, Math.min(190, Math.floor((width * height) / 13500)));
    particles = Array.from({ length: count }, () => spawn());
  };

  return {
    frame(state) {
      ensure(state);
      const { ctx, width: w, height: h, time, dt, pointer } = state;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(8, 8, 10, 0.16)";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      const tones = [
        "rgba(0, 240, 255, 0.34)",
        "rgba(16, 185, 129, 0.26)",
        "rgba(139, 92, 246, 0.28)",
      ];

      for (const particle of particles) {
        const angle =
          Math.sin(particle.x * 0.0022 + time * 0.24) * 1.9 +
          Math.cos(particle.y * 0.0019 - time * 0.17) * 1.9;

        let vx = Math.cos(angle);
        let vy = Math.sin(angle);

        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 260 && distance > 0.001) {
          const falloff = (1 - distance / 260) * pointer.strength;
          vx += (-dy / distance) * falloff * 2.1 + (dx / distance) * falloff * 0.4;
          vy += (dx / distance) * falloff * 2.1 + (dy / distance) * falloff * 0.4;
        }

        const magnitude = Math.hypot(vx, vy) || 1;
        vx /= magnitude;
        vy /= magnitude;

        const step = particle.speed * Math.min(2.4, dt / 16.67);
        particle.px = particle.x;
        particle.py = particle.y;
        particle.x += vx * step;
        particle.y += vy * step;
        particle.life += 1;

        if (
          particle.life > particle.maxLife ||
          particle.x < -20 ||
          particle.x > w + 20 ||
          particle.y < -20 ||
          particle.y > h + 20
        ) {
          Object.assign(particle, spawn(particle));
          continue;
        }

        const fade = Math.sin((particle.life / particle.maxLife) * Math.PI);
        ctx.strokeStyle = tones[particle.tone];
        ctx.globalAlpha = 0.35 + fade * 0.65;
        ctx.lineWidth = 0.75 + particle.tone * 0.12;
        ctx.beginPath();
        ctx.moveTo(particle.px, particle.py);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 78 + Math.sin(time * 1.4) * 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

function createFibonacciField(): Renderer {
  const COUNT = 260;
  let points: { x: number; y: number; phase: number }[] = [];
  let width = 0;
  let height = 0;

  const ensure = (state: FieldState) => {
    if (width === state.width && height === state.height && points.length > 0) return;
    width = state.width;
    height = state.height;
    const maxRadius = Math.min(width, height) * 0.46;
    points = Array.from({ length: COUNT }, (_, index) => {
      const radius = Math.sqrt(index / (COUNT - 1)) * maxRadius;
      const angle = index * GOLDEN_ANGLE;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        phase: index * 0.18,
      };
    });
  };

  return {
    frame(state) {
      ensure(state);
      const { ctx, width: w, height: h, time, pointer } = state;
      clear(ctx, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const rotation = time * 0.06;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      const projected = points.map((point, index) => {
        let x = point.x * cos - point.y * sin;
        let y = point.x * sin + point.y * cos;

        const dx = cx + x - pointer.x;
        const dy = cy + y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 190 && distance > 0.001) {
          const push = (1 - distance / 190) * 30 * pointer.strength;
          x += (dx / distance) * push;
          y += (dy / distance) * push;
        }

        return { x: cx + x, y: cy + y, index, phase: point.phase };
      });

      ctx.globalCompositeOperation = "lighter";

      // Spiral neighbours: draw light arcs between near-index points.
      for (let i = 0; i < projected.length; i += 1) {
        const a = projected[i];
        for (const offset of [1, 13]) {
          const b = projected[i + offset];
          if (!b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 90) continue;
          ctx.strokeStyle = offset === 1 ? "rgba(0, 240, 255, 0.10)" : "rgba(139, 92, 246, 0.08)";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const tones = ["#00f0ff", "#10b981", "#8b5cf6"];
      for (const point of projected) {
        const radius = 1.1 + (point.index % 5) * 0.22 + Math.sin(time * 1.2 + point.phase) * 0.35;
        ctx.fillStyle = tones[point.index % tones.length];
        ctx.globalAlpha = 0.35 + (point.index / COUNT) * 0.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(0.4, radius), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

function createVoronoiField(): Renderer {
  interface Seed {
    x: number;
    y: number;
    vx: number;
    vy: number;
    phase: number;
  }

  let seeds: Seed[] = [];
  let width = 0;
  let height = 0;

  const ensure = (state: FieldState) => {
    if (width === state.width && height === state.height && seeds.length > 0) return;
    width = state.width;
    height = state.height;
    const count = Math.max(14, Math.min(30, Math.floor((width * height) / 32000)));
    seeds = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  return {
    frame(state) {
      ensure(state);
      const { ctx, width: w, height: h, time, pointer } = state;
      clear(ctx, w, h);

      for (const seed of seeds) {
        seed.x += seed.vx + Math.sin(time * 0.35 + seed.phase) * 0.14;
        seed.y += seed.vy + Math.cos(time * 0.31 + seed.phase) * 0.14;

        if (seed.x < 0 || seed.x > w) seed.vx *= -1;
        if (seed.y < 0 || seed.y > h) seed.vy *= -1;

        const dx = seed.x - pointer.x;
        const dy = seed.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 220 && distance > 0.001) {
          const force = (1 - distance / 220) * pointer.strength * 0.65;
          seed.x += (dx / distance) * force;
          seed.y += (dy / distance) * force;
        }
      }

      const points = seeds.map((seed) => [seed.x, seed.y] as [number, number]);
      const delaunay = Delaunay.from(points);
      const voronoi = delaunay.voronoi([-40, -40, w + 40, h + 40]);
      const fills = [
        "rgba(0, 240, 255, 0.045)",
        "rgba(139, 92, 246, 0.04)",
        "rgba(16, 185, 129, 0.035)",
      ];

      ctx.globalCompositeOperation = "lighter";

      seeds.forEach((seed, index) => {
        const polygon = voronoi.cellPolygon(index);
        if (!polygon) return;

        ctx.beginPath();
        polygon.forEach(([x, y], vertexIndex) => {
          if (vertexIndex === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        const near = pointerFalloff(state, seed.x, seed.y, 320);
        ctx.fillStyle = fills[index % fills.length];
        ctx.fill();
        ctx.strokeStyle =
          near > 0.12
            ? `rgba(0, 240, 255, ${0.16 + near * 0.5})`
            : "rgba(0, 240, 255, 0.15)";
        ctx.lineWidth = near > 0.12 ? 1.1 : 0.7;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(seed.x, seed.y, 1.6 + near * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = near > 0.12 ? "rgba(0, 240, 255, 0.9)" : "rgba(230, 232, 239, 0.45)";
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

function createPerlinField(): Renderer {
  const noise = createNoise2D(20241013);
  let width = 0;
  let height = 0;

  return {
    frame(state) {
      if (width !== state.width || height !== state.height) {
        width = state.width;
        height = state.height;
      }

      const { ctx, width: w, height: h, time, pointer } = state;
      clear(ctx, w, h);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      const layers = 5;
      const tones = [
        "rgba(0, 240, 255, 0.22)",
        "rgba(56, 189, 248, 0.18)",
        "rgba(139, 92, 246, 0.16)",
        "rgba(16, 185, 129, 0.15)",
        "rgba(0, 240, 255, 0.10)",
      ];

      for (let layer = 0; layer < layers; layer += 1) {
        const baseline = h * (0.18 + layer * 0.155);
        const amplitude = 30 + layer * 12;
        const frequency = 0.0016 + layer * 0.0004;

        ctx.beginPath();
        for (let x = -24; x <= w + 24; x += 8) {
          let y =
            baseline +
            noise(x * frequency + layer * 4.7 + time * 0.055, layer * 3.3 + time * 0.035) *
              amplitude;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 210 && distance > 0.001) {
            const ripple = (1 - distance / 210) * pointer.strength;
            y -= Math.sin(distance * 0.07 - time * 1.6) * 16 * ripple;
          }

          if (x === -24) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = tones[layer];
        ctx.lineWidth = 0.9 + (layers - layer) * 0.16;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

export function createRenderer(mode: ModeId): Renderer {
  switch (mode) {
    case "fibonacci":
      return createFibonacciField();
    case "voronoi":
      return createVoronoiField();
    case "perlin":
      return createPerlinField();
    default:
      return createVectorField();
  }
}
