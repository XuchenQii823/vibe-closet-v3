"use client";

import { useRouter } from "next/navigation";
import MaterialIcon from "./MaterialIcon";

// 顶部固定栏（56px / h-14）：黑底 + 薄荷品牌名，1:1 还原原型 TopAppBar。
interface Props {
  title?: string;
  leftAction?: "menu" | "back";
  rightAction?: "power_settings_new" | "add" | "none";
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

export default function TopAppBar({
  title = "VIBE CLOSET",
  leftAction = "menu",
  rightAction = "power_settings_new",
  onLeftClick,
  onRightClick,
}: Props) {
  const router = useRouter();

  return (
    <header
      data-testid="top-app-bar"
      className="fixed top-0 left-0 w-full z-[60] flex justify-between items-center px-margin-mobile h-14 bg-brand-black text-on-tertiary border-b-2 border-brand-black shrink-0"
    >
      <button
        onClick={onLeftClick}
        aria-label={leftAction === "back" ? "返回" : "菜单"}
        className="hover:opacity-80 active:translate-y-px transition-transform flex items-center justify-center"
      >
        <MaterialIcon
          name={leftAction === "back" ? "arrow_back" : "menu"}
          className="text-on-tertiary"
        />
      </button>

      <h1
        onClick={() => router.push("/")}
        className="font-headline-sm text-headline-sm text-brand-mint tracking-tighter cursor-pointer"
      >
        {title}
      </h1>

      {rightAction === "none" ? (
        // 占位，保持标题居中（原型 add 页右侧无按钮）
        <span className="w-6" />
      ) : (
        <button
          onClick={onRightClick || (() => router.push("/add"))}
          aria-label="添加单品"
          className="hover:opacity-80 active:translate-y-px transition-transform flex items-center justify-center"
        >
          <MaterialIcon
            name={rightAction === "add" ? "add_box" : rightAction}
            className="text-on-tertiary"
          />
        </button>
      )}
    </header>
  );
}
