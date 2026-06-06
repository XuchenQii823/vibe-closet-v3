"use client";

import { ClosetItem, Category } from "@/lib/closet/types";
import { orderForCollage } from "@/lib/closet/looks";

// Scrapbook 心情板（Result 与 Lookbook 共用，保证两处样式一致）：
// 绝对定位错落叠放，最多 5 片，尺寸递减 + z 递增；先 orderForCollage 按体积排序
// （大件铺底走大槽位+低 z，小配饰置顶走小槽位+高 z，避免遮挡），图片 contain 居中。

const SLOT_LABEL: Record<Category, string> = {
  Tops: "TOP",
  Bottoms: "BOTTOM",
  Outerwear: "OUTERWEAR",
  Shoes: "SHOES",
  Accessories: "ACCESSORY",
};

const SCRAP_SLOTS = [
  "left-[4%] top-[7%] w-[50%] h-[54%] -rotate-3 z-10",
  "right-[5%] bottom-[7%] w-[46%] h-[50%] rotate-[5deg] z-20",
  "right-[6%] top-[10%] w-[42%] h-[46%] rotate-2 z-30",
  "left-[8%] bottom-[6%] w-[40%] h-[44%] -rotate-[5deg] z-40",
  "left-[31%] top-[31%] w-[38%] h-[42%] rotate-[3deg] z-50",
];

interface Props {
  items: ClosetItem[];
  /** 容器高度（百分比槽位相对它换算），默认 h-[360px]，两处统一。 */
  heightClass?: string;
}

export default function ScrapbookCollage({
  items,
  heightClass = "h-[360px]",
}: Props) {
  const pieces = orderForCollage(items).slice(0, SCRAP_SLOTS.length);
  return (
    <div
      className={`relative ${heightClass} bg-[radial-gradient(#c0c8c5_1px,transparent_1px)] [background-size:16px_16px] border-2 border-on-tertiary-fixed overflow-hidden`}
    >
      {pieces.map((item, i) => (
        <div
          key={item.id}
          className={`group/piece absolute border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] bg-[#F5E7DC] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:z-[60] ${SCRAP_SLOTS[i]}`}
        >
          <div className="bg-on-tertiary-fixed text-on-tertiary font-label-sm text-[10px] px-1.5 py-0.5 uppercase tracking-widest shrink-0">
            {SLOT_LABEL[item.category]}
          </div>
          <div
            className="flex-1 bg-contain bg-no-repeat bg-center grayscale group-hover/piece:grayscale-0 mix-blend-multiply transition-all duration-300"
            style={{ backgroundImage: `url('${item.image}')` }}
          />
        </div>
      ))}
    </div>
  );
}
