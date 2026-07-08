"use client";

// 全局客户端 Provider 集合：根布局是服务端组件，无法直接放 Context，
// 故抽出这个 'use client' 包裹层挂在 layout 里。目前仅语言切换，后续可在此叠加。
import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
