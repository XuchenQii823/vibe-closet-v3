import { ClosetItem, Category, Filter } from "./types";
import {
  STORAGE_KEYS,
  isStorageAvailable,
  readJSON,
  writeJSON,
} from "../storage/localStore";
import {
  DEFAULT_CLOSET_ITEMS,
  DEFAULT_CLOSET_SEED_VERSION,
} from "./defaultItems";
import { getMeta, setMeta } from "./meta";

// ===== 衣橱单品纯函数 CRUD =====
// 仅负责读写 vibe-closet:items 数组；不碰 React，便于单测与服务端复用。

/** 生成短随机 id（避免引入 uuid 依赖）。 */
export function genId(prefix = "it"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function getItems(): ClosetItem[] {
  const list = readJSON<ClosetItem[]>(STORAGE_KEYS.items, []);
  return Array.isArray(list) ? list : [];
}

export function saveItems(items: ClosetItem[]): void {
  writeJSON(STORAGE_KEYS.items, items);
}

const DEFAULT_SEED_TAG = "[closet/defaults]";

/**
 * 首次空衣橱初始化默认单品。
 *
 * 为什么放在数据层：页面/组件仍然只走 useCloset → lib/closet → lib/storage，
 * 不直接碰 localStorage；同时用 meta 标记保证用户删空后不会被自动“复活”。
 */
export function ensureDefaultItemsSeeded(): ClosetItem[] {
  const items = getItems();
  const meta = getMeta();

  console.info(DEFAULT_SEED_TAG, "check", {
    itemCount: items.length,
    seeded: meta.defaultClosetSeeded,
    seedVersion: meta.defaultClosetSeedVersion,
  });

  if (meta.defaultClosetSeeded) {
    if (meta.defaultClosetSeedVersion === DEFAULT_CLOSET_SEED_VERSION) {
      return items;
    }

    if (items.length > 0) {
      markDefaultSeeded("existing_items");
      return items;
    }

    console.warn(DEFAULT_SEED_TAG, "legacy seeded flag without version", {
      action: "seed_defaults_once",
      seedVersion: DEFAULT_CLOSET_SEED_VERSION,
    });
  }

  if (items.length > 0) {
    markDefaultSeeded("existing_items");
    return items;
  }

  if (!isStorageAvailable()) {
    console.warn(DEFAULT_SEED_TAG, "storage unavailable, use session defaults", {
      defaultCount: DEFAULT_CLOSET_ITEMS.length,
    });
    return DEFAULT_CLOSET_ITEMS;
  }

  saveItems(DEFAULT_CLOSET_ITEMS);
  markDefaultSeeded("seed_defaults");
  console.info(DEFAULT_SEED_TAG, "seeded", {
    defaultCount: DEFAULT_CLOSET_ITEMS.length,
  });
  return DEFAULT_CLOSET_ITEMS;
}

export interface NewItemInput {
  name?: string;
  category: Category;
  tag?: string;
  colorHint?: string;
  image: string;
}

/** 新增单品并写回（最新置于数组头部，便于 closet 高亮）。可能抛 QuotaError。 */
export function addItem(input: NewItemInput): ClosetItem {
  const item: ClosetItem = {
    id: genId(),
    name: input.name?.trim() || defaultName(input.category),
    category: input.category,
    tag: input.tag?.trim() || undefined,
    colorHint: input.colorHint?.trim() || undefined,
    image: input.image,
    favorite: false,
    createdAt: Date.now(),
  };
  const items = getItems();
  saveItems([item, ...items]);
  return item;
}

export function deleteItem(id: string): ClosetItem[] {
  const next = getItems().filter((it) => it.id !== id);
  saveItems(next);
  return next;
}

export function toggleFavorite(id: string): ClosetItem[] {
  const next = getItems().map((it) =>
    it.id === id ? { ...it, favorite: !it.favorite } : it
  );
  saveItems(next);
  return next;
}

/** 按筛选项过滤（All 返回全部）。 */
export function filterItems(items: ClosetItem[], filter: Filter): ClosetItem[] {
  if (filter === "All") return items;
  return items.filter((it) => it.category === filter);
}

function defaultName(category: Category): string {
  return `${category} Item`;
}

function markDefaultSeeded(reason: "existing_items" | "seed_defaults") {
  try {
    setMeta({
      defaultClosetSeeded: true,
      defaultClosetSeedVersion: DEFAULT_CLOSET_SEED_VERSION,
    });
    console.info(DEFAULT_SEED_TAG, "mark seeded", {
      reason,
      seedVersion: DEFAULT_CLOSET_SEED_VERSION,
    });
  } catch (err) {
    // 只记录错误摘要；不输出用户衣橱数据。
    console.warn(DEFAULT_SEED_TAG, "mark seeded fail", {
      reason,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}
