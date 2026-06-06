# 开发计划 — Vibe Closet（风格衣橱）

> 首版 MVP 已由 `03-project-develop` 实现并通过验证。§3 各功能块已归档到 `prd/`，本文件保留全局约定、已完成索引、后续目标与进度记录。继续开发请用 `project-iterate`。

## 1. 项目框架
- 工具形态：移动优先 Web（Mobile Web，未来演进为原生 App）
- 主框架：**Next.js 14**（App Router + TypeScript + Tailwind）
- 数据：全本地 `localStorage`；唯一服务端为 `app/api/style`（隐藏 SiliconFlow Key 的 AI 代理 + 兜底）
- 包管理器：**npm**

## 2. 全局技术约定（贯穿各功能）
- **路由**：`/`(splash) `/closet` `/style` `/result` `/looks` `/add` + `/api/style`。
- **localStorage key**：`vibe-closet:items`、`vibe-closet:looks`、`vibe-closet:meta`。
- **图片**：单品图存压缩后 base64（长边 ≤ 1000px，JPEG q0.7）；**Look 只存 itemIds 引用**。
- **AI 边界**：前端只调 `/api/style`；Key 仅服务端 `process.env.SILICONFLOW_API_KEY`，模型 `Qwen/Qwen3-VL-30B-A3B-Instruct`（文字搭配 + 识图共用）。
- **存储封装**：页面禁止直接 `JSON.parse(localStorage)`，统一经 `lib/storage → lib/closet → lib/hooks`；SSR 安全。
- **类别集合**：Tops / Bottoms / Outerwear / Shoes / Accessories（筛选条另含 All）。
- **设计系统**：见 `design-system/Vibe Closet/MASTER.md`，token 已落地 `tailwind.config.ts` + `app/globals.css`。

## 已完成模块（详见 prd/）

> §3 各功能块已实现并通过 project-verify 动态走查（2026-05-31），按 `.claude/rules/todo-prd-archive.md` 归档：

- 开机 Onboarding（`/`）→ `prd/onboarding.md`（归档 2026-05-31）
- 数字衣橱 + 录入（`/closet` `/add`）→ `prd/closet.md`（归档 2026-05-31）
- 风格选择 + AI 搭配引擎（`/style` `/result` `/api/style`）→ `prd/style-engine.md`（归档 2026-05-31）
- 收藏册 Lookbook（`/looks`）→ `prd/looks.md`（归档 2026-05-31）
- 全局导航 + 数据层 → `prd/navigation-and-data.md`（归档 2026-05-31）
- 设计系统落地 → `prd/design-system.md`（归档 2026-05-31）

## 3. MVP 功能拆解（已归档）

- [x] 3.1 Onboarding 开机动画 → 见 `prd/onboarding.md`
- [x] 3.2 CLOSET 数字衣橱 + 录入 → 见 `prd/closet.md`
- [x] 3.3 STYLE 风格选择 → 见 `prd/style-engine.md`
- [x] 3.4 RESULT AI 搭配引擎（技术核心）→ 见 `prd/style-engine.md`
- [x] 3.5 LOOKS 收藏册 → 见 `prd/looks.md`
- [x] 3.6 全局 3-Tab 导航 + 数据层 → 见 `prd/navigation-and-data.md`

> §3 各项验收标准已逐条动态验证通过，明细见文末「验证记录」。

## 4. 界面与交互规格
- [x] 6 个界面入口与路由一一对应
- [x] 固定 TopAppBar(56px) + BottomNavBar(80px，`/add` 除外)，正文 `pt-14 pb-20` 避让
- [x] 三 Tab 页共享导航；splash/add/result 流程页（add 不显示底部 Tab、result 显示且 Style 高亮）
- [x] 核心组件：标题栏窗口、单品卡、look 卡、skill 卡、retro 按钮、CategoryChips、Stack/Scrapbook、SYSTEM.INIT 终端、上传卡
- [x] 重点状态：空衣橱 / AI 生成中 / AI 失败 三处已实现
- [x] 移动端 390×844 基准，无横向溢出（已在该视口走查）
- [x] 埋点 data-testid（QA 套，见 §8）

