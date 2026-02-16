"use client";

import { useEffect, useRef } from "react";

// OpenAI 로고 SVG path (공식 SVG 기반)
const OPENAI_PATH =
  "M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.05 14.35A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.372L15.115 7.2a.076.076 0 0 1 .071 0l4.766 2.752a4.5 4.5 0 0 1-.676 8.123v-5.678a.79.79 0 0 0-.387-.646zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061L14.19 4.1a4.496 4.496 0 0 1 6.657 4.67zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.496 4.496 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z";

/**
 * OpenAI ChatGPT 로고 아이콘
 * mode: "loading" — Canvas 방사형 펄스 이펙트 (검색 중)
 * mode: "static"  — 로고만 정적 표시 (결과 표시 시)
 */
export default function ClaudeIcon({
  size = 36,
  mode = "static",
}: {
  size?: number;
  mode?: "loading" | "static";
}) {
  const iconSize = size * 0.5;
  const br = Math.round(size * 0.28);

  if (mode === "static") {
    return (
      <div
        className="relative flex shrink-0 items-center justify-center border border-white/10 bg-white/5"
        style={{ width: size, height: size, borderRadius: br }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ width: iconSize, height: iconSize }}
          aria-label="OpenAI ChatGPT"
        >
          <path d={OPENAI_PATH} fill="#ffffff" />
        </svg>
      </div>
    );
  }

  return <RadialPulseIcon size={size} />;
}

function RadialPulseIcon({ size }: { size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const iconSize = size * 0.45;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const NUM_RAYS = 8;
    const BASE_COLOR = "#10a37f";
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // 방사형 빛줄기
      for (let i = 0; i < NUM_RAYS; i++) {
        const angle = (i / NUM_RAYS) * Math.PI * 2;
        const pulse =
          Math.sin(t * 0.045 + i * 0.8) * (size * 0.18) + size * 0.28;
        const opacity = 0.25 + Math.sin(t * 0.045 + i * 0.8) * 0.65;

        const ex = cx + Math.cos(angle) * pulse;
        const ey = cy + Math.sin(angle) * pulse;

        // 끝 점 dot
        const dotOpacity = Math.max(0, opacity);
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle =
          BASE_COLOR +
          Math.floor(dotOpacity * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.fill();

        // 선
        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        grad.addColorStop(0, `${BASE_COLOR}00`);
        grad.addColorStop(
          0.5,
          BASE_COLOR +
            Math.floor(dotOpacity * 180)
              .toString(16)
              .padStart(2, "0"),
        );
        grad.addColorStop(1, `${BASE_COLOR}00`);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 중앙 dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = BASE_COLOR;
      ctx.fill();

      t++;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* OpenAI 로고 — 캔버스 위에 오버레이 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="relative z-10"
        style={{ width: iconSize, height: iconSize }}
        aria-label="OpenAI ChatGPT"
      >
        <path d={OPENAI_PATH} fill="#ffffff" />
      </svg>
    </div>
  );
}