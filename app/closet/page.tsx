"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import MaterialIcon from "@/components/MaterialIcon";
import CategoryChips from "@/components/CategoryChips";
import ItemCard from "@/components/ItemCard";
import { useCloset } from "@/lib/hooks/useCloset";
import { filterItems } from "@/lib/closet/items";
import { Filter } from "@/lib/closet/types";
import { useLang } from "@/lib/i18n";

// CLOSET 数字衣橱（/closet）：chips 筛选 + 双排横滚卡带 + 空态 + ADD 入口。
// 布局：整页 flex-col 撑满视口；chips 在顶部，放大的双排卡带在剩余空间里「垂直居中」填补空隙，
// ADD 入口紧跟卡带下方（不再钉死屏幕底边，整体上移），避免中间出现大段空白。
export default function ClosetPage() {
  const router = useRouter();
  const { items, ready, storageOk, remove, toggle, error, clearError } =
    useCloset();
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(() => filterItems(items, filter), [items, filter]);
  const isEmpty = ready && items.length === 0;

  return (
    <div
      data-testid="closet-page"
      // pb-20 预留底部导航(80px)空间；整页 flex 纵向布局
      className="pt-14 pb-20 min-h-screen bg-surface flex flex-col"
    >
      <TopAppBar rightAction="add" />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-6 pb-8 flex flex-col min-h-0">
        {/* 存储不可用提示（隐私模式 / 已满）*/}
        {!storageOk && ready && (
          <div className="mb-4 border-2 border-error bg-error-container text-on-error-container p-3 font-label-sm text-label-sm">
            {t("closet.storageUnavailable")}
          </div>
        )}
        {error && (
          <div
            className="mb-4 border-2 border-error bg-error-container text-on-error-container p-3 font-label-sm text-label-sm flex justify-between items-center"
            onClick={clearError}
          >
            <span>{error}</span>
            <MaterialIcon name="close" className="text-[16px]" />
          </div>
        )}

        <CategoryChips value={filter} onChange={setFilter} />

        {/* 卡带 / 空态区：占满剩余高度并垂直居中，填补中间空隙 */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
          {isEmpty ? (
            // 空态：原型缺，MVP 必做
            <div
              data-testid="closet-empty-state"
              className="border-2 border-dashed border-outline-variant bg-surface-container p-8 flex flex-col items-center justify-center gap-4 text-center"
            >
              <MaterialIcon name="checkroom" className="text-5xl text-outline" />
              <div>
                <h2 className="font-headline-sm text-headline-sm uppercase text-on-tertiary-fixed">
                  {t("closet.emptyTitle")}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {t("closet.emptyDesc")}
                </p>
              </div>
              <button
                onClick={() => router.push("/add")}
                className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none transition-all"
              >
                {t("closet.emptyCta")}
              </button>
            </div>
          ) : (
            // 固定手机画布内的双排横滚卡带：
            // 列宽使用固定 160px，不再用 vw 或 md/lg fallback，避免嵌入作品集时跟真实浏览器宽度变化。
            <div
              data-testid="closet-scroll-row"
              className="grid grid-flow-col grid-rows-2 auto-cols-[160px] gap-4 overflow-x-auto hide-scrollbar snap-x"
            >
              {visible.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggleFavorite={toggle}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>

        {/* 「ADD NEW ITEMS」入口：紧跟卡带下方、位于底部导航之上，随时可点 → /add */}
        <button
          data-testid="closet-add-entry"
          onClick={() => router.push("/add")}
          className="hardware-btn shrink-0 w-full bg-primary-container border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-on-tertiary-fixed flex items-center justify-center border-2 border-on-tertiary-fixed shrink-0">
              <MaterialIcon
                name="photo_camera"
                className="text-on-tertiary text-xl"
              />
            </div>
            <div className="text-left">
              <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-tertiary-fixed leading-none">
                {t("closet.addTitle")}
              </h2>
              <p className="font-label-sm text-label-sm uppercase text-on-tertiary-fixed opacity-70 mt-0.5">
                {t("closet.addSubtitle")}
              </p>
            </div>
          </div>
          <MaterialIcon
            name="arrow_forward"
            className="text-on-tertiary-fixed shrink-0"
          />
        </button>
      </main>

      <BottomNavBar />
    </div>
  );
}
