"use client";

import { useRouter } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import MaterialIcon from "@/components/MaterialIcon";
import LookCard from "@/components/LookCard";
import { useLooks } from "@/lib/hooks/useLooks";
import { useCloset } from "@/lib/hooks/useCloset";

// LOOKS 收藏册（/looks）：look 卡网格（倒序）+ 空态 + 删除/收藏 + New Look。
// 拼贴用 itemIds 反查 items 取图；被删单品降级占位。1:1 还原原型气质。
export default function LooksPage() {
  const router = useRouter();
  const { looks, ready, remove, toggle } = useLooks();
  const { items } = useCloset();

  const isEmpty = ready && looks.length === 0;

  return (
    <div
      data-testid="looks-page"
      className="pt-14 pb-20 min-h-screen bg-surface"
    >
      <TopAppBar />
      <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {/* 页头 */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-tertiary-fixed uppercase">
              Lookbook
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
              Your curated collection of fits.
            </p>
          </div>
          <button
            onClick={() => router.push("/style")}
            className="bg-primary-container text-on-tertiary-fixed border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1c1b1b] px-6 py-2 font-label-lg text-label-lg uppercase flex items-center gap-2 self-start md:self-auto active:translate-x-px active:translate-y-px active:shadow-none transition-all"
          >
            <MaterialIcon name="add" className="text-[18px]" /> New Look
          </button>
        </div>

        {isEmpty ? (
          // 空态：原型缺，MVP 必做
          <div
            data-testid="looks-empty-state"
            className="border-2 border-dashed border-outline-variant bg-surface-container-lowest p-10 flex flex-col items-center gap-4 text-center"
          >
            <MaterialIcon name="style" className="text-5xl text-outline" />
            <div>
              <h2 className="font-headline-sm text-headline-sm uppercase text-on-tertiary-fixed">
                还没有收藏
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                去 STYLE 生成第一套搭配并保存到这里。
              </p>
            </div>
            <button
              onClick={() => router.push("/style")}
              className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1c1b1b] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none transition-all"
            >
              New Look
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {looks.map((look) => {
              // 反查该 look 的单品（保持 itemIds 顺序，过滤已删除）
              const lookItems = look.itemIds
                .map((id) => items.find((it) => it.id === id))
                .filter((x): x is NonNullable<typeof x> => !!x);
              return (
                <LookCard
                  key={look.id}
                  look={look}
                  items={lookItems}
                  onToggleFavorite={toggle}
                  onDelete={remove}
                />
              );
            })}
          </div>
        )}
      </main>
      <BottomNavBar />
    </div>
  );
}