## 5. 架构与模块边界
- [x] Next.js App Router + TS + Tailwind 初始化（手动脚手架）
- [x] `app/layout.tsx` 全局字体 + token + `#F5E7DC` 底
- [x] 路由页 + `app/api/style/route.ts`
- [x] 模块边界：`components/` / `lib/storage` / `lib/closet` / `lib/hooks` / `lib/style` / `lib/image`
- [x] 数据对象：ClosetItem / Look / StyleSkill / StyleRequest·Response（见 `lib/closet/types.ts`）
- [x] 边界纪律：页面不直接读写 localStorage，走 storage→closet→hooks 链
- [x] 密钥：`SILICONFLOW_API_KEY` 仅服务端读取；`.env.local` 入 `.gitignore`，提供 `.env.local.example`

## 6. 设计系统
- [x] 读取 prd / DESIGN.md / 原型，已生成 MASTER.md
- [x] MASTER token 落地 `tailwind.config.ts` + `app/globals.css`
- [x] 覆盖关键界面 默认/空/加载/成功/错误 五态
- [x] 定稿原型差异：Result 补 Stack/Scrapbook、补 Accessories、0px 直角；**Closet 按「100% 还原 HTML」取原型网格**（双排横滚卡带列入 §10）

## 7. API 与集成（SiliconFlow Qwen）
- [x] `.env.local` + `.env.local.example`（`SILICONFLOW_API_KEY`），`.env*` 已 gitignore；无 Key 走兜底
- [x] `app/api/style/route.ts`：`runtime='nodejs'` + 15s AbortController + 服务端读 Key
- [x] `lib/style/siliconflow.ts`：请求体（Qwen、temp 0.7/regen 0.9、max_tokens 1200、json_object、非流式）+ system prompt + 解析链（去围栏→parse→校验 itemIds）
- [x] 本地规则兜底（分桶组套 + 模板标题/理由），结构与 LLM 一致，标 `source:"fallback"`
- [x] 调用日志：入口/模型/延迟/套数/失败 reason/是否降级；不输出 Key/图片/隐私
- [x] 前端 styleClient 接 `/api/style`，处理 loading / REGENERATE / fallback 弱提示
- [x] API Key 不进前端 bundle（验证：占位 Key 即走兜底，无明文外发）

## 8. 验证
- [x] project-verify 动态走查（playwright，视口 390×844）：`/`→enter→`/closet` 空态→`/add` 上传压缩→卡片出现→筛选 Tops→`/style`→生成 loading→成功(兜底)→切 Scrapbook→SAVE→`/looks` 出现→`/looks` 空态
- [x] `npm run lint`（0 warning/error）/ `npx tsc --noEmit`（0）/ `npm run build`（10 路由全过）
- [x] localStorage 结构断言：items 6 字段、looks 含 serial/itemIds/source/layout、meta 计数器自增
- [x] 校验 API 日志脱敏、无明文 Key（grep 无 Bearer 泄露）
- [x] data-testid 埋点齐全（splash/nav/closet/add/style/looks 全套）
- 说明：动态验证在无真实 Key 环境进行，AI 成功路径走「占位 Key → 兜底」分支；配置真实 Key 后的在线 Qwen 路径待真机回归（见 §10）。

## 9. 开发完成后更新 PRD
- [x] 基于实际代码创建 `prd/` 文档体系（6 模块 + README 索引）
- [x] 对照原始 prd 总目标与已实现，把差距写入 §10
- [x] 根目录 PRD 归档为 `prd.original.md`
- [x] 生成同内容 CLAUDE.md / AGENTS.md，并写 README.md

## 已追加功能（2026-05-31）

