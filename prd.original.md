# Vibe Closet: Project Brief & PRD

## 1. Project Overview
**Product Name:** Vibe Closet (风格衣橱)
**Slogan:** "用你已有的衣服，穿出设计师的样子" (Wear what you have like a designer.)
**Platform:** Mobile Web (evolving into a native Mobile App)
**Design Vision:** "Retro-Vacation" / Poolsuite aesthetic. A blend of 90s tech minimalism, retro computer interfaces, and high-end boutique photography.

---

## 2. Target Audience
**Persona:** Lin Xiaoman (24, Visual Design Assistant).
**Context:** Living in a shared apartment in a Tier-1 city. Fashion-conscious but limited by budget and space. Loves the "Retro-Vacation" aesthetic and seeks a tool that makes wardrobe management feel like a creative project rather than a chore.

---

## 3. Visual Identity (Design System: Retro-Vacation)
*   **Color Palette:**
    *   Primary Background: Warm Beige (`#F5E7DC`)
    *   Accent 1 (Action): Mint Green (`#A8DAD0`)
    *   Accent 2 (Highlight): Blush Pink (`#E9B7B7`)
    *   Stroke/Text: Ink Black (`#1A1A1A`)
*   **Typography:**
    *   Primary Font: `Space Mono` (Monospaced, tech-retro feel)
    *   Style: Uppercase headers, clear hierarchy, pixel-inspired weights.
*   **UI Components:**
    *   **Hard Shadows:** 4px-8px solid black shadows on cards and buttons.
    *   **Border Radius:** 4px (Softened corners with sharp edges).
    *   **Imagery:** High-end minimalist product photography on solid beige/white backgrounds.

---

## 4. Key Features & User Flows

### A. System Onboarding (Launch Flow)
1.  **Splash Screen:** "SYSTEM.INIT" terminal-style loading animation.
2.  **App Launcher:** A "desktop" inspired entry point featuring the signature retro computer graphic.
3.  **App Entry:** Direct transition from system boot to user interface.

### B. Digital Closet (Wardrobe Management)
*   **Inventory View:** Dual-row horizontal scrolling cards.
*   **Filtering:** Categorization by Tops, Bottoms, Outerwear, Shoes, and Accessories.
*   **Entry Point:** Fixed "ADD NEW ITEMS" module docked above the navigation for constant accessibility.
*   **Item Capture:** Dedicated "Add New Item" flow for photographing or uploading clothing items.

### C. Style Preview (AI Styling Engine)
*   **Look Composition:** Multi-item layering of Tops, Bottoms, Shoes, and Accessories.
*   **Layout Variations:**
    *   *Optimized Stack:* Overlapping cards with controlled offsets to avoid obscuring visual data.
    *   *Scrapbook Mode:* Randomized tilt (-3° to 3°) and stacking to simulate a physical fashion mood board.
*   **Actions:** "REGENERATE" (Left) and "SAVE TO LOOKS" (Right) as primary CTAs.

### D. Digital Lookbook (Collections)
*   **Archive View:** Collection of saved outfits.
*   **Layout Logic:** Tight, cropped previews focusing on the "Visual Core" of each item to maximize screen density without losing clarity.

---

## 5. Technical Requirements & Constraints
*   **Responsive:** Mobile-first vertical and horizontal scrolling optimizations.
*   **Asset Handling:** All item backgrounds must be unified to solid beige (`#F5E7DC`) or white to ensure visual purity.
*   **Navigation:** Persistent 3-tab Bottom Bar (Closet, Style, Looks).

---

## 6. Future Roadmap
*   **Advanced AI Styling:** Integration of "Style Skills" for curated fashion directions.
*   **Social Sharing:** Exporting "Scrapbook" looks as high-resolution images for social media.
*   **E-commerce Bridge:** Suggestions for items to complete a look based on gaps in the current closet.

---

## 7. API 接入方案（待确认）

### 7.1 接入概览
- **供应商**：SiliconFlow（硅基流动）
- **模型**：`Qwen/Qwen3.6-27B`（文本 / 对话）
- **协议**：OpenAI 兼容 Chat Completions
- **Base URL**：`https://api.siliconflow.cn/v1`
- **端点**：`POST /chat/completions`
- **鉴权**：请求头 `Authorization: Bearer <SILICONFLOW_API_KEY>`
- **环境变量**：`SILICONFLOW_API_KEY`（置于 `.env.local`，加入 `.gitignore`，禁止 `NEXT_PUBLIC_` 前缀）
- **官方文档**：https://api-docs.siliconflow.cn/docs/api/chat-completions-post

### 7.2 用途
为 STYLE Tab 的「AI 搭配引擎」服务：输入用户衣橱已有单品的结构化元数据
（id / category / name / color / styleTags）与所选 Vibe（风格 Skill），由 Qwen 输出
1~N 套搭配建议，每套包含「选中单品 id 列表 + 搭配标题 + 搭配理由文案」，
驱动结果卡片展示与 REGENERATE。

### 7.3 安全边界（Next.js）
- 所有调用经服务端 Route Handler `app/api/style/route.ts`（Node runtime）代理。
- API Key 仅在服务端 `process.env.SILICONFLOW_API_KEY` 读取并拼接请求头，绝不下发前端。
- 前端只向 `/api/style` 发送衣橱元数据（不含图片本体），不接触 Key、不直连 SiliconFlow。

### 7.4 请求 / 响应约定
- 调用参数：`temperature 0.7`（REGENERATE 可升至 0.9）、`max_tokens 1200`、
  `response_format: json_object`、非流式。
- 输出 schema：`{ "looks": [{ "title", "itemIds": [...], "reason" }] }`。
- 服务端二次校验：`itemIds` 必须命中入参 id，过滤幻觉 id；有效套数为 0 时走兜底。

### 7.5 降级与容错
- 触发条件：未配置 Key / 超时(15s AbortController) / 限流(429) / 5xx / JSON 解析失败 / 校验后零套数。
- 兜底：本地规则搭配（按 category 分桶组套 + 颜色不冲突 + 模板化标题与理由），
  返回结构与 LLM 成功时一致，响应标记 `source: "fallback"`，前端弱提示。

### 7.6 日志（脱敏）
- 记录：调用入口（itemCount、requestedLooks）、模型、延迟、成功套数、失败 status/reason、是否降级。
- 禁止记录：API Key、Authorization 头、单品图片 / 完整名称、用户隐私原文。

### 7.7 暂不接入
- 图片生成 / 视频 / 语音 / 音乐 / 视觉识别等多模态能力，MVP 不接，列入后续 Roadmap。

> 说明：仓库 `API文档/` 写的是 MiniMax，仅作 OpenAI 兼容协议**格式参考**；
> 本项目实际供应商为 SiliconFlow + `Qwen/Qwen3.6-27B`，以本章节为准。
