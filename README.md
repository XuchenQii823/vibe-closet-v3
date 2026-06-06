# Vibe Closet（风格衣橱）

> 用你已有的衣服，穿出设计师的样子。

一个 **Retro-Brutalism × Poolsuite** 风格的移动优先 Web 应用：把真实衣物拍成数字卡片，选一个风格 Vibe，由 AI 从你已有的单品里搭出一套 Look，并收藏到作品集。视觉 100% 还原自设计原型 `vibe_closet_your_digital_wardrobe.html`。

## 已实现功能

- **开机 Splash**：SYSTEM.INIT 终端动画 + 单 CTA，首次记忆、二次直达衣橱。
- **数字衣橱**：拍照/相册录入 → canvas 压缩存 base64 → 类别筛选（6 类）网格浏览，收藏 / 删除，空态。
- **AI 自动识图**（`/add`）：上传后调 SiliconFlow 多模态模型 `Qwen/Qwen3-VL-30B-A3B-Instruct` 自动识别类别/颜色/名称并预填（可手改）；未配置 Key 时跳过、退回手动，不阻断。
- **风格选择**：4 个预设 Vibe 单选，默认 Poolside；单品 < 2 件引导补充。
- **AI 搭配引擎**：SiliconFlow Qwen 从已有单品搭一套（标题 + itemIds + 中文理由），Optimized Stack / Scrapbook 两种排版，REGENERATE / SAVE；**未配置 Key 或失败时本地规则兜底**，永不白屏。
- **收藏册 Lookbook**：倒序网格、Scrapbook 拼贴预览、收藏/删除、被删单品降级、空态。
- **全局**：固定 3-Tab 导航 + TopAppBar；全部数据存浏览器 `localStorage`，统一封装与异常降级。

## 技术栈

- **Next.js 14**（App Router）+ **TypeScript** + **Tailwind CSS 3**
- 数据：浏览器 `localStorage`（无后端数据库）
- 唯一服务端：`app/api/style` Route Handler（隐藏 AI Key 的代理 + 兜底）
- 包管理器：**npm**；Node ≥ 18（开发用 Node 24 验证）

## 快速开始

```bash
npm install
npm run dev
```

打开 **http://localhost:3000** （若端口被占用，Next 会提示实际端口；本项目验证时用过 `PORT=3100 npm run dev` → http://localhost:3100）。

### 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发（热更新） |
| `npm run build` | 生产构建 |
| `npm run start` | 运行生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |

## 配置 AI Key（可选）

不配置也能用——AI 搭配会自动走**本地规则兜底**（结果标记「离线兜底」）。要启用 Qwen 在线搭配：

1. 在项目根目录的 **`.env.local`** 中填入你的 SiliconFlow Key（变量名 `SILICONFLOW_API_KEY`，不要加引号/空格）：

   ```env
   SILICONFLOW_API_KEY=你的真实_SiliconFlow_API_Key
   ```

2. 可选覆盖：`SILICONFLOW_MODEL`（文字搭配）、`SILICONFLOW_VISION_MODEL`（`/add` 识图），二者默认都为 `Qwen/Qwen3-VL-30B-A3B-Instruct`（视觉+文本、非推理、JSON 直出、速度快）；`SILICONFLOW_BASE_URL`（默认 `https://api.siliconflow.cn/v1`）。同一个 `SILICONFLOW_API_KEY` 同时驱动文字搭配与识图。该模型为 Instruct，请求不要带 `enable_thinking`（会 400）。
3. 占位中文值（`这里粘贴…`）会被识别为「未配置」并走兜底。Key 仅服务端读取，绝不进前端 bundle；`.env.local` 已被 `.gitignore` 忽略。

> 模板见 `.env.local.example`。

## 目录结构

```
app/
  layout.tsx            全局字体 / 底色 / metadata
  page.tsx              / 开机 Splash
  closet/page.tsx       /closet 数字衣橱
  add/page.tsx          /add 单品录入
  style/page.tsx        /style 风格选择
  result/page.tsx       /result AI 搭配结果（技术核心）
  looks/page.tsx        /looks 收藏册
  api/style/route.ts    AI 代理 Route Handler（脱敏日志 + 兜底）
  globals.css           设计 token 落地（硬投影 / scanline 等）
  icon.svg              favicon
components/             TopAppBar / BottomNavBar / ItemCard / LookCard / SkillCard / CategoryChips / MaterialIcon
lib/
  storage/localStore.ts  唯一 localStorage 封装（SSR 安全 + quota + 降级）
  closet/                types / items / looks / meta（纯函数 CRUD）
  hooks/                 useCloset / useLooks
  image/imageUtils.ts    canvas 压缩 → base64
  style/                 siliconflow（服务端）/ fallback / styleClient / skills
tailwind.config.ts       设计 token（移植自原型）
prd/                     已实现产品文档（PRD 文档体系）
design-system/           设计系统 MASTER
```

## 文档索引

- [`TODO.md`](./TODO.md) — 后续开发计划（**继续开发以此为准**）
- [`prd/`](./prd/README.md) — 已实现产品文档体系（按代码事实重建）
- [`CLAUDE.md`](./CLAUDE.md) / [`AGENTS.md`](./AGENTS.md) — 协作说明（内容一致）
- `prd.original.md` — 最初的粗粒度总目标，仅供人类回顾，**不作为 Agent 开发依据**
- `design-system/Vibe Closet/MASTER.md` — 设计系统

## 已知后续项

见 [`TODO.md` §10](./TODO.md)：双排横向滚动卡带、Scrapbook 高清导出分享、电商补缺、虚拟换装、拍照自动识别品类、localStorage→IndexedDB 迁移等。