### AI 自动识图（/add）
- [x] `lib/vision/recognize.ts`：SiliconFlow 多模态调用 `Qwen/Qwen3.6-35B-A3B`（OpenAI 兼容 `image_url` base64），返回 `{category,colorHint,name}` + 校验 category 命中枚举
- [x] `app/api/recognize/route.ts`：Node runtime、20s 超时、脱敏日志（只记图片字节数不记图片本体）、未配置 Key / 失败均返回 200 + 提示（不阻断录入）
- [x] `lib/vision/recognizeClient.ts` + `/add` 接线：压缩后自动识图、`RECOGNIZING...` 遮罩、`add-reco-status` 状态横幅、预填类别/颜色/名称（可手改）
- [x] 验证（no-key 路径）：上传 → enter/skip(missing_api_key) → UI 显「请手动选择」；日志无图片本体泄露
- [x] **识图在线真机回归（2026-05-31）**：配置真实 Key，上传白 T 恤 → `Qwen/Qwen3.6-35B-A3B` 正确识别 `{category:Tops, color:白色, name:T恤}`，自动预填表单；日志 `success`、耗时 ~650ms、**Key 零泄露**。
  - 关键修复：该模型为「推理模型」，默认输出 `reasoning_content` 会吃光 token 致 `content` 为空（首次 `empty_content`）。请求体加 **`enable_thinking: false`** 后正常返回 JSON（同款修复也加到文字搭配 `lib/style/siliconflow.ts`）。

## 10. 未完成目标 / 后续功能
- [x] 识图在线真机回归（见上「已追加功能」，2026-05-31 通过）
- [x] **文字搭配在线真机回归（2026-05-31 通过）**：真实 Key 下 `/style(skill=1) → /result`：日志 `success{source:'ai', ms:1826}`，标题「复古优雅通勤」+ 切题中文理由（非兜底模板）；REGENERATE（`regenerate:true`）重出「复古粗花呢优雅」新结果；无「离线兜底」提示、Key 零泄露。两条 AI 链路（识图 + 文字搭配）均已在线验证。
- [x] **Closet 双排横向滚动卡带（2026-06-02 完成）**：移动端两行横滚（`grid-flow-col grid-rows-2 auto-cols-[160px] overflow-x-auto`），`md+` 降级网格（`md:grid-cols-4 lg:grid-cols-6`）；实测 scrollWidth>clientWidth 可横滚、桌面无横滚 6 列。
- [x] **ADD NEW ITEMS 常驻吸底（2026-06-02 完成）**：从随内容滚动改为 `fixed bottom-20` 吸底栏，浮在 3-Tab 之上随时可点，正文 `pb-40` 避让；实测按钮底距视口底 80px、点击跳 `/add`。
- [ ] **删除二次确认**：单品 / look 删除目前无确认弹窗，误删不可恢复（用户暂不做，2026-06-02）。
- [x] **Scrapbook 拼贴精修（2026-06-02 完成）**：
  - Result 的 ScrapbookLayout 从 flex 平铺等大卡改为**绝对定位错落叠放心情板**（最多 5 片，响应式百分比槽位、大小不一、z 层级、类别标签、hover 抬升复彩）；实测 2 件对角、3 件叠放均衡。
  - LookCard（/looks 收藏卡）拼贴**同步升级**为相同的百分比响应式错落叠放槽位（之前是固定 px 槽位、对比不够），实测每卡 3 片尺寸明显不一、绝对定位叠放；不足 3 件用标题徽标补位。
  - **小件遮挡修复（2026-06-02）**：新增 `orderForCollage`（lib/closet/looks.ts）按体积排序——外套/上衣/裤子等大件铺底走大槽位+低 z，鞋/包/墨镜等小配饰置顶走小槽位+高 z；槽位改为尺寸递减、z 递增；图片用 `contain` 居中展示完整主体（避免墨镜等小件主体被 cover 裁到贴底）。实测配饰即使在数据首位也被重排到最高层（z-30）不被遮挡。Result 与 LookCard 同步。

