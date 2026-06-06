# 模块：风格选择 Style + AI 搭配引擎 Result（技术核心）

## 功能概述

用户在 `/style` 选一个风格 Vibe，在 `/result` 由 AI（SiliconFlow Qwen）从「已有衣物」挑一套成立搭配 + 标题 + 中文理由；未配置 Key 或调用失败时本地规则兜底。满意可存入收藏册。

## 核心功能列表（已实现）

### `/style`
- **CHOOSE YOUR VIBE** 标题区。
- **4 张预设风格卡**（90s Chanel / Prada / Westwood / Poolside），黑标题栏 `SKILL_0X.EXE` + 图 + 标题/描述 + 圆形 pip 单选，前端静态常量。
- **默认高亮 Poolside Retro**（id=4），保证 AI 有明确风格方向。
- **Generate CTA**：右下浮动按钮，携 `?skill=<id>` 跳 `/result`。
- **单品数量校验**：单品 < 2 显 `style-empty-closet` 引导去 `/closet`，CTA 禁用置灰。

### `/result`
- **进入即自动首次生成**（`startedRef` 防重复），**一次生成 `LOOKS_PER_GEN`(=3) 套各不相同的搭配**。
- **即时兜底 + 后台升级（核心体验）**：点击/进入后**先在客户端用 `buildFallbackLooks` 本地算 3 套，0 等待立即展示**（`setSource('fallback')`、`upgrading=true`）；同时后台请求 `/api/style`，AI 结果返回后**无感替换**为 `source:'ai'`，失败/超时则保留本地兜底。解决 SiliconFlow 共享端点延迟波动（6~30s）导致的长时间空白等待。`reqIdRef` 防止快速「换一批」时旧响应覆盖新结果；「换一批」传 `seed` 让即时兜底也产出不同组合。
- **加载态** `style-loading`：仅在衣橱数据 hydration 的极短瞬间出现；正常流程直接展示即时兜底，不再长时间空转。
- **`style-upgrading` 提示**：升级期间显示「已先给你一版搭配，AI 正在后台优化…」薄荷色脉冲条。
- **成功态** `style-result`：纵向排列 3 套，每套 = 粉底标题卡（含 `1/3` 序号）+ Scrapbook 拼贴 + `// STYLING NOTE` 中文理由 + **独立「收藏这套」按钮**。
- **唯一排版 Scrapbook**（已移除 Optimized Stack 切换）：绝对定位错落叠放的心情板（最多 5 片，`h-[360px]`），槽位百分比响应式、尺寸递减、z 递增，每片带类别标签 + 倾斜 + 硬投影 + 图片 `contain` 居中（完整主体、米底无缝），hover 抬升并恢复彩色。拼贴前经 `orderForCollage` 按体积排序：大件（外套/上衣/裤子）铺底走大槽位+低 z，小配饰（鞋/包/墨镜）置顶走小槽位+高 z，避免小件被遮挡。
- **槽位标签**：按类别映射 TOP/BOTTOM/OUTERWEAR/SHOES/ACCESSORY + 对应图标。
- **REGENERATE「换一批」**：`regenerate=true`，服务端升 temperature 0.9，重出 3 套新搭配。
- **SAVE（每套独立）**：点某套「收藏这套」写 `vibe-closet:looks`（`layout:"scrapbook"`），该按钮变「已收藏」并 `disabled`，其余套仍可收藏；不自动跳转，另设「去收藏册」按钮。
- **错误态** `style-error`：失败显 RETRY；单品 < 2 引导去衣橱。
- **兜底弱提示**：`source==='fallback'` 时显「离线兜底搭配（未连接 AI）」。
- 被选单品已删除 → 提示重新生成，不崩。

## AI 接入方案（最终实现）

- **供应商 / 模型**：SiliconFlow `Qwen/Qwen3-VL-30B-A3B-Instruct`（视觉+文本、非推理 Instruct、JSON 直出；可经 `SILICONFLOW_MODEL` / `SILICONFLOW_BASE_URL` 覆盖）。
- **协议**：OpenAI 兼容 `POST /v1/chat/completions`，非流式，`response_format: json_object`，`max_tokens 2000`，temperature 0.7（regen 0.9）；prompt 要求一次输出 3 套各不相同的搭配。**不传 `enable_thinking`**（该 Instruct 模型不支持，传了会 400）。
- **安全边界**：前端只调同源 `/api/style`；Key 仅服务端 `process.env.SILICONFLOW_API_KEY` 读取，`runtime='nodejs'`，绝不下发前端。前端只发脱敏元数据（id/category/name/color/tag），**不发图片本体**。
- **超时**：`AbortController` 30s（3 套生成需更充裕时间）。
- **解析校验链**：去 ```json 围栏 → `JSON.parse` → 过滤幻觉 itemId（必须命中入参）→ 取前 3 套；零有效套数则降级。
- **降级触发**：未配置/占位 Key、超时、非 2xx、JSON 解析失败、校验后零套数 → `buildFallbackLooks`（3 个类别组合模板 + 单品轮换 + 去重，产出最多 3 套；模板标题/理由），结构与 AI 路径一致，标 `source:"fallback"`，不返回 5xx（保证前端不白屏）。
- **脱敏日志**：`enter`（itemCount/skillId/regenerate/model/keyConfigured）、`success`（source/looks/ms）、`fail->fallback`（reason/ms）、`fallback`（looks/ms）。**不输出** Key/Authorization/图片/隐私原文。

> 说明：占位 Key（中文「这里粘贴…」）被 `hasApiKey()` 视为未配置，直接走兜底，避免发起注定失败的请求。

## 数据结构

```ts
StyleRequest  { items: {id,category,name,color?,tag?}[]; skillId: number; regenerate?: boolean }
StyleResponse { looks: {title, itemIds[], reason}[]; source: 'ai'|'fallback' }
StyleSkill    { id,title,desc,img,promptHint,color }  // 前端静态常量
```

## 相关代码文件

- `app/style/page.tsx`、`app/result/page.tsx`
- `app/api/style/route.ts`（服务端代理 + 日志 + 降级）
- `lib/style/siliconflow.ts`（Qwen 调用 + prompt + 解析校验，`server-only`）
- `lib/style/fallback.ts`（本地规则兜底）
- `lib/style/styleClient.ts`（前端调用封装）
- `lib/style/skills.ts`（4 预设 skill 常量）
- `components/SkillCard.tsx`
- `components/ScrapbookCollage.tsx`（拼贴组件，与 /looks 的 LookCard 共用）

## 关联文档

- [closet.md](./closet.md)（单品素材来源）
- [looks.md](./looks.md)（SAVE 去向）
