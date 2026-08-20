"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MaterialIcon from "./MaterialIcon";

// 通用二次确认弹窗：用于「删除单品 / 删除搭配」等不可恢复操作的防误触。
// 复用项目复古设计（retro-border + hard-shadow + SYSTEM 风标题栏），单品卡与搭配卡共用，避免重复实现。
// 设计观察点：open=false 时直接返回 null 不渲染遮罩；点遮罩或「取消」走 onCancel，点「确认」走 onConfirm。
interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 透传到根遮罩，方便测试与外层定位（如 closet-delete-confirm） */
  testId?: string;
}

export default function ConfirmDialog({
  open,
  title = "确认删除",
  message,
  confirmLabel = "删除",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
  testId,
}: Props) {
  // 仅在客户端挂载后才允许 createPortal（SSR 阶段 document 不存在）。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 打开时支持 Esc 取消；关闭/卸载时移除监听，避免泄漏。
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const portalRoot =
    document.getElementById("phone-viewport-root") ?? document.body;

  // 用 Portal 挂到手机画布根节点：既避免被卡片 hover transform 拖动，
  // 也让 fixed 遮罩只覆盖 402×874 的 iPhone 屏幕，不盖住作品集页面。
  return createPortal(
    // 全屏遮罩：点空白处＝取消（误点也安全）
    <div
      data-testid={testId}
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 px-6"
    >
      {/* 弹窗主体：阻止冒泡，避免点弹窗内部被当成点遮罩 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-surface-container-lowest retro-border hard-shadow overflow-hidden"
      >
        {/* 标题栏：与单品卡/搭配卡/开机页统一的品牌黑底；警示用柔粉图标做轻提示，不再用跳脱的纯红 */}
        <div className="bg-brand-black text-on-tertiary px-4 py-2 flex items-center gap-2 border-b-2 border-brand-black">
          <MaterialIcon name="warning" className="text-[18px] text-brand-blush" />
          <span className="font-label-lg text-label-lg uppercase tracking-wide">
            {title}
          </span>
        </div>

        {/* 提示文案 */}
        <p className="p-5 font-body-md text-body-md text-on-tertiary-fixed">
          {message}
        </p>

        {/* 操作区：取消（中性）+ 确认（警示） */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={onCancel}
            data-testid="confirm-cancel-btn"
            className="flex-1 py-3 bg-surface-container retro-border hard-shadow-sm btn-press font-headline-sm text-headline-sm uppercase"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            data-testid="confirm-ok-btn"
            className="flex-1 py-3 bg-brand-blush text-brand-black retro-border hard-shadow-sm btn-press font-headline-sm text-headline-sm uppercase"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portalRoot
  );
}
