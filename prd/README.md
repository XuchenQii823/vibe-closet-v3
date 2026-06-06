# Vibe Closet — PRD 文档体系（已实现）

> 本目录是**基于当前代码实现**重建的产品文档（PRD）。后续开发以根目录 `TODO.md` 为开发计划、以本目录为「已实现产品事实」。
> 根目录 `prd.original.md` 是最初的粗粒度总目标，仅供人类回顾，**不作为 Agent 开发依据**。

## 产品整体结构

Vibe Closet（风格衣橱）是一个 **Retro-Brutalism × Poolsuite** 风格的移动优先 Web 应用：用户把真实衣物拍成数字卡片，选一个风格 Vibe，由 AI（SiliconFlow Qwen，未配置时本地兜底）从已有单品里搭出一套 Look，并收藏到作品集。

- **框架**：Next.js 14 App Router + TypeScript + Tailwind CSS
- **数据**：全部存浏览器 `localStorage`（无后端数据库）
- **唯一服务端**：`app/api/style` Route Handler，仅用于隐藏 AI Key 的代理 + 兜底

## 路由入口

| 路由 | 页面 | 文档 |
|---|---|---|
| `/` | 开机 Splash | [onboarding.md](./onboarding.md) |
| `/closet` | 数字衣橱 | [closet.md](./closet.md) |
| `/add` | 单品录入 | [closet.md](./closet.md) |
| `/style` | 风格选择 | [style-engine.md](./style-engine.md) |
| `/result` | AI 搭配结果 | [style-engine.md](./style-engine.md) |
| `/looks` | 收藏册 Lookbook | [looks.md](./looks.md) |
| `/api/style` | AI 代理 Route Handler | [style-engine.md](./style-engine.md) |

## 模块文档

- [onboarding.md](./onboarding.md) — 开机动画与 onboarding 记忆
- [closet.md](./closet.md) — 衣橱浏览、筛选、单品录入（拍照/相册 + 压缩）
- [style-engine.md](./style-engine.md) — 风格选择 + AI 搭配引擎 + 本地兜底（技术核心）
- [looks.md](./looks.md) — 收藏册网格、Scrapbook 拼贴、被删单品降级
- [navigation-and-data.md](./navigation-and-data.md) — 3-Tab 导航、TopAppBar、localStorage 封装层
- [design-system.md](./design-system.md) — 设计 token 落地（颜色/字体/硬投影/0px 直角）

## 数据流总览

```
拍照/相册 → imageUtils 压缩(base64) → addItem → localStorage(vibe-closet:items) → useCloset → ItemCard
选 Vibe → styleClient → POST /api/style → siliconflow(Qwen) | fallback → 结果拼贴
SAVE → addLook(只存 itemIds) → localStorage(vibe-closet:looks) → useLooks → LookCard(反查 items 取图)
```

## 关键工程约定

- 页面禁止直接读写 `localStorage`，统一经 `lib/storage` → `lib/closet` → `lib/hooks`。
- AI Key 只在服务端 `process.env.SILICONFLOW_API_KEY` 读取，绝不进前端 bundle。
- Look 只存 `itemIds` 引用，不复制图片，控制 5MB 配额。
- API 调用链全程脱敏日志（入口/成功/失败/降级），不打印 Key/图片/隐私原文。
