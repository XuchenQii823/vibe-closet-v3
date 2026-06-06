import { ClosetItem, Category, Filter } from "./types";
import { STORAGE_KEYS, readJSON, writeJSON } from "../storage/localStore";

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
