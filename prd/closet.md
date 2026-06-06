# 模块：数字衣橱 Closet + 单品录入 Add

## 功能概述

把真实衣物录成数字卡片、按类别浏览管理，作为 AI 搭配的素材库。含浏览页 `/closet` 与录入页 `/add`。

## 核心功能列表（已实现）

### `/closet`
- **类别筛选条**：横滚 chips（All + Tops/Bottoms/Outerwear/Shoes/Accessories），选中黑底白字，`snap-x` + `hide-scrollbar`。
- **双排横滚卡带**：移动端两行横向滚动（`grid-flow-col grid-rows-2 auto-cols-[44vw]` 放大卡片，按列填充上下两行，`overflow-x-auto snap-x`）；`md+` 降级为多列网格（`md:grid-cols-4 lg:grid-cols-6`，取消固定列宽与横滚）。即 MASTER §11 的「移动卡带 / 桌面网格」定稿。
- **布局填充**：整页 `flex flex-col`，卡带区 `flex-1 justify-center` 在 chips 与 ADD 之间垂直居中，避免中间出现大段空白。
- **单品卡 ItemCard**：黑标题栏（类别 + favorite 切换）/ `object-contain` 图区 / 名称 + 材质 chip；图加载失败显 `broken_image` 占位；hover 显删除按钮。
- **favorite 收藏切换**：写回 `item.favorite`，pip 变实心 + blush 色。
- **删除单品**：hover 出现红色 × 按钮（原型缺，MVP 补全供纠错）。
- **空态**（原型缺，已补）：`closet-empty-state` 虚线卡「衣橱是空的」+ 去 `/add` 按钮。
- **ADD 常驻入口**：`closet-add-entry` 紧跟卡带下方、位于底部导航之上（flex 布局末位 + 卡带定高不撑屏），随时可点 → `/add`，无需滑到内容底部。
- **存储降级提示**：localStorage 不可用 / 写满时顶部 error 卡提示。

### `/add`
- **拍照 / 相册**：隐藏 `input[type=file] accept="image/*"`（拍照含 `capture="environment"`），点击取景框/相册触发。
- **图片压缩**：`imageUtils.compressImage` 用 canvas 缩放（长边 ≤ 1000px）→ JPEG q0.7 base64，米底铺底避免透明转黑。
- **AI 自动识图**：压缩成功后自动调 `/api/recognize`（SiliconFlow 多模态模型 `Qwen/Qwen3-VL-30B-A3B-Instruct`），返回 `{category, colorHint, name}` 预填表单（用户仍可手动改）。预览区显 `RECOGNIZING...` 遮罩；状态横幅 `add-reco-status` 提示「已自动识别为 X」/「请手动选择」。**识图无法本地兜底**：未配置 Key（含中文占位）或失败时跳过、退回手动填写，不阻断录入。图片仅服务端发模型，日志只记字节大小不记图片本体。
- **元数据表单**：类别（必填，chip 单选）/ 名称 / 材质标签 / 颜色（均可选）。
- **校验**：未选图 / 未选类别 → `add-error` 行内提示，不写库；非图片文件被拒。
- **保存**：`addItem` push 到 `vibe-closet:items`（最新置顶）→ 回 `/closet`。`QuotaExceededError` → 「存储已满」提示且不丢已有数据。
- Scan QR 占位按钮已按计划**移除**。

## 数据结构

```ts
ClosetItem {
  id: string; name: string; category: Category;
  tag?: string; colorHint?: string;
  image: string;   // 压缩后的 base64 dataURL
  favorite: boolean; createdAt: number;
}
type Category = 'Tops'|'Bottoms'|'Outerwear'|'Shoes'|'Accessories'
```
存储键：`vibe-closet:items`（`ClosetItem[]`）。

## 业务逻辑

```
/closet: useCloset() 读 items → CategoryChips 选 filter → filterItems 过滤 → 渲染 ItemCard 网格 | 空态
/add: 选文件 → isImageFile 校验 → compressImage → 预览 → 选类别(必填)+元数据 → addItem → push /closet
```

## 实现说明（相对 PRD / MASTER §11）

- 首版曾按「100% 还原 HTML」用原型网格；**2026-06-02 已升级为 MASTER §11 定稿方案**：移动端双排横向滚动卡带、`md+` 网格 fallback，两者共用同一容器靠响应式类切换（不重复渲染）。
- 同轮把「ADD NEW ITEMS」从随内容滚动的模块改为**常驻吸底栏**，提升随时添加的可达性。

## 相关代码文件

- `app/closet/page.tsx`、`app/add/page.tsx`
- `components/ItemCard.tsx`、`components/CategoryChips.tsx`
- `lib/closet/items.ts`（CRUD + `filterItems` + `genId`）
- `lib/image/imageUtils.ts`（压缩）
- `lib/hooks/useCloset.ts`
- `app/api/recognize/route.ts`（识图服务端代理 + 脱敏日志）
- `lib/vision/recognize.ts`（SiliconFlow 多模态调用 + 解析校验，`server-only`）
- `lib/vision/recognizeClient.ts`（前端调用封装，永不抛错可降级）

## 关联文档

- [style-engine.md](./style-engine.md)（衣橱单品作为搭配素材）
- [navigation-and-data.md](./navigation-and-data.md)（存储封装与降级）
