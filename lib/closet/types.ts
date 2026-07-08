// ===== Vibe Closet 领域数据模型 =====
// 单一事实来源：页面/组件统一从这里引用类型，避免各处重复定义导致 drift。

/** 单品类别集合（筛选条另含 All 虚拟项，不属于真实类别）。 */
export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** 筛选条用的伪类别（含 All）。 */
export const FILTERS = ["All", ...CATEGORIES] as const;
export type Filter = (typeof FILTERS)[number];

/** 衣橱单品：图片以压缩后的 base64 dataURL 存储。 */
export interface ClosetItem {
  id: string;
  name: string;
  category: Category;
  /** 材质/风格标签，如 Cotton / Denim（可选）。 */
  tag?: string;
  /** 颜色提示，用于 AI 搭配与兜底配色，如「米白」（可选）。 */
  colorHint?: string;
  /** 压缩后的 base64 dataURL（长边 ≤ ~1000px）。 */
  image: string;
  favorite: boolean;
  createdAt: number;
}

/** Result 拼贴排版变体（现仅保留 scrapbook；stack 保留以兼容旧存档）。 */
export type LookLayout = "stack" | "scrapbook";

/** 每次生成的穿搭套数。 */
export const LOOKS_PER_GEN = 3;

/** 收藏搭配：只存 itemIds 引用，不复制图片，控制 localStorage 配额。 */
export interface Look {
  id: string;
  /** 自增序号，用于展示 L-042 这类编号。 */
  serial: number;
  title: string;
  skillId: number;
  itemIds: string[];
  /** AI / 兜底给出的中文搭配理由。 */
  reason?: string;
  layout?: LookLayout;
  favorite: boolean;
  createdAt: number;
  /** "ai" | "fallback"：标记本套来自在线模型还是本地兜底。 */
  source?: "ai" | "fallback";
}

/** 预设风格 Skill（前端静态常量，不持久化）。 */
export interface StyleSkill {
  id: number;
  title: string;
  desc: string;
  img: string;
  /** 传给模型的风格提示词。 */
  promptHint: string;
  /** 卡片图区底色 class。 */
  color: string;
}

/** 界面语言：默认英文（en），可切中文（zh）。存于 meta，跨会话记忆。 */
export type Lang = "en" | "zh";

/** localStorage 元数据：onboarding 标记 + 自增计数器 + schema 版本 + 界面语言。 */
export interface ClosetMeta {
  onboardingSeen: boolean;
  lookSerialCounter: number;
  schemaVersion: number;
  lang: Lang;
}

// ===== /api/style 请求 / 响应约定 =====

export interface StyleRequestItem {
  id: string;
  category: Category;
  name: string;
  color?: string;
  tag?: string;
}

export interface StyleRequest {
  items: StyleRequestItem[];
  skillId: number;
  /** REGENERATE 时为 true，服务端升 temperature 并要求与上次不同。 */
  regenerate?: boolean;
}

export interface StyleLook {
  title: string;
  itemIds: string[];
  reason: string;
}

export interface StyleResponse {
  looks: StyleLook[];
  /** "ai"：来自 Qwen；"fallback"：本地规则兜底。 */
  source: "ai" | "fallback";
}
