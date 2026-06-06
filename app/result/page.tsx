"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import MaterialIcon from "@/components/MaterialIcon";
import { useCloset } from "@/lib/hooks/useCloset";
import { useLooks } from "@/lib/hooks/useLooks";
import { requestStyle, toRequestItems } from "@/lib/style/styleClient";
import { buildFallbackLooks } from "@/lib/style/fallback";
import { ClosetItem, StyleLook, LOOKS_PER_GEN } from "@/lib/closet/types";
import { DEFAULT_SKILL_ID } from "@/lib/style/skills";
import ScrapbookCollage from "@/components/ScrapbookCollage";

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const skillId = Number(params.get("skill")) || DEFAULT_SKILL_ID;

  const { items, ready } = useCloset();
  const { add: addLook } = useLooks();

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "loading"
  );
  const [looks, setLooks] = useState<StyleLook[]>([]);
  const [source, setSource] = useState<"ai" | "fallback">("ai");
  // upgrading：已先展示本地兜底，AI 结果正在后台生成中
  const [upgrading, setUpgrading] = useState(false);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const startedRef = useRef(false);
  const regenSeedRef = useRef(0);
  const reqIdRef = useRef(0); // 防止快速「换一批」时旧请求覆盖新结果

  // 把 itemId 反查为单品对象（过滤已删除）
  const resolveItems = useCallback(
    (ids: string[]): ClosetItem[] =>
      ids
        .map((id) => items.find((it) => it.id === id))
        .filter((x): x is ClosetItem => !!x),
    [items]
  );

  const generate = useCallback(
    async (regenerate: boolean) => {
      setSavedIdx(new Set());

      // ① 即时本地兜底：先用纯函数在本地算一套，0 等待立刻展示
      const reqItems = toRequestItems(items);
      const seed = regenerate ? (regenSeedRef.current += LOOKS_PER_GEN) : 0;
      const local = buildFallbackLooks(reqItems, skillId, LOOKS_PER_GEN, seed);
      if (local.looks.length === 0) {
        setStatus("error");
        return;
      }
      setLooks(local.looks.slice(0, LOOKS_PER_GEN));
      setSource("fallback");
      setStatus("done");
      setUpgrading(true); // 标记：AI 版本后台生成中

      const myReqId = ++reqIdRef.current;
      // ② 后台请求 AI；成功则无感替换，失败/超时则保留本地兜底
      try {
        const resp = await requestStyle(items, skillId, regenerate);
        if (reqIdRef.current !== myReqId) return; // 已有更新的请求，丢弃本次旧结果
        const got = resp.looks.slice(0, LOOKS_PER_GEN);
        if (got.length > 0) {
          setLooks(got);
          setSource(resp.source);
        }
      } catch (err) {
        if (reqIdRef.current !== myReqId) return;
        console.error("[result] ai upgrade fail（保留本地兜底）", {
          message: err instanceof Error ? err.message : "unknown",
        });
      } finally {
        if (reqIdRef.current === myReqId) setUpgrading(false);
      }
    },
    [items, skillId]
  );

  // 进入即自动首次生成（等 items 就绪，且单品 ≥ 2）
  useEffect(() => {
    if (!ready || startedRef.current) return;
    startedRef.current = true;
    if (items.length < 2) {
      setStatus("error");
      return;
    }
    generate(false);
  }, [ready, items.length, generate]);

  const onSave = (idx: number, look: StyleLook) => {
    const result = addLook({
      title: look.title,
      skillId,
      itemIds: look.itemIds,
      reason: look.reason,
      layout: "scrapbook",
      source,
    });
    if (result) setSavedIdx((prev) => new Set(prev).add(idx));
  };

  return (
    <div
      data-testid="style-page"
      className="pt-14 pb-24 min-h-screen bg-background"
    >
      <TopAppBar />
      <main className="w-full max-w-[600px] mx-auto px-margin-mobile py-4 flex flex-col flex-1 gap-6">
        {/* 加载态：终端风 */}
        {status === "loading" && (
          <div
            data-testid="style-loading"
            className="border-2 border-on-tertiary-fixed bg-surface-container-lowest hard-shadow overflow-hidden"
          >
            <div className="bg-brand-black text-brand-mint px-4 py-2 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest">
              <span className="w-2 h-2 bg-brand-mint animate-pulse rounded-full" />
              GENERATING_LOOKS...
            </div>
            <div className="p-10 flex flex-col items-center gap-4 scanline">
              <MaterialIcon
                name="auto_fix_high"
                className="text-5xl text-on-tertiary-fixed animate-pulse"
              />
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                正在为你搭配 {LOOKS_PER_GEN} 套穿搭……
              </p>
            </div>
          </div>
        )}

        {/* 错误态 */}
        {status === "error" && (
          <div
            data-testid="style-error"
            className="border-2 border-error bg-error-container p-6 flex flex-col items-center gap-4 text-center"
          >
            <MaterialIcon
              name="error"
              className="text-5xl text-on-error-container"
            />
            <p className="font-body-md text-body-md text-on-error-container">
              {items.length < 2
                ? "衣橱单品不足 2 件，先去添加更多单品。"
                : "搭配生成失败，请重试。"}
            </p>
            {items.length < 2 ? (
              <button
                onClick={() => router.push("/closet")}
                className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1c1b1b] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none"
              >
                去衣橱
              </button>
            ) : (
              <button
                onClick={() => generate(false)}
                className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_#1c1b1b] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none"
              >
                RETRY
              </button>
            )}
          </div>
        )}

        {/* 成功态：渲染多套搭配 */}
        {status === "done" && looks.length > 0 && (
          <div data-testid="style-result" className="flex flex-col gap-8">
            {/* 状态提示（整页一次）：优先显示「AI 优化中」，否则按来源提示 */}
            {upgrading ? (
              <div
                data-testid="style-upgrading"
                className="border-2 border-on-tertiary-fixed bg-primary-container px-3 py-2 font-label-sm text-label-sm text-on-tertiary-fixed flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-on-tertiary-fixed animate-pulse rounded-full" />
                已先给你一版搭配，AI 正在后台优化这 {LOOKS_PER_GEN} 套……
              </div>
            ) : (
              source === "fallback" && (
                <div className="border-2 border-on-tertiary-fixed bg-surface-container-high px-3 py-2 font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                  <MaterialIcon name="info" className="text-[16px]" />
                  离线兜底搭配（AI 暂不可用）
                </div>
              )
            )}

            {looks.map((look, i) => (
              <ResultLookCard
                key={i}
                look={look}
                items={resolveItems(look.itemIds)}
                index={i}
                total={looks.length}
                saved={savedIdx.has(i)}
                onSave={() => onSave(i, look)}
              />
            ))}

            {/* 全局操作：重新生成全部 + 去收藏册 */}
            <div className="flex gap-4">
              <button
                data-testid="style-regenerate-btn"
                onClick={() => generate(true)}
                className="flex-1 bg-surface text-on-tertiary-fixed border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] py-3 px-2 font-label-lg text-[13px] uppercase flex items-center justify-center gap-2 transition-all hover:bg-surface-container-high"
              >
                <MaterialIcon name="refresh" className="text-[18px]" /> 换一批
              </button>
              <button
                onClick={() => router.push("/looks")}
                className="flex-1 bg-secondary-container text-on-tertiary-fixed border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] py-3 px-2 font-label-lg text-[13px] uppercase flex items-center justify-center gap-2 transition-all"
              >
                <MaterialIcon name="style" className="text-[18px]" /> 去收藏册
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNavBar />
    </div>
  );
}

