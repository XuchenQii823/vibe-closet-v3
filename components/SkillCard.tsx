"use client";

import { StyleSkill } from "@/lib/closet/types";
import MaterialIcon from "./MaterialIcon";

// 风格 Skill 卡：黑标题栏 SKILL_0X.EXE + 图 + 标题/描述 + 圆形选择 pip。1:1 还原原型。
interface Props {
  skill: StyleSkill;
  selected: boolean;
  onSelect: (id: number) => void;
}

export default function SkillCard({ skill, selected, onSelect }: Props) {
  return (
    <article
      data-testid={`skill-card-${skill.id}`}
      data-selected={selected}
      onClick={() => onSelect(skill.id)}
      className={`border-2 border-on-tertiary-fixed hard-shadow flex flex-col group cursor-pointer transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] ${
        selected ? "bg-primary-container" : "bg-surface-container-lowest"
      }`}
    >
      <div className="bg-on-tertiary-fixed text-on-tertiary px-3 py-1 flex justify-between items-center border-b-2 border-on-tertiary-fixed">
        <span className="font-label-sm text-label-sm uppercase tracking-widest">
          SKILL_0{skill.id}.EXE
        </span>
        <MaterialIcon name="close" className="text-[16px]" />
      </div>
      <div
        className={`h-48 relative overflow-hidden border-b-2 border-on-tertiary-fixed ${skill.color}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover filter contrast-125 mix-blend-hard-light group-hover:scale-105 transition-transform duration-500"
          src={skill.img}
          alt={skill.title}
        />
      </div>
      <div className="p-4 flex justify-between items-end">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-tertiary-fixed uppercase">
            {skill.title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {skill.desc}
          </p>
        </div>
        <div
          className={`w-8 h-8 rounded-full border-2 border-on-tertiary-fixed flex items-center justify-center transition-colors ${
            selected
              ? "bg-on-tertiary-fixed text-on-tertiary"
              : "group-hover:bg-primary-container"
          }`}
        >
          <MaterialIcon name="check" className="text-[18px]" />
        </div>
      </div>
    </article>
  );
}