### Result 改版：删除 Stack、一次生成 3 套（2026-06-03 完成）
- [x] 移除 Optimized Stack 排版与 `style-layout-toggle` 切换，`/result` 只保留 Scrapbook（`StackLayout` 删除）。
- [x] 一次生成 `LOOKS_PER_GEN`(=3) 套：prompt 要求 3 套各异、`max_tokens` 1200→2000、超时 15s→30s；`buildFallbackLooks` 用 3 个类别组合模板 + 单品轮换 + 去重产出 3 套。
- [x] `/result` 纵向排列 3 套，每套含标题(`1/3` 序号)+拼贴+理由+**独立「收藏这套」按钮**；全局「换一批」(regen) + 「去收藏册」。
- [x] **在线真机回归（2026-06-03）**：真实 Key 下生成 3 套（亚麻微风海岸线/丹宁夏日休闲派/真丝点缀午后光），`success{source:'ai', looks:3, ms:5886}`、Key 零泄露；逐套收藏：点 1/3 → 仅该按钮变「已收藏」并禁用，存档 `layout:scrapbook, source:ai`。
- 备注：旧验证记录中提及的 `style-layout-toggle / -stack / -scrapbook` 埋点随本次移除而废弃。

### Lookbook 拼贴与 Result 统一（2026-06-03 完成）
- 背景：LookCard 用自己的一套布局（固定槽位、最多 3 片、不足 3 件用标题徽标补位），与 /result 生成时的拼贴不一致；实际搭配常 3 件以上。
- [x] 抽出共享组件 `components/ScrapbookCollage.tsx`（绝对定位错落叠放、最多 5 片、类别标签、orderForCollage 排序、contain 居中、h-[360px]）。
- [x] `/result`（ResultLookCard）与 `/looks`（LookCard）都改用该组件，移除各自重复的槽位/渲染代码与标题徽标补位。
- [x] 验证：/looks 注入 5 件 / 2 件搭配 → 分别渲染 5 片（OUTERWEAR/TOP/BOTTOM/SHOES/ACCESSORY）/ 2 片（TOP/SHOES）；5 片尺寸递减 177→135、z 递增 10→50、容器 360px 带边框；与 /result 完全一致。

### 统一模型为 Qwen3-VL-30B-A3B-Instruct（2026-06-03 完成）
- 背景：原文字模型 `Qwen3.6-27B`、识图模型 `Qwen3.6-35B-A3B` 都是推理模型，慢且要 `enable_thinking:false` hack。
- [x] 文字搭配（`lib/style/siliconflow.ts`）+ 识图（`lib/vision/recognize.ts`）默认模型均改为 `Qwen/Qwen3-VL-30B-A3B-Instruct`（视觉+文本、非推理）。
- [x] **移除 `enable_thinking:false`**（该 Instruct 模型不支持，实测传了报 400 code 20015）。
- [x] 直连实测：文字 2.7s / 识图 3.6s，JSON 直出无 reasoning_content。
- [x] 在线真机回归：换新 Key 后，`/style` 生成 `success{source:'ai', looks:3, ms:8846, model:Qwen3-VL-30B-A3B-Instruct}`；`/add` 识别 `success{category:Tops, ms:2628}`、UI 预填「Tops/白色T恤/白色」；两处 Key 零泄露。
- 备注：`.env.example`、README、prd 已同步新模型名与「勿传 enable_thinking」提示。

### Result 提速：即时兜底 + 后台 AI 升级（2026-06-03 完成）
- 背景：实测 SiliconFlow 共享端点延迟波动大（直连 6~30s，与模型大小/max_tokens 无关，纯端点排队）；纯等 AI 体验差。
- [x] `/result` 改为**先本地后 AI**：点击即用客户端 `buildFallbackLooks` 算 3 套立即展示（0 等待），后台请求 `/api/style`，AI 返回无感替换；失败/超时保留本地兜底，全程无空白加载页。
- [x] `buildFallbackLooks` 加 `seed` 参数：「换一批」时即时兜底也产出不同组合（不卡着不动）。
- [x] `reqIdRef` 请求竞态守卫：快速连点「换一批」时丢弃过期 AI 响应，避免旧覆盖新。
- [x] `style-upgrading` 薄荷脉冲提示「AI 正在后台优化」；升级完成后按 source 显隐。
- [x] 验证：lint/build 通过；多次生成均**无空白加载**（`style-loading` 不再长驻）、3 套即时渲染、AI 标题确认后台替换、控制台确认后台请求。`fallback.ts` 仍同时被服务端 route 与客户端 result 复用（无 server-only 依赖）。
- 已知后续候选（原 PRD §6 Roadmap）：高级 AI Style Skills、Scrapbook 高清导出分享、电商补缺件、虚拟换装图像合成、拍照自动识别品类、localStorage→IndexedDB 迁移、自定义 Style Skills、场景/天气条件。

