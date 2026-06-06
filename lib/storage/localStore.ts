// ===== 唯一的 localStorage 封装层 =====
// 规则（TODO §2 全局约定）：页面/组件禁止直接 JSON.parse(localStorage)，
// 一律经此封装 → lib/closet → hooks。集中处理：SSR 安全、序列化、容量超限、隐私模式降级。

export const STORAGE_KEYS = {
  items: "vibe-closet:items",
  looks: "vibe-closet:looks",
  meta: "vibe-closet:meta",
} as const;

/** 写入时容量超限会抛出的标记错误，调用方据此提示「存储已满」。 */
export class QuotaError extends Error {
  constructor(message = "存储空间已满") {
    super(message);
    this.name = "QuotaError";
  }
}

/** localStorage 是否可用（隐私模式 / SSR 下为 false）。 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__vibe_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取并反序列化；任何异常（不存在 / JSON 损坏 / 不可用）都回退到 fallback，
 * 保证页面不因脏数据白屏。
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    // 脱敏日志：只报 key 与错误类型，不打印用户数据原文
    console.error("[storage] read fail", {
      key,
      message: err instanceof Error ? err.message : "unknown",
    });
    return fallback;
  }
}

/**
 * 序列化并写入；容量超限统一抛 QuotaError，其余异常原样抛出。
 * 调用方需 try/catch 以触发 UI 降级（如「存储已满，请删除部分单品」）。
 */
export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    console.error("[storage] write fail", {
      key,
      quota: isQuota,
      message: err instanceof Error ? err.message : "unknown",
    });
    if (isQuota) throw new QuotaError();
    throw err;
  }
}

/** 删除某个 key（隐私模式下静默忽略）。 */
export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* 隐私模式忽略 */
  }
}
