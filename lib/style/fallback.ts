import {
  StyleRequestItem,
  StyleResponse,
  StyleLook,
  Category,
  LOOKS_PER_GEN,
} from "../closet/types";
import { getSkillById } from "./skills";

// ===== 本地规则兜底搭配 =====
// 触发条件：未配置 Key / 超时 / 限流 / 5xx / JSON 解析失败 / 校验后零套数。
// 策略：按 category 分桶，每套轮换选不同单品，尽量产出 LOOKS_PER_GEN 套各不相同的搭配。
// 输出结构与 LLM 路径一致，仅 source 标记为 "fallback"，前端弱提示。

// 每套用不同的「类别组合模板」+ 单品轮换，制造差异，
// 即使衣橱不大也能凑出 3 套各不相同的搭配。
const COMBO_TEMPLATES: Category[][] = [
  ["Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"], // 全套
  ["Tops", "Bottoms", "Shoes", "Accessories"], // 去外套（轻装）
  ["Outerwear", "Tops", "Bottoms", "Shoes"], // 去配饰（利落）
];

// 每个 skill 准备多个标题，保证 3 套标题不重复
const SKILL_TITLES: Record<number, string[]> = {
  1: ["复古香奈儿日常", "粗花呢通勤", "链条复古午后"],
  2: ["极简实用通勤", "尼龙利落出街", "冷调极简日"],
  3: ["叛逆格纹混搭", "不对称朋克", "街头张扬"],
  4: ["慵懒海岸度假", "粉彩夏日", "泳池边惬意"],
};

const OPENERS = ["", "换个思路，", "再来一套，"];

export function buildFallbackLooks(
  items: StyleRequestItem[],
  skillId: number,
  count = LOOKS_PER_GEN,
  seed = 0 // 「换一批」时传入递增值，让即时兜底也产出不同组合
): StyleResponse {
  const skill = getSkillById(skillId);
  const titles = SKILL_TITLES[skillId] ?? ["今日搭配 A", "今日搭配 B", "今日搭配 C"];
  const seen = new Set<string>();
  const looks: StyleLook[] = [];

  for (let k = 0; k < count; k++) {
    const kk = k + seed; // 叠加 seed 偏移模板与轮换
    const chosen = pickCombo(items, kk);
    if (chosen.length < 1) continue;
    // 去重：itemIds 组合相同的套数跳过，避免展示三套一模一样
    const sig = chosen
      .map((c) => c.id)
      .sort()
      .join("|");
    if (seen.has(sig)) continue;
    seen.add(sig);

    const names = chosen.map((c) => c.name).filter(Boolean);
    looks.push({
      title: titles[kk % titles.length],
      itemIds: chosen.map((c) => c.id),
      reason: buildReason(skill?.title ?? "", names, looks.length),
    });
  }

  // 极端情况（单品太少全部重复）至少返回 1 套
  if (looks.length === 0 && items.length) {
    const chosen = items.slice(0, Math.min(3, items.length));
    looks.push({
      title: titles[0],
      itemIds: chosen.map((c) => c.id),
      reason: buildReason(skill?.title ?? "", chosen.map((c) => c.name), 0),
    });
  }

  return { looks, source: "fallback" };
}

/** 第 k 套：用第 k 个类别组合模板，每个类别取桶内第 (k % 桶大小) 件实现轮换。 */
function pickCombo(items: StyleRequestItem[], k: number): StyleRequestItem[] {
  const template = COMBO_TEMPLATES[k % COMBO_TEMPLATES.length];
  const chosen: StyleRequestItem[] = [];
  for (const cat of template) {
    const bucket = items.filter((it) => it.category === cat);
    if (bucket.length) chosen.push(bucket[k % bucket.length]);
  }
  if (chosen.length < 2) {
    // 品类单一时：把数组旋转 k 位再取前 3 件，制造差异
    const rotated = [...items.slice(k % Math.max(items.length, 1)), ...items];
    return rotated.slice(0, Math.min(3, items.length));
  }
  return chosen;
}

function buildReason(skillTitle: string, names: string[], idx: number): string {
  const opener = OPENERS[idx % OPENERS.length];
  const list = names.length ? names.join("、") : "衣橱里的几件单品";
  const vibe = skillTitle ? `贴合「${skillTitle}」，` : "";
  return `${opener}${vibe}用${list}组成一套色调协调、上下平衡的搭配。这是离线兜底方案，配置 AI 后可获得更个性化的建议。`;
}