## 开发进度

### 2026-05-31（03-project-develop 首版交付）
- 完成：Next.js 脚手架 + 设计 token 落地 + 数据层（storage/closet/looks/meta/image/hooks）+ AI 引擎（siliconflow/fallback/route/client）+ 8 个公共组件 + 6 个页面 + API 代理。
- 验证：lint/typecheck/build 全过；playwright 390×844 动态走查主流程闭环（splash→closet→add→style→result→looks），localStorage 结构与日志脱敏均确认。
- 文档：重建 prd/ 6 模块 + README 索引，写 README.md，更新 CLAUDE.md/AGENTS.md，归档 prd.original.md。
- 下轮建议：配置真实 Key 跑在线 Qwen 回归（§10 首项）；按需实现双排横滚卡带与删除确认。

## 验证记录

### 2026-05-31 project-verify（动态 + 静态）
- 静态：`next lint` 0 问题；`tsc --noEmit` 0 错误；`next build` 成功（`/ /add /closet /looks /result /style` + `/api/style` + `/icon.svg`）。
- 动态（playwright，viewport 390×844，npm run dev @3100）：
  - [x] 3.1 splash 显 SYSTEM.INIT + slogan + CTA；enter → `/closet`
  - [x] 3.2 空衣橱显 `closet-empty-state`；`/add` 上传 PNG → 压缩预览 → 选类别 → 保存 → `/closet` 出现 `closet-item-card`；筛选 Tops 仅 1 卡且 chip 选中；刷新仍在（localStorage 持久）
  - [x] 3.3 4 张 skill 卡渲染、默认 Poolside；单品 ≥2 时 `style-generate-btn` 可点 → `/result?skill=4`
  - [x] 3.4 进入显 `style-loading` → `style-result`：标题卡 + TOP/SHOES 槽位 + `style-reason-text` 非空中文；`style-layout-toggle` 切 Scrapbook 正常；兜底弱提示「离线兜底」；日志 `enter/fail->fallback/fallback`，**无 Bearer/Key 泄露**
  - [x] 3.5 SAVE → `/looks` 出现 `looks-card`（L-001，反查 Tops+Shoes 图，source=Local，保存于今天）；清空后显 `looks-empty-state`
  - [x] 3.6 三页 `bottom-nav` 常驻、Tab 高亮正确；favicon 已补（仅余无害 favicon 历史 404）
- 失败/跳过：（已补）在线 Qwen 成功路径于 2026-05-31 用真实 Key 验证通过——识图 `success{category:Tops, ms:652}`、文字搭配 `success{source:'ai', ms:1826}` + REGENERATE 出新结果，均无 Key 泄露。

### 2026-05-31 在线 AI 真机回归（真实 Key）
- [x] 识图：上传白 T → `Qwen/Qwen3.6-35B-A3B` 识别 Tops/白色/T恤，自动预填（修复 `enable_thinking:false`）
- [x] 文字搭配：`/style → /result` 走 `source:'ai'`，标题+理由切题；REGENERATE 重出新搭配
- [x] 安全：两条链路日志均无 `sk-` Key 泄露（grep 计数 0）

## TODO 卸货记录

### 2026-05-31
- 归档：§3.1–3.6 全部功能块 → `prd/`（onboarding / closet / style-engine / looks / navigation-and-data / design-system）
- TODO 行数：约 275 → 约 130（§3 verbose 块折叠为索引）
- 下轮活跃项：§10 在线 Qwen 回归、双排横滚卡带、删除确认
