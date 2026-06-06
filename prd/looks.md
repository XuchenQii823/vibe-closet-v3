# 模块：收藏册 Lookbook（Looks）

## 功能概述

像作品集一样收藏、回看满意的搭配。`/looks` 倒序展示已存 Look 卡，拼贴预览用 `itemIds` 反查 `items` 取图。

## 核心功能列表（已实现）

- **页头**：Lookbook 标题 + New Look 按钮（→ `/style`）。
- **Look 卡 LookCard**：黑标题栏（`L-0XX // 名称` + favorite/删除）+ Scrapbook 拼贴预览 + 底部元信息（source 徽标 + 相对时间）。拼贴**复用共享组件 `components/ScrapbookCollage`**，与 `/result` 生成时**完全一致**：最多展示 5 片（不再固定 3 片、不再用标题徽标补位）、带类别标签、`orderForCollage` 按体积排序（大件铺底大槽位+低 z，小配饰置顶小槽位+高 z 防遮挡）、图片 `contain` 居中、`h-[360px]` 容器。单品被全部删除时显占位。
- **倒序渲染**：最新置顶（`addLook` 头插）。
- **编号**：`formatSerial` → `L-001` 三位补零，序号取自 `meta.lookSerialCounter`。
- **收藏切换 / 删除**。
- **空态**（原型缺，已补）：`looks-empty-state`「还没有收藏」+ New Look。
- **被删单品降级**：`itemIds` 反查过滤已删除项；底部显「N 件单品已删除」，不崩。
- **相对时间**：替代原型「Last worn」，显示「保存于今天 / X 天前 / X 周前」。

## 数据结构

```ts
Look {
  id: string; serial: number; title: string; skillId: number;
  itemIds: string[];          // 只存引用，不复制图片
  reason?: string; layout?: 'stack'|'scrapbook';
  favorite: boolean; createdAt: number; source?: 'ai'|'fallback';
}
```
存储键：`vibe-closet:looks`（`Look[]`）；序号来自 `vibe-closet:meta.lookSerialCounter`。

## 业务逻辑

```
/looks: useLooks() 读 looks（倒序）→ 每 look 的 itemIds 反查 useCloset().items 取图
        → LookCard 渲染拼贴（最多 5 片，复用 ScrapbookCollage）→ favorite/删除写回
被删单品：itemIds 反查时 filter 掉 undefined → 底部提示缺失数量
```

## 相关代码文件

- `app/looks/page.tsx`
- `components/LookCard.tsx`
- `components/ScrapbookCollage.tsx`（与 /result 共用的拼贴组件）
- `lib/closet/looks.ts`（`addLook`/`deleteLook`/`toggleLookFavorite`/`formatSerial`）
- `lib/closet/meta.ts`（`nextLookSerial`）
- `lib/hooks/useLooks.ts`

## 关联文档

- [style-engine.md](./style-engine.md)（Look 的生成与保存来源）
- [closet.md](./closet.md)（拼贴图来自单品）
