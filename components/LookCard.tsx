"use client";

import { useState } from "react";
import { Look, ClosetItem } from "@/lib/closet/types";
import { formatSerial } from "@/lib/closet/looks";
import MaterialIcon from "./MaterialIcon";
import ScrapbookCollage from "./ScrapbookCollage";
import ConfirmDialog from "./ConfirmDialog";

// Look 卡：黑标题栏(L-0XX // 名称 + favorite) + Scrapbook 拼贴预览 + 元信息。
// 拼贴复用 ScrapbookCollage，与 /result 生成时完全一致（最多 5 片、带类别标签、按体积排序叠放）。
// 被删单品降级为占位不崩。
interface Props {
  look: Look;
  items: ClosetItem[]; // 已反查出的该 look 单品（顺序与 itemIds 一致）
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function LookCard({
  look,
  items,
  onToggleFavorite,
  onDelete,
}: Props) {
  const missingCount = look.itemIds.length - items.length;
  // 删除二次确认：点删除图标先开弹窗，确认后才真正删除（防误删，不可恢复）。
  const [confirming, setConfirming] = useState(false);

  return (
    <article
      data-testid="looks-card"
      className="bg-surface-container-lowest border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] flex flex-col group transition-transform hover:-translate-y-1"
    >
      {/* 标题栏 */}
      <div className="bg-on-tertiary-fixed text-on-tertiary px-3 py-2 flex justify-between items-center border-b-2 border-on-tertiary-fixed">
        <span className="font-label-lg text-label-lg uppercase truncate">
          {formatSerial(look.serial)} {"// "}
          {look.title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onToggleFavorite?.(look.id)} aria-label="收藏">
            <MaterialIcon
              name="favorite"
              filled={look.favorite}
              className={`text-[16px] ${
                look.favorite ? "text-primary-container" : ""
              }`}
            />
          </button>
          {onDelete && (
            <button
              onClick={() => setConfirming(true)}
              aria-label="删除搭配"
              data-testid="looks-card-delete"
            >
              <MaterialIcon name="delete" className="text-[16px]" />
            </button>
          )}
        </div>
      </div>

      {/* 删除二次确认弹窗 */}
      {onDelete && (
        <ConfirmDialog
          open={confirming}
          testId="looks-delete-confirm"
          title="确认删除搭配"
          message={`确定删除「${formatSerial(look.serial)} ${look.title}」这套搭配吗？删除后无法恢复（衣橱单品不受影响）。`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete(look.id);
          }}
        />
      )}

      {/* Scrapbook 拼贴区：与 /result 共用同一组件，样式完全一致 */}
      {items.length === 0 ? (
        <div className="h-[360px] border-2 border-on-tertiary-fixed bg-surface-container flex flex-col items-center justify-center gap-2 text-center p-4">
          <MaterialIcon name="hide_image" className="text-3xl text-outline" />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            单品已全部删除
          </span>
        </div>
      ) : (
        <ScrapbookCollage items={items} />
      )}

      {/* 底部元信息 */}
      <div className="border-t-2 border-on-tertiary-fixed p-3 flex justify-between items-center bg-surface gap-2">
        <span className="inline-block px-2 py-0.5 border border-on-tertiary-fixed font-label-sm text-label-sm uppercase bg-primary-container text-on-tertiary-fixed shrink-0">
          {look.source === "fallback" ? "Local" : "AI"}
        </span>
        {missingCount > 0 ? (
          <span className="font-label-sm text-label-sm text-error">
            {missingCount} 件单品已删除
          </span>
        ) : (
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {relativeTime(look.createdAt)}
          </span>
        )}
      </div>
    </article>
  );
}

/** 简单相对时间：保存于 X 天前（替代原型的 Last worn）。 */
function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const day = 86_400_000;
  if (diff < day) return "保存于今天";
  const days = Math.floor(diff / day);
  if (days < 7) return `保存于 ${days} 天前`;
  return `保存于 ${Math.floor(days / 7)} 周前`;
}
