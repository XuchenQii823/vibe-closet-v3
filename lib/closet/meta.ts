import { ClosetMeta } from "./types";
import { STORAGE_KEYS, readJSON, writeJSON } from "../storage/localStore";

export const SCHEMA_VERSION = 1;

const DEFAULT_META: ClosetMeta = {
  onboardingSeen: false,
  lookSerialCounter: 0,
  schemaVersion: SCHEMA_VERSION,
  lang: "en", // 默认英文；用户可在顶栏 🌐 切换为中文
};

/** 读取元数据，缺失字段用默认值补齐（兼容旧 schema）。 */
export function getMeta(): ClosetMeta {
  const raw = readJSON<Partial<ClosetMeta>>(STORAGE_KEYS.meta, {});
  return { ...DEFAULT_META, ...raw };
}

export function setMeta(patch: Partial<ClosetMeta>): ClosetMeta {
  const next = { ...getMeta(), ...patch };
  writeJSON(STORAGE_KEYS.meta, next);
  return next;
}

/** 取下一个 look 序号并自增写回（用于 L-042 编号）。 */
export function nextLookSerial(): number {
  const meta = getMeta();
  const serial = meta.lookSerialCounter + 1;
  setMeta({ lookSerialCounter: serial });
  return serial;
}
