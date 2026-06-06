import { NextRequest } from "next/server";
import {
  recognizeItem,
  hasVisionKey,
  VISION_MODEL_NAME,
  RecognizeError,
} from "@/lib/vision/recognize";

// 多模态识图需 Node runtime（读 process.env、AbortController 超时）
export const runtime = "nodejs";

const TAG = "[api/recognize]";

/**
 * 单品识图服务端代理。前端发压缩后的 base64 图，服务端调 SiliconFlow 视觉模型。
 * Key 仅服务端读取。识图无法本地兜底，失败时返回提示让前端退回手动填写。
 */
export async function POST(req: NextRequest) {
  const t0 = Date.now();
  let image: string;
  try {
    const body = (await req.json()) as { image?: string };
    image = body.image ?? "";
  } catch {
    console.error(TAG, "fail", { reason: "bad_request_json" });
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  // 入口日志：只记图片字节大小，绝不记录图片本体
  const imageBytes = image.length;
  console.log(TAG, "enter", {
    imageBytes,
    model: VISION_MODEL_NAME,
    keyConfigured: hasVisionKey(),
  });

  if (!image) {
    return Response.json({ error: "缺少图片" }, { status: 400 });
  }

  // 未配置 Key：识图不可用（无法本地兜底），明确告知前端走手动
  if (!hasVisionKey()) {
    console.log(TAG, "skip", { reason: "missing_api_key" });
    return Response.json(
      { error: "未配置 AI Key，无法自动识别，请手动选择类别", code: "no_key" },
      { status: 200 }
    );
  }

  try {
    const result = await recognizeItem(image);
    console.log(TAG, "success", {
      category: result.category,
      hasColor: !!result.colorHint,
      hasName: !!result.name,
      ms: Date.now() - t0,
    });
    return Response.json({ result });
  } catch (err) {
    const reason =
      err instanceof RecognizeError ? err.message : "unknown";
    console.error(TAG, "fail", { reason, ms: Date.now() - t0 });
    // 识别失败不阻断录入：返回 200 + 提示，前端继续手动填写
    return Response.json(
      { error: "识别失败，请手动选择类别", code: "recognize_fail" },
      { status: 200 }
    );
  }
}
