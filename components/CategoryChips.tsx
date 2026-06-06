"use client";

import { FILTERS, Filter } from "@/lib/closet/types";

// 类别筛选条：横滚 chips（All + 五类），选中黑底白字。1:1 还原原型并补 Accessories。
interface Props {
  value: Filter;
  onChange: (f: Filter) => void;
}

export default function CategoryChips({ value, onChange }: Props) {
  return (
    <div
      data-testid="closet-filter-bar"
      className="flex overflow-x-auto gap-3 pb-4 mb-2 snap-x hide-scrollbar"
    >
      {FILTERS.map((cat) => {
        const active = value === cat;
        return (
          <button
            key={cat}
            data-testid={`closet-filter-${cat}`}
            data-active={active}
            onClick={() => onChange(cat)}
            className={`snap-start flex-shrink-0 px-4 py-2 font-label-lg text-label-lg border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:shadow-none active:translate-x-px active:translate-y-px transition-all uppercase tracking-wider ${
              active
                ? "bg-on-tertiary-fixed text-on-tertiary"
                : "bg-surface-container-lowest text-on-tertiary-fixed hover:bg-secondary-container"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
