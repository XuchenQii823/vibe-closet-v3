"use client";

import { Category } from "../closet/types";

// ===== 前端：调用同源 /api/recognize，绝不直连第三方、不接触 Key =====

const TAG = "[client/recognize]";

export interface RecognizeClientResult {
  category: Category;
  colorHint?: string;
  name?: string;
}

export interface RecognizeClientResponse {
  ok: boolean;
  result?: RecognizeClientResult;
  /** 失败/跳过时的友好提示（如未配置 Key） */
  message?: string;
}

/**
 * 上传压缩后的 base64 图，请求自动识别。
 * 永不抛错——失败时返回 { ok:false, message }，由 UI 决定提示，不阻断手动录入。
 */
export async function recognizeImage(
  imageDataUrl: string
): Promise<RecognizeClientResponse> {
  console.log(TAG, "request", { imageBytes: imageDataUrl.length });
  try {
    const resp = await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    const data = await resp.json().catch(() => ({}));

    if (data?.result) {
      console.log(TAG, "success", { category: data.result.category });
      return { ok: true, result: data.result as RecognizeClientResult };
    }
    // 服务端用 200 + error 表示「未配置 Key / 识别失败」这类可降级情况
    console.log(TAG, "skip", { code: data?.code });
    return { ok: false, message: data?.error || "识别未成功" };
  } catch (err) {
    console.error(TAG, "fail", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, message: "识别请求失败，请手动选择类别" };
  }
}
