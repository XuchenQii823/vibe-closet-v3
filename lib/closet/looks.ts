import { Look, LookLayout, ClosetItem, Category } from "./types";
import { STORAGE_KEYS, readJSON, writeJSON } from "../storage/localStore";
import { genId } from "./items";
import { nextLookSerial } from "./meta";

// ===== 拼贴叠放排序 =====
// 体积大的类别排前 → 铺底、占大槽位、低 z 层级；
// 小配饰（鞋/包/墨镜）排后 → 置顶、占小槽位、高 z 层级，避免被大件遮挡。
const COLLAGE_SIZE_RANK: Record<Category, number> = {
  Outerwear: 0,
  Tops: 1,
  Bottoms: 2,
  Shoes: 3,
  Accessories: 4,
};

/** 返回按"大件在前、小件在后"排序的副本，供 Scrapbook 拼贴分配槽位/层级。 */
export function orderForCollage(items: ClosetItem[]): ClosetItem[] {
  return [...items].sort(
    (a, b) => COLLAGE_SIZE_RANK[a.category] - COLLAGE_SIZE_RANK[b.category]
  );
}

// ===== 收藏搭配纯函数 CRUD =====

export function getLooks(): Look[] {
  const list = readJSON<Look[]>(STORAGE_KEYS.looks, []);
  return Array.isArray(list) ? list : [];
}

export function saveLooks(looks: Look[]): void {
  writeJSON(STORAGE_KEYS.looks, looks);
}

export interface NewLookInput {
  title: string;
  skillId: number;
  itemIds: string[];
  reason?: string;
  layout?: LookLayout;
  source?: "ai" | "fallback";
}

/** 保存一套搭配，序号自增，最新置顶。可能抛 QuotaError。 */
export function addLook(input: NewLookInput): Look {
  const look: Look = {
    id: genId("lk"),
    serial: nextLookSerial(),
    title: input.title,
    skillId: input.skillId,
    itemIds: input.itemIds,
    reason: input.reason,
    layout: input.layout ?? "scrapbook",
    favorite: false,
    createdAt: Date.now(),
    source: input.source,
  };
  saveLooks([look, ...getLooks()]);
  return look;
}

export function deleteLook(id: string): Look[] {
  const next = getLooks().filter((l) => l.id !== id);
  saveLooks(next);
  return next;
}

export function toggleLookFavorite(id: string): Look[] {
  const next = getLooks().map((l) =>
    l.id === id ? { ...l, favorite: !l.favorite } : l
  );
  saveLooks(next);
  return next;
}

/** 格式化编号 L-042（三位补零）。 */
export function formatSerial(serial: number): string {
  return `L-${String(serial).padStart(3, "0")}`;
}
