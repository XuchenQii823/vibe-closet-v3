# 模块：全局导航 + 数据层

## 功能概述

3 个核心 Tab 稳定切换、固定顶/底栏、localStorage 统一封装与异常降级。关闭重开数据仍在。

## 核心功能列表（已实现）

### 导航
- **持久底部 3-Tab** `bottom-nav`（Closet / Style / Looks），高亮当前 Tab；`/result` 时 Style 仍高亮（`path==='/style' || path==='/result'`）。
- **TopAppBar**（56px 黑底）：logo 点击回 `/`；右上 add 去 `/add`；流程页（`/add`）显 back、右侧留空保持标题居中。
- **避让**：主页面 `pt-14 pb-20` 为固定栏预留空间；`/add` 不显示底部 Tab、底部固定保存条。

### 数据层（统一封装）
- **`lib/storage/localStore.ts`**：唯一 localStorage 封装。SSR 安全（`typeof window` 判断）、`readJSON`/`writeJSON` 序列化、`QuotaError` 容量捕获、`isStorageAvailable` 隐私模式探测、脱敏错误日志。
- **`lib/closet/*`**：`items.ts` / `looks.ts` / `meta.ts` 纯函数 CRUD + 筛选 + id 生成 + 序号自增。
- **`lib/hooks/*`**：`useCloset` / `useLooks` 把 storage+domain 包成 React 状态，挂载后读取避免 hydration mismatch，错误（如存储已满）透出给 UI。
- **首启初始化**：`getMeta` 缺字段用默认值补齐（`onboardingSeen/lookSerialCounter/schemaVersion=1`）。
- **降级**：localStorage 不可用 → `useCloset.storageOk=false`，closet 顶部一次性提示「临时模式」，页面其余功能仍可用（本会话内存态）。

## 数据结构（localStorage 键）

| 键 | 类型 | 说明 |
|---|---|---|
| `vibe-closet:items` | `ClosetItem[]` | 衣橱单品（含压缩 base64 图） |
| `vibe-closet:looks` | `Look[]` | 收藏搭配（只存 itemIds 引用） |
| `vibe-closet:meta` | `ClosetMeta` | onboarding 标记 + 序号计数器 + schemaVersion |

## 边界纪律

- 页面/组件**禁止**直接 `JSON.parse(localStorage)`，必走 `storage → closet → hooks` 链。
- 预留 IndexedDB 升级口（当前 schemaVersion=1）。

## 相关代码文件

- `components/TopAppBar.tsx`、`components/BottomNavBar.tsx`、`components/MaterialIcon.tsx`
- `lib/storage/localStore.ts`
- `lib/closet/types.ts` / `items.ts` / `looks.ts` / `meta.ts`
- `lib/hooks/useCloset.ts` / `useLooks.ts`
- `app/layout.tsx`（字体 / 全局底色）

## 关联文档

- 各功能模块均依赖本数据层与导航。
