"use client";

import { ReactNode, useEffect, useState } from "react";

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

  useEffect(() => {
    const syncScale = () => setScale(getScale());
    syncScale();

    window.addEventListener("resize", syncScale);
    window.addEventListener("orientationchange", syncScale);

    return () => {
      window.removeEventListener("resize", syncScale);
      window.removeEventListener("orientationchange", syncScale);
    };
  }, []);

  return (
    <div className="phone-stage">
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
