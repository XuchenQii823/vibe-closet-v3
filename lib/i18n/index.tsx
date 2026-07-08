"use client";

// ===== 极简 i18n（界面语言切换）=====
// 设计目标：默认英文，用户点顶栏 🌐 切中文，选择存入 meta 跨会话记忆。
// 为什么不引第三方库：MVP 范围只有「主要界面」几十条文案，自带词典 + Context 足够，零依赖更易懂。
// 数据纪律：语言偏好走 lib/closet/meta（getMeta/setMeta），不在组件里直接读写 localStorage。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Lang } from "@/lib/closet/types";
import { getMeta, setMeta } from "@/lib/closet/meta";

// 翻译词典：key 为「页面.含义」；en 为默认，zh 为切换后。
// 注意：品牌词（VIBE CLOSET）、终端装饰字（SYSTEM.INIT / Loading_Modules）不进词典，保持原样。
const DICT: Record<Lang, Record<string, string>> = {
  en: {
    // Splash 开机页
    "splash.slogan": "Dress like a designer with clothes you already own",
    "splash.cta": "Launch Digital Wardrobe",
    // Closet 衣橱
    "closet.storageUnavailable":
      "Storage unavailable: running in temporary mode, data may be lost after closing the page.",
    "closet.emptyTitle": "Your wardrobe is empty",
    "closet.emptyDesc":
      "Snap your first item to start building your digital wardrobe.",
    "closet.emptyCta": "Add an item",
    "closet.addTitle": "Add New Items",
    "closet.addSubtitle": "Tap to snap your wardrobe",
    // Style 风格选择
    "style.heading": "Choose Your Vibe",
    "style.subtitle": "Select a style skill to calibrate your algorithm.",
    "style.needItems":
      "Add at least 2 items in CLOSET first, so the AI can style you.",
    "style.goAdd": "Go to wardrobe",
    "style.generate": "Generate Look",
    // Looks 收藏册
    "looks.title": "Lookbook",
    "looks.subtitle": "Your curated collection of fits.",
    "looks.newLook": "New Look",
    "looks.emptyTitle": "No looks saved yet",
    "looks.emptyDesc": "Generate your first look in STYLE and save it here.",
    // 底部导航
    "nav.closet": "Closet",
    "nav.style": "Style",
    "nav.looks": "Looks",
    // 顶栏语言按钮的无障碍标签
    "topbar.langToggle": "Switch language",
  },
  zh: {
    "splash.slogan": "用你已有的衣服，穿出设计师的样子",
    "splash.cta": "立即开启数字衣橱",
    "closet.storageUnavailable":
      "存储不可用：当前为临时模式，关闭页面后数据可能丢失。",
    "closet.emptyTitle": "衣橱是空的",
    "closet.emptyDesc": "拍下第一件单品，开始搭建数字衣橱。",
    "closet.emptyCta": "去添加单品",
    "closet.addTitle": "添加新单品",
    "closet.addSubtitle": "点击拍下你的衣物",
    "style.heading": "选择你的风格",
    "style.subtitle": "选一个风格技能来校准你的搭配算法。",
    "style.needItems": "先去 CLOSET 添加至少 2 件单品，AI 才能为你搭配。",
    "style.goAdd": "去衣橱添加",
    "style.generate": "生成搭配",
    "looks.title": "收藏册",
    "looks.subtitle": "你精心收藏的搭配。",
    "looks.newLook": "新搭配",
    "looks.emptyTitle": "还没有收藏",
    "looks.emptyDesc": "去 STYLE 生成第一套搭配并保存到这里。",
    "nav.closet": "衣橱",
    "nav.style": "搭配",
    "nav.looks": "收藏",
    "topbar.langToggle": "切换语言",
  },
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** 翻译函数：查不到 key 时回退到英文，再回退到 key 本身（开发期便于发现漏翻）。 */
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 初始恒为 'en'：与服务端渲染默认一致，避免 hydration 不匹配。
  // 挂载后再从 meta 读取用户上次选择（zh 用户会有一次 en→zh 的无感切换）。
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = getMeta().lang;
    if (stored && stored !== lang) setLangState(stored);
    // 仅挂载时读取一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      setMeta({ lang: l }); // 持久化，写失败（隐私模式）不阻断切换
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "zh" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: string) => DICT[lang][key] ?? DICT.en[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** 组件内取当前语言与翻译函数。必须在 LanguageProvider 内使用。 */
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang 必须在 <LanguageProvider> 内使用");
  }
  return ctx;
}
