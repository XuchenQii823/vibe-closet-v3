"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import MaterialIcon from "@/components/MaterialIcon";
import { getMeta, setMeta } from "@/lib/closet/meta";

// Splash / 开机页（/）：SYSTEM.INIT 终端面板 + 品牌 + 主视觉 + 单 CTA。1:1 还原原型。
const SPLASH_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6ez2Y9lMdM07nZZ087o1WWT8GzG5OTtsROp_UmU6hK4V9eyN2DZxA_tBA-izilFuuzFnFWXmCh7HBNu5HeT_RWTfISFoSc-fkcsab-47y6v06y4hpyBEqcaebNVdPjmidojoh6AdwPNzzBKjya3lcssWUn-qiUUsAcZ7-gIm0vIe-uvX0D1XSZ_sBabW9xWav5m4NZ1bwPGFDU9wp1QVcmJtSN1Jhg5HiVU-eG9Z1YAsjYPOd7Q8-dA8928U00sR6-4B3QP67gU";

export default function SplashPage() {
  const router = useRouter();

  // 二次启动直达 /closet：已看过 onboarding 则自动跳过（≤ 即时）。
  useEffect(() => {
    if (getMeta().onboardingSeen) {
      router.replace("/closet");
    }
  }, [router]);

  const enter = () => {
    // 写标记失败（隐私模式）不阻断进入
    try {
      setMeta({ onboardingSeen: true });
    } catch {
      /* ignore */
    }
    router.push("/closet");
  };

  return (
    <div data-testid="splash-screen" className="flex flex-col h-screen">
      <TopAppBar />
      <main className="w-full max-w-md mx-auto px-margin-mobile flex-1 flex flex-col justify-center items-center py-8 relative">
        <section className="w-full retro-border hard-shadow bg-surface-container-lowest flex flex-col overflow-hidden relative">
          {/* SYSTEM.INIT 标题栏 */}
          <div
            data-testid="splash-system-init"
            className="bg-brand-black text-on-tertiary px-4 py-2 flex justify-between items-center border-b-2 border-brand-black"
          >
            <span className="font-label-sm text-label-sm text-brand-mint uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-mint animate-pulse rounded-full" />{" "}
              SYSTEM.INIT
            </span>
            <div className="flex gap-2">
              <div className="w-3 h-3 border border-on-tertiary bg-transparent" />
              <div className="w-3 h-3 border border-on-tertiary bg-transparent" />
              <div className="w-3 h-3 border border-on-tertiary bg-brand-blush" />
            </div>
          </div>

          <div className="p-6 flex flex-col items-center text-center space-y-8 relative z-10 scanline">
            {/* 品牌区 */}
            <div className="space-y-3 w-full bg-white/80 p-4 retro-border hard-shadow-sm">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tighter uppercase">
                VIBE CLOSET
              </h2>
              <div className="h-0.5 w-full bg-brand-black my-2" />
              <p className="font-body-md text-body-md font-bold text-tertiary">
                用你已有的衣服，穿出设计师的样子
              </p>
            </div>

            {/* 主视觉图 */}
            <div className="w-full aspect-[4/3] retro-border hard-shadow-sm bg-brand-blush relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Wardrobe interface"
                className="w-full h-full object-cover filter grayscale contrast-125 mix-blend-multiply opacity-80"
                src={SPLASH_IMG}
              />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] mix-blend-overlay" />
              <div className="absolute bottom-2 right-2 bg-brand-black text-brand-mint text-[10px] font-headline-md px-1 py-0.5 retro-border border-brand-mint uppercase">
                Loading_Modules...
              </div>
            </div>

            {/* 主 CTA */}
            <button
              data-testid="splash-enter-btn"
              onClick={enter}
              className="w-full py-4 bg-brand-mint retro-border hard-shadow btn-press font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-2 group transition-all"
            >
              立即开启数字衣橱{" "}
              <MaterialIcon
                name="arrow_forward"
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </section>
      </main>
      <BottomNavBar />
    </div>
  );
}
