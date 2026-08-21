"use client";

import type { PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const SCREEN_WIDTH = 402;
const SCREEN_HEIGHT = 874;
const DEVICE_WIDTH = 434;
const DEVICE_HEIGHT = 906;

function getScale() {
  if (typeof window === "undefined") return 1;

  const widthScale = window.innerWidth / DEVICE_WIDTH;
  const heightScale = window.innerHeight / DEVICE_HEIGHT;

  return Math.max(0.1, Math.min(1, widthScale, heightScale));
}

export default function PhoneFrame({ children }: { children: ReactNode }) {
  // null = 还没量过窗口，交给 CSS 的 scale(min(1, 100vw/434px, 100vh/906px))
  // 若一上来写成 scale(1)，Cursor 小预览会被 html/body overflow:hidden 裁成一片空白
  const [scale, setScale] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pointerIdleTimerRef = useRef<number | null>(null);
  const lastPointerRef = useRef({ x: 0.5, y: 0.5, time: 0 });

  useEffect(() => {
    const syncScale = () => setScale(getScale());
    syncScale();

    window.addEventListener("resize", syncScale);
    window.addEventListener("orientationchange", syncScale);

    return () => {
      window.removeEventListener("resize", syncScale);
      window.removeEventListener("orientationchange", syncScale);
      if (pointerFrameRef.current != null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
      if (pointerIdleTimerRef.current != null) {
        window.clearTimeout(pointerIdleTimerRef.current);
      }
    };
  }, []);

  function syncLiquidPointer(event: PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const now = performance.now();
    const previous = lastPointerRef.current;
    const elapsed = previous.time === 0 ? 16 : Math.max(16, now - previous.time);

    // Liquid Ether 原版的关键观感来自“指针输入搅动流体”。
    // 这里不引入 WebGL，而是把位置与速度写入 CSS 变量，让背景层用这些变量产生拖拽和涟漪。
    const velocityX = Math.max(-1, Math.min(1, ((x - previous.x) / elapsed) * 520));
    const velocityY = Math.max(-1, Math.min(1, ((y - previous.y) / elapsed) * 520));
    const wake = Math.min(1, Math.hypot(velocityX, velocityY));

    lastPointerRef.current = { x, y, time: now };

    if (pointerFrameRef.current != null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
    }

    pointerFrameRef.current = window.requestAnimationFrame(() => {
      const shiftX = (x - 0.5) * 92;
      const shiftY = (y - 0.5) * 70;
      const wakeX = velocityX * 86;
      const wakeY = velocityY * 58;

      stage.style.setProperty("--liquid-pointer-x", `${(x * 100).toFixed(2)}%`);
      stage.style.setProperty("--liquid-pointer-y", `${(y * 100).toFixed(2)}%`);
      stage.style.setProperty("--liquid-pointer-active", "1");
      stage.style.setProperty("--liquid-pointer-alpha", "0.78");
      stage.style.setProperty("--liquid-pointer-wake", wake.toFixed(3));
      stage.style.setProperty("--liquid-wake-alpha", (0.24 + wake * 0.46).toFixed(3));
      stage.style.setProperty("--liquid-cursor-scale", (0.86 + wake * 0.34).toFixed(3));
      stage.style.setProperty("--liquid-shift-x", `${shiftX.toFixed(1)}px`);
      stage.style.setProperty("--liquid-shift-y", `${shiftY.toFixed(1)}px`);
      stage.style.setProperty("--liquid-shift-x-soft", `${(shiftX * 0.52).toFixed(1)}px`);
      stage.style.setProperty("--liquid-shift-y-soft", `${(shiftY * 0.52).toFixed(1)}px`);
      stage.style.setProperty("--liquid-shift-x-inverse", `${(-shiftX * 0.45).toFixed(1)}px`);
      stage.style.setProperty("--liquid-shift-y-inverse", `${(-shiftY * 0.45).toFixed(1)}px`);
      stage.style.setProperty("--liquid-wake-x", `${wakeX.toFixed(1)}px`);
      stage.style.setProperty("--liquid-wake-y", `${wakeY.toFixed(1)}px`);
      stage.style.setProperty("--liquid-wake-x-inverse", `${(-wakeX * 0.72).toFixed(1)}px`);
      stage.style.setProperty("--liquid-wake-y-inverse", `${(-wakeY * 0.72).toFixed(1)}px`);
      pointerFrameRef.current = null;
    });

    if (pointerIdleTimerRef.current != null) {
      window.clearTimeout(pointerIdleTimerRef.current);
    }

    pointerIdleTimerRef.current = window.setTimeout(() => {
      const currentStage = stageRef.current;
      if (!currentStage) return;
      currentStage.style.setProperty("--liquid-pointer-wake", "0");
      currentStage.style.setProperty("--liquid-wake-alpha", "0");
      currentStage.style.setProperty("--liquid-cursor-scale", "0.86");
      currentStage.style.setProperty("--liquid-wake-x", "0px");
      currentStage.style.setProperty("--liquid-wake-y", "0px");
      currentStage.style.setProperty("--liquid-wake-x-inverse", "0px");
      currentStage.style.setProperty("--liquid-wake-y-inverse", "0px");
    }, 180);
  }

  function resetLiquidPointer() {
    const stage = stageRef.current;
    if (!stage) return;

    stage.style.setProperty("--liquid-pointer-active", "0");
    stage.style.setProperty("--liquid-pointer-alpha", "0");
    stage.style.setProperty("--liquid-pointer-wake", "0");
    stage.style.setProperty("--liquid-wake-alpha", "0");
    stage.style.setProperty("--liquid-cursor-scale", "0.72");
    stage.style.setProperty("--liquid-wake-x", "0px");
    stage.style.setProperty("--liquid-wake-y", "0px");
    stage.style.setProperty("--liquid-wake-x-inverse", "0px");
    stage.style.setProperty("--liquid-wake-y-inverse", "0px");
  }

  return (
    <div
      ref={stageRef}
      className="phone-stage"
      onPointerMove={syncLiquidPointer}
      onPointerLeave={resetLiquidPointer}
    >
      <div className="liquid-ether-bg" data-testid="liquid-ether-bg" aria-hidden="true">
        <span className="liquid-ether-cursor" />
        <span className="liquid-ether-blob liquid-ether-blob-a" />
        <span className="liquid-ether-blob liquid-ether-blob-b" />
        <span className="liquid-ether-blob liquid-ether-blob-c" />
        <span className="liquid-ether-ribbon liquid-ether-ribbon-a" />
        <span className="liquid-ether-ribbon liquid-ether-ribbon-b" />
      </div>
      <div
        data-testid="phone-frame"
        className="phone-device"
        style={{
          ...(scale != null ? { transform: `scale(${scale})` } : {}),
          ["--phone-screen-w" as string]: `${SCREEN_WIDTH}px`,
          ["--phone-screen-h" as string]: `${SCREEN_HEIGHT}px`,
        }}
      >
        <div className="phone-side-button phone-side-button-left" />
        <div className="phone-side-button phone-side-button-right" />
        <div
          id="phone-viewport-root"
          data-testid="phone-viewport"
          className="phone-screen"
        >
          <div data-testid="phone-scroll-root" className="phone-scroll-root">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
