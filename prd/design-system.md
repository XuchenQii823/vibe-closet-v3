# 模块：设计系统落地

## 功能概述

把 `design-system/Vibe Closet/MASTER.md` 与 HTML 原型的设计 token 1:1 落地到 Tailwind 配置与全局 CSS，保证 Retro-Brutalism × Poolsuite 视觉的 100% 还原。

## 核心落地（已实现）

### `tailwind.config.ts`（移植自原型内联 config）
- **颜色 token**：完整 Material 扩展色阶 + 品牌色 `brand-mint #A8DAD0` / `brand-blush #F2C9CB` / `brand-black #1A1A1A`；页面底 `background #F5E7DC`。
- **圆角**：`DEFAULT/lg/xl = 0px`（统一直角）；`full = 9999px`（仅选择圆点 / pip / 状态灯例外）。
- **字体**：headline/label = `Space Mono`，body = `DM Sans`；含原型全部 `fontSize` token（headline-lg/md/sm、body-md/lg、label-lg/sm 等）。
- **间距**：`margin-mobile 16px` / `margin-desktop 40px` / `max-width 1280px` / `gutter` / `unit`。

### `app/globals.css`（移植自原型 `<style>`）
- **硬投影**：`.hard-shadow`（6px）/ `.hard-shadow-sm`（2px）/ `.retro-border`（2px 黑边）。
- **按下态**：`.btn-press:active` 下沉 6px、`.hardware-btn:active` 下沉 2px，投影归零。
- **纹理**：`.scanline`（4px 扫描线）用于终端/加载态。
- **滚动条**：`.hide-scrollbar` 隐藏（chips / 横滚区）。
- **图标**：`.material-symbols-outlined` 默认轴 + `.fill-1` 实心变体。
- 全局底色 `#F5E7DC`，`min-height: max(884px,100dvh)`（移动端 390×844 基准）。

### 字体加载
- `app/layout.tsx` 用 `<link>` 直引 Material Symbols + Space Mono + DM Sans（与原型一致，确保字形 100% 对齐）。

## 签名组件气质

- **标题栏窗口**：黑底 + 薄荷/白 Space Mono 大写文字（`SYSTEM.INIT` / `SKILL_0X.EXE` / `L-0XX // 名称`）。
- **卡片**：纯白底 + 2px 黑边 + 4px 硬投影 + 可选黑标题栏。
- **按钮**：薄荷/粉填充 + 2px 黑边 + 硬投影 + 按下下沉。
- **状态规范**：默认 / 空态（虚线卡）/ 加载态（终端 scanline）/ 成功 / 错误（error-container 卡）五态。

## 已定稿的原型 vs PRD 差异（MASTER §11）

1. **Closet 布局**：按用户「100% 还原 HTML」取**原型网格**（非双排横滚）；横滚卡带列入后续增强。
2. **Result 排版**：已补 Stack + Scrapbook 可切换（原型仅规整网格）。
3. **Accessories 类别**：已补齐（原型筛选缺）。
4. **0px 直角**：全局统一。

## 相关代码文件

- `tailwind.config.ts`、`app/globals.css`、`app/layout.tsx`、`app/icon.svg`
- 依据：`design-system/Vibe Closet/MASTER.md`、`vibe_closet_your_digital_wardrobe.html`