// 单套搭配卡：标题(含 1/3 序号) + Scrapbook 拼贴 + 理由 + 独立收藏按钮
function ResultLookCard({
  look,
  items,
  index,
  total,
  saved,
  onSave,
}: {
  look: StyleLook;
  items: ClosetItem[];
  index: number;
  total: number;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* 标题卡（粉底）+ 序号 */}
      <div className="bg-secondary-container border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] p-4 flex items-center justify-between gap-3">
        <h2 className="font-headline-md text-headline-md text-on-tertiary-fixed uppercase">
          {look.title}
        </h2>
        <span className="shrink-0 border-2 border-on-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm text-on-tertiary-fixed">
          {index + 1}/{total}
        </span>
      </div>

      {/* 拼贴区 */}
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant p-8 text-center font-body-md text-on-surface-variant">
          被选单品已从衣橱删除。
        </div>
      ) : (
        <ScrapbookCollage items={items} />
      )}

      {/* 搭配理由 */}
      <div className="bg-surface-container-lowest border-2 border-on-tertiary-fixed p-4">
        <div className="font-label-sm text-label-sm uppercase text-on-tertiary-fixed border-b-2 border-on-tertiary-fixed pb-1 mb-2">
          {"// STYLING NOTE"}
        </div>
        <p
          data-testid="style-reason-text"
          className="font-body-md text-body-md text-on-surface-variant"
        >
          {look.reason}
        </p>
      </div>

      {/* 收藏这套 */}
      <button
        data-testid="style-save-btn"
        onClick={onSave}
        disabled={saved}
        className="bg-primary-container text-on-primary-fixed border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_#1c1b1b] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] py-3 px-2 font-label-lg text-[13px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-70"
      >
        <MaterialIcon name={saved ? "check" : "favorite"} filled />
        {saved ? "已收藏" : "收藏这套"}
      </button>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="pt-14 min-h-screen bg-background" />}>
      <ResultInner />
    </Suspense>
  );
}
