import "server-only";
import { CATEGORIES, Category } from "../closet/types";

// ===== 服务端：SiliconFlow 多模态识图（OpenAI 兼容 chat/completions）=====
// 把压缩后的单品图（base64 dataURL）发给视觉模型，返回 { category, colorHint, name }。
// 仅服务端运行；API Key 只从 process.env 读取，绝不下发前端；日志只记图片大小不记图片本体。

const BASE_URL =
  process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1";
// 识图（多模态）模型：用户指定 Qwen/Qwen3.6-35B-A3B，可经环境变量覆盖
const VISION_MODEL =
  process.env.SILICONFLOW_VISION_MODEL ?? "Qwen/Qwen3-VL-30B-A3B-Instruct";
const TIMEOUT_MS = 20_000;

export class RecognizeError extends Error {}

export interface RecognizeResult {
  category: Category;
  colorHint?: string;
  name?: string;
}

/** 占位 Key 视为未配置（与文字搭配一致）。 */
export function hasVisionKey(): boolean {
  const key = process.env.SILICONFLOW_API_KEY?.trim();
  if (!key) return false;
  if (key.includes("粘贴") || key.startsWith("这里")) return false;
  return true;
}

export const VISION_MODEL_NAME = VISION_MODEL;

/**
 * 识别单品图片。成功返回校验后的结果；失败抛 RecognizeError（由 Route Handler 转友好提示）。
 * 识图无法本地兜底（不连模型就「猜」不出图里是什么），失败时前端退回手动填写。
 */
export async function recognizeItem(
  imageDataUrl: string
): Promise<RecognizeResult> {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new RecognizeError("missing_api_key");
  if (!imageDataUrl.startsWith("data:image/")) {
    throw new RecognizeError("invalid_image");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0.2, // 识别任务求稳，低温度
        max_tokens: 512,
        // 注意：Qwen3-VL-*-Instruct 为非推理模型，不接受 enable_thinking 参数（传了会 400），故不传。
        response_format: { type: "json_object" },
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "你是服装识别助手。只输出 JSON，不要任何多余文字。",
          },
          {
            role: "user",
            // OpenAI 兼容多模态：content 为数组，含 image_url（base64）+ 文本指令
            content: [
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
              {
                type: "text",
                text: buildPrompt(),
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!resp.ok) throw new RecognizeError(`http_${resp.status}`);

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new RecognizeError("empty_content");

    return parseAndValidate(content);
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(): string {
  return [
    "识别图中的这件服装/配饰，按下面 JSON 结构输出（只输出 JSON）：",
    '{"category":"<类别>","colorHint":"<主色，简短中文>","name":"<简短中文名称，6字内>"}',
    `category 只能是以下英文之一：${CATEGORIES.join(" / ")}。`,
    "Tops=上衣/T恤/衬衫/针织，Bottoms=裤子/裙子，Outerwear=外套/大衣/夹克，Shoes=鞋类，Accessories=包/帽子/首饰/腰带等配饰。",
    "若无法判断颜色或名称可留空字符串，但 category 必须给出最接近的一项。",
  ].join("\n");
}

// 去 ```json 围栏 → JSON.parse → 校验 category 命中枚举
function parseAndValidate(content: string): RecognizeResult {
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFence(content));
  } catch {
    throw new RecognizeError("json_parse_fail");
  }
  const r = json as Partial<RecognizeResult>;
  const category = normalizeCategory(r.category);
  if (!category) throw new RecognizeError("invalid_category");

  return {
    category,
    colorHint:
      typeof r.colorHint === "string" && r.colorHint.trim()
        ? r.colorHint.trim().slice(0, 12)
        : undefined,
    name:
      typeof r.name === "string" && r.name.trim()
        ? r.name.trim().slice(0, 20)
        : undefined,
  };
}

/** 把模型返回的 category 容错映射到枚举（大小写 / 前后空格）。 */
function normalizeCategory(raw: unknown): Category | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  const hit = CATEGORIES.find((c) => c.toLowerCase() === v);
  return hit ?? null;
}

function stripCodeFence(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
