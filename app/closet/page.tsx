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

// CLOSET 数字衣橱（/closet）：chips 筛选 + 双排横滚卡带 + 空态 + ADD 入口。
// 布局：整页 flex-col 撑满视口；chips 在顶部，放大的双排卡带在剩余空间里「垂直居中」填补空隙，
// ADD 入口紧跟卡带下方（不再钉死屏幕底边，整体上移），避免中间出现大段空白。
export default function ClosetPage() {
  const router = useRouter();
  const { items, ready, storageOk, remove, toggle, error, clearError } =
    useCloset();
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
            存储不可用：当前为临时模式，关闭页面后数据可能丢失。
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
                  衣橱是空的
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  拍下第一件单品，开始搭建数字衣橱。
                </p>
              </div>
              <button
                onClick={() => router.push("/add")}
                className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none transition-all"
              >
                去添加单品
              </button>
            </div>
          ) : (
            // 双排横滚卡带（放大卡片）：
            // 移动端 = 两行(grid-rows-2) + 按列填充(grid-flow-col) + 大列宽 + 横向滚动；
            // md+ = 还原多列网格（取消固定列宽/横滚）作桌面 fallback。
            <div
              data-testid="closet-scroll-row"
              className="grid grid-flow-col grid-rows-2 auto-cols-[44vw] gap-4 overflow-x-auto hide-scrollbar snap-x
                         md:grid-flow-row md:grid-rows-none md:auto-cols-auto md:overflow-x-visible md:grid-cols-4
                         lg:grid-cols-6"
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
                Add New Items
              </h2>
              <p className="font-label-sm text-label-sm uppercase text-on-tertiary-fixed opacity-70 mt-0.5">
                Tap to snap your wardrobe
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
