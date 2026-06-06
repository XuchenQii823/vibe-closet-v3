"use client";

import { useState } from "react";
import { ClosetItem } from "@/lib/closet/types";
import MaterialIcon from "./MaterialIcon";

// 单品卡：黑标题栏(类别+favorite) / 图区(object-contain) / 名称 + 材质 chip。
// 1:1 还原原型卡片，并补：favorite 切换、图加载失败占位、删除（hover 出现）。
interface Props {
  item: ClosetItem;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ItemCard({ item, onToggleFavorite, onDelete }: Props) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      data-testid="closet-item-card"
      className="snap-start bg-surface-container-lowest border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all cursor-pointer group relative"
    >
      {/* 标题栏：类别 + favorite */}
      <div className="h-6 bg-on-tertiary-fixed border-b-2 border-on-tertiary-fixed flex items-center justify-between px-2">
        <span className="font-label-sm text-[10px] text-on-tertiary tracking-widest uppercase truncate">
          {item.category}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(item.id);
          }}
          aria-label="收藏"
          className="flex items-center"
        >
          <MaterialIcon
            name="favorite"
            filled={item.favorite}
            className={`text-xs ${
              item.favorite ? "text-brand-blush" : "text-on-tertiary"
            }`}
          />
        </button>
      </div>

      {/* 图区 */}
      <div className="aspect-square p-2 flex items-center justify-center relative overflow-hidden bg-surface-container-lowest">
        {broken ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-surface-variant text-outline">
            <MaterialIcon name="broken_image" className="text-3xl" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={item.name}
            onError={() => setBroken(true)}
            className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
            src={item.image}
          />
        )}
      </div>

      {/* 名称 + 标签 */}
      <div className="p-2 border-t-2 border-on-tertiary-fixed bg-surface-container-lowest flex-grow flex flex-col justify-between">
        <h3 className="font-label-lg text-[12px] leading-tight text-on-tertiary-fixed uppercase mb-1">
          {item.name}
        </h3>
        {item.tag && (
          <span className="w-fit px-1.5 py-0.5 bg-secondary-container border border-on-tertiary-fixed font-label-sm text-[10px] text-on-tertiary-fixed uppercase">
            {item.tag}
          </span>
        )}
      </div>

      {/* 删除按钮（hover 出现，MVP 纠错用）*/}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          aria-label="删除单品"
          data-testid="closet-item-delete"
          className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error border-2 border-on-tertiary-fixed items-center justify-center hidden group-hover:flex z-10"
        >
          <MaterialIcon name="close" className="text-[14px]" />
        </button>
      )}
    </div>
  );
}
