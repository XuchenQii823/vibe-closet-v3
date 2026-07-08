"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import BottomNavBar from "@/components/BottomNavBar";
import MaterialIcon from "@/components/MaterialIcon";
import SkillCard from "@/components/SkillCard";
import { useCloset } from "@/lib/hooks/useCloset";
import { STYLE_SKILLS, DEFAULT_SKILL_ID } from "@/lib/style/skills";
import { useLang } from "@/lib/i18n";

// STYLE 风格选择（/style）：4 预设 skill 单选 + Generate CTA + 单品数量校验(≥2)。
// 默认高亮 Poolside Retro，保证 AI 有明确风格方向。1:1 还原原型。
export default function StylePage() {
  const router = useRouter();
  const { items, ready } = useCloset();
  const { t } = useLang();
  const [selected, setSelected] = useState<number>(DEFAULT_SKILL_ID);

  const enoughItems = items.length >= 2;

  const generate = () => {
    if (!enoughItems) return;
    // skillId 经 query 传给 /result 触发生成，不持久化
    router.push(`/result?skill=${selected}`);
  };

  return (
    <div
      data-testid="style-page"
      className="pt-24 pb-32 min-h-screen bg-surface-container-high"
      style={{
        backgroundImage: "radial-gradient(#d2cfcf 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      <TopAppBar rightAction="add" />
      <main className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop w-full">
        <div className="mb-8 border-2 border-on-tertiary-fixed bg-surface-container-lowest p-4 hard-shadow-sm">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-tertiary-fixed uppercase">
            {t("style.heading")}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 border-t-2 border-on-tertiary-fixed pt-2">
            {t("style.subtitle")}
          </p>
        </div>

        {/* 单品不足 2 件：空态引导（CTA 禁用）*/}
        {ready && !enoughItems && (
          <div
            data-testid="style-empty-closet"
            className="mb-8 border-2 border-dashed border-outline-variant bg-surface-container-lowest p-6 flex flex-col items-center gap-3 text-center"
          >
            <MaterialIcon name="checkroom" className="text-4xl text-outline" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("style.needItems")}
            </p>
            <button
              onClick={() => router.push("/closet")}
              className="bg-brand-mint border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] px-6 py-2 font-label-lg text-label-lg uppercase active:translate-x-px active:translate-y-px active:shadow-none transition-all"
            >
              {t("style.goAdd")}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STYLE_SKILLS.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              selected={selected === skill.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </main>

      {/* 浮动 Generate CTA：单品不足时禁用 */}
      <div className="fixed bottom-24 right-margin-mobile md:right-margin-desktop z-40">
        <button
          data-testid="style-generate-btn"
          onClick={generate}
          disabled={!enoughItems}
          className={`bg-secondary-container border-2 border-on-tertiary-fixed px-6 py-3 flex items-center gap-2 hard-shadow-sm hardware-btn ${
            enoughItems ? "" : "opacity-40 cursor-not-allowed"
          }`}
        >
          <span className="font-label-lg text-label-lg text-on-tertiary-fixed uppercase">
            {t("style.generate")}
          </span>
          <MaterialIcon
            name="auto_fix_high"
            className="text-on-tertiary-fixed"
          />
        </button>
      </div>

      <BottomNavBar />
    </div>
  );
}
