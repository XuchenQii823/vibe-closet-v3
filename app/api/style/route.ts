import { NextRequest } from "next/server";
import { StyleRequest, LOOKS_PER_GEN } from "@/lib/closet/types";
import {
  generateWithQwen,
  hasApiKey,
  STYLE_MODEL,
} from "@/lib/style/siliconflow";
import { buildFallbackLooks } from "@/lib/style/fallback";

// AI 调用需 Node runtime（读 process.env、用 AbortController 超时）
export const runtime = "nodejs";

const TAG = "[api/style]";

/**
 * AI 搭配引擎服务端代理。
 * 前端只发衣橱元数据（不含图片本体），Key 仅服务端读取。
 * 任一失败分支都降级到本地兜底，保证前端永不白屏。
 */
export async function POST(req: NextRequest) {
  const t0 = Date.now();
  let body: StyleRequest;
  try {
    body = (await req.json()) as StyleRequest;
  } catch {
    console.error(TAG, "fail", { reason: "bad_request_json" });
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const itemCount = Array.isArray(body.items) ? body.items.length : 0;
  // 入口日志：只记数量/skillId/是否重生成，不打印单品名称等隐私
  console.log(TAG, "enter", {
    itemCount,
    skillId: body.skillId,
    requestedLooks: LOOKS_PER_GEN,
    regenerate: !!body.regenerate,
    model: STYLE_MODEL,
    keyConfigured: hasApiKey(),
  });

  if (itemCount < 2) {
    console.error(TAG, "fail", { reason: "not_enough_items", itemCount });
    return Response.json(
      { error: "衣橱单品不足 2 件，无法搭配" },
      { status: 422 }
    );
  }

  // 未配置 Key：直接兜底，不发起网络请求
  if (!hasApiKey()) {
    const fallback = buildFallbackLooks(body.items, body.skillId);
    console.log(TAG, "fallback", {
      reason: "missing_api_key",
      looks: fallback.looks.length,
      ms: Date.now() - t0,
    });
    return Response.json(fallback);
  }

  try {
    const result = await generateWithQwen(body);
    console.log(TAG, "success", {
      source: result.source,
      looks: result.looks.length,
      ms: Date.now() - t0,
    });
    return Response.json(result);
  } catch (err) {
    // 失败降级：记录脱敏原因后走本地兜底（不返回 500，保证前端有结果）
    const reason = err instanceof Error ? err.message : "unknown";
    console.error(TAG, "fail->fallback", { reason, ms: Date.now() - t0 });
    const fallback = buildFallbackLooks(body.items, body.skillId);
    console.log(TAG, "fallback", {
      looks: fallback.looks.length,
      ms: Date.now() - t0,
    });
    return Response.json(fallback);
  }
}
