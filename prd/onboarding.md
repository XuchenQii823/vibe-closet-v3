# 模块：开机 Onboarding（Splash）

## 功能概述

App 默认路由 `/` 的终端风开机页，传达 Retro-Vacation「SYSTEM.INIT」品牌调性，单 CTA 进入衣橱。首次进入记忆 `onboardingSeen`，二次启动直达 `/closet`。

## 核心功能列表（已实现）

- **SYSTEM.INIT 黑标题栏**：脉冲状态灯（`animate-pulse` 圆点）+ 3 个窗口控制方块。
- **品牌区**：VIBE CLOSET 大标题 + slogan「用你已有的衣服，穿出设计师的样子」。
- **主视觉图**：灰度 + `mix-blend-multiply` + scanline 叠加 + `Loading_Modules...` 角标。
- **主 CTA**「立即开启数字衣橱」：`btn-press` 按下下沉 6px → `router.push('/closet')`。
- **onboarding 记忆**：点击 CTA 写 `vibe-closet:meta.onboardingSeen=true`；二次启动 `useEffect` 检测后 `router.replace('/closet')` 直达。写标记失败（隐私模式）不阻断进入。

## 数据结构

读写 `vibe-closet:meta`：
```ts
ClosetMeta { onboardingSeen: boolean; lookSerialCounter: number; schemaVersion: number }
```

## 业务逻辑

```
打开 / → useEffect 读 meta.onboardingSeen
  ├─ true  → router.replace('/closet')（直达，不展示 splash）
  └─ false → 渲染 splash 终端面板
点击 CTA → setMeta({onboardingSeen:true})(try/catch) → push('/closet')
```

## 相关代码文件

- `app/page.tsx` — Splash 页
- `lib/closet/meta.ts` — `getMeta` / `setMeta`
- `components/TopAppBar.tsx`、`components/BottomNavBar.tsx`、`components/MaterialIcon.tsx`

## 关联文档

- [navigation-and-data.md](./navigation-and-data.md)（meta 存储）
- [design-system.md](./design-system.md)（scanline / 硬投影 / 标题栏窗口）
