"use client";

import { StyleRequest, StyleResponse, ClosetItem } from "../closet/types";

// ===== 前端：调用同源 /api/style，绝不直连第三方、不接触 Key =====

const TAG = "[client/style]";

/** 把衣橱单品转成脱敏请求体（不发图片本体）。 */
export function toRequestItems(items: ClosetItem[]): StyleRequest["items"] {
  return items.map((it) => ({
    id: it.id,
    category: it.category,
    name: it.name,
    color: it.colorHint,
    tag: it.tag,
  }));
}

export async function requestStyle(
  items: ClosetItem[],
  skillId: number,
  regenerate = false
): Promise<StyleResponse> {
  const reqItems = toRequestItems(items);
  console.log(TAG, "request", {
    itemCount: reqItems.length,
    skillId,
    regenerate,
  });

  const resp = await fetch("/api/style", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: reqItems, skillId, regenerate }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    console.error(TAG, "fail", { status: resp.status });
    throw new Error(data?.error || "搭配生成失败");
  }

  const data = (await resp.json()) as StyleResponse;
  console.log(TAG, "response", {
    source: data.source,
    looks: data.looks?.length ?? 0,
  });
  return data;
}
