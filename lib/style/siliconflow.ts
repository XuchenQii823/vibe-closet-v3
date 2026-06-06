import "server-only";
import {
  StyleRequest,
  StyleRequestItem,
  StyleResponse,
  StyleLook,
  LOOKS_PER_GEN,
} from "../closet/types";
import { getSkillById } from "./skills";

// ===== 服务端：SiliconFlow Qwen 调用 + 解析 + 校验 =====
// 仅在服务端运行（server-only），API Key 只从 process.env 读取，绝不下发前端。

const BASE_URL =
  process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1";
const MODEL = process.env.SILICONFLOW_MODEL ?? "Qwen/Qwen3-VL-30B-A3B-Instruct";
const TIMEOUT_MS = 30_000; // 一次生成 3 套，给模型更充裕时间
const TAG = "[api/style/siliconflow]";

export class StyleServiceError extends Error {}

/** 是否已配置可用 Key（占位值视为未配置，避免发起注定失败的请求）。 */
export function hasApiKey(): boolean {
  const key = process.env.SILICONFLOW_API_KEY?.trim();
  if (!key) return false;
  // .env.local 默认写的是中文占位串，含非 ASCII 字符无法作为 HTTP 头；按未配置处理走兜底。
  if (key.includes("粘贴") || key.startsWith("这里")) return false;
  return true;
}

/**
 * 调用 Qwen 生成搭配。成功返回校验后的 StyleResponse(source: "ai")；
 * 任何失败抛 StyleServiceError，由 Route Handler 捕获后走兜底。
 */
export async function generateWithQwen(
  req: StyleRequest
): Promise<StyleResponse> {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new StyleServiceError("missing_api_key");

  const { system, user } = buildPrompt(req);
  const temperature = req.regenerate ? 0.9 : 0.7;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key 仅在此处拼接，绝不写入日志
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 2000, // 3 套搭配 + 理由，预留充足额度
        // 注意：Qwen3-VL-*-Instruct 为非推理模型，不接受 enable_thinking 参数（传了会 400），故不传。
        response_format: { type: "json_object" },
        stream: false,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new StyleServiceError(`http_${resp.status}`);
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new StyleServiceError("empty_content");

    const parsed = parseAndValidate(content, req.items);
    if (parsed.looks.length === 0) throw new StyleServiceError("zero_valid_looks");
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

// ----- prompt 构造（只发脱敏元数据，不发图片本体）-----
function buildPrompt(req: StyleRequest): { system: string; user: string } {
  const skill = getSkillById(req.skillId);
  const skillHint = skill?.promptHint ?? "";

  const system = [
    "你是一位专业时尚搭配师。你只能从用户提供的衣橱单品里挑选，",
    "禁止编造不存在的单品 id。请严格输出 JSON，不要任何多余文字或解释。",
    '输出格式：{"looks":[{"title":"中文标题","itemIds":["真实id",...],"reason":"中文搭配理由"}]}',
    "title 简短有画面感；itemIds 必须来自输入单品；reason 用中文说明为什么这样搭（30~80字）。",
    "每套至少包含 2 件，尽量覆盖上装/下装/鞋等不同品类，颜色协调。",
    `请一次给出 ${LOOKS_PER_GEN} 套各不相同的搭配（looks 数组含 ${LOOKS_PER_GEN} 个元素），彼此在单品组合或风格侧重上要有明显区别。`,
  ].join("\n");

  const itemLines = req.items
    .map(
      (it) =>
        `- id:${it.id} | 类别:${it.category} | 名称:${it.name}` +
        `${it.color ? ` | 颜色:${it.color}` : ""}${it.tag ? ` | 标签:${it.tag}` : ""}`
    )
    .join("\n");

  const diff = req.regenerate
    ? "\n注意：请给出与常规不同的新组合，避免重复。"
    : "";

  const user = `风格方向：${skillHint}\n衣橱单品：\n${itemLines}\n请生成 ${LOOKS_PER_GEN} 套各不相同的搭配。${diff}`;
  return { system, user };
}

// ----- 解析 + 校验：去围栏 → JSON.parse → 过滤幻觉 id -----
function parseAndValidate(
  content: string,
  items: StyleRequestItem[]
): StyleResponse {
  const validIds = new Set(items.map((it) => it.id));
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFence(content));
  } catch {
    throw new StyleServiceError("json_parse_fail");
  }

  const rawLooks = (json as { looks?: unknown })?.looks;
  if (!Array.isArray(rawLooks)) throw new StyleServiceError("no_looks_array");

  const looks: StyleLook[] = [];
  for (const raw of rawLooks) {
    const r = raw as Partial<StyleLook>;
    const ids = Array.isArray(r.itemIds)
      ? r.itemIds.filter((id) => typeof id === "string" && validIds.has(id))
      : [];
    if (ids.length < 1) continue; // 过滤后无有效单品则丢弃该套
    looks.push({
      title: typeof r.title === "string" && r.title.trim() ? r.title.trim() : "今日搭配",
      itemIds: ids,
      reason:
        typeof r.reason === "string" && r.reason.trim()
          ? r.reason.trim()
          : "根据所选风格与衣橱单品生成的搭配。",
    });
  }

  return { looks, source: "ai" };
}

/** 去掉 ```json ... ``` 围栏，容忍模型偶尔包裹代码块。 */
function stripCodeFence(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export const STYLE_MODEL = MODEL;
export const STYLE_TIMEOUT_MS = TIMEOUT_MS;
