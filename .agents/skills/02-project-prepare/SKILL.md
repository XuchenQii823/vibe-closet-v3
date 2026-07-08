---
name: 02-project-prepare
description: 从仓库根目录 prd.md 准备一个 vibecoding 项目，但不写业务代码。读取 01-mvp-prd-builder 产出的粗粒度 PRD，通过多 Agent 深度拆解 MVP 功能、动态判断网页/桌面软件/浏览器插件等项目形态，生成或更新设计系统、API 接入方案、架构规格、验收标准和 TODO.md 开发计划，并在用户确认前停止。
---

# Project Prepare：粗 PRD → 多 Agent 深度拆解 → 开发规格 → TODO.md

## 概述

面向 vibecoding 小白的项目准备 Skill。用户只需要维护仓库根目录 `prd.md`；本 Skill 负责把 `01-mvp-prd-builder` 产出的简版 PRD 转成 `03-project-develop` 可稳定执行的开发规格，但不得创建页面、安装依赖、写业务代码或真正接入 API。

当前阶段的核心问题是：`prd.md` 的 `【核心功能 MVP】` 经常只有几个词或很短一句话，到了 03 开发时不知道具体要做什么，导致实现不稳定。本 Skill 必须先深度拆解这些 MVP 功能，再生成 TODO.md。

后续真正写代码时，使用 `03-project-develop` Skill 按 `TODO.md`、`prd.md`、`design-system/` 和项目规格执行。

`TODO.md` 是计划阶段产物，应该优先由本 Skill 生成。开发完成后如果实际实现没有覆盖 `prd.md` 的所有目标，由 `03-project-develop` 调用 `update-prd` 对比根目录 `prd.md`、当前代码和新生成的 `prd/` 文档体系，只把未完成差距新增或更新回 `TODO.md`。

## Agent 文档位置

正式 Agent 定义放在仓库根目录 `.Codex/agents/*.md`：

- frontmatter：`name`、`description`、`tools`、`color`
- 正文：职责、不负责、输入、输出、执行流程、验收标准

不要把正式 Agent 定义放进 `.Codex/skills/02-project-prepare/agents/`。

### TODO 生命周期（02 生成 → 日常维护）

| 阶段 | 规范 |
| --- | --- |
| 02 生成 TODO | 本 Skill 模板（含已完成模块索引、开发进度、卸货记录占位） |
| 每轮开发结束 | `.Codex/rules/todo-writeback.md` |
| TODO 过长 / 功能闭环 | `.Codex/rules/todo-prd-archive.md` → 增量写 `prd/`，精简 §2 |
| 里程碑 / 首版收尾 | `update-prd` 全量（可与卸货配合） |

### Agent 与 Skill 的关系

| 层级 | 职责 |
| --- | --- |
| `.Codex/agents/*.md` | **项目级 specialist**：描述能力与输出格式；任何主会话 / Skill 均可 spawn |
| `02-project-prepare` | **计划阶段默认编排者**：启用矩阵、并行 spawn、合并、写 TODO |
| `project-prepare-orchestrator.md` | **合并规则**（非 subagent），不是独占入口 |

本 Skill **拥有** prepare 阶段的标准编排流程，但**不独占** specialist Agent 的调用权。

## Subagent 调度规范（必须遵守）

本 Skill 的多 Agent 拆解**必须**通过 subagent 工具完成，禁止主会话跳过工具调用、直接模拟各 Agent 输出。

### 工具名称（按运行环境）

| 环境 | 工具 | 参数 |
|---|---|---|
| Codex | `Agent` | `subagent_type` = agent 的 `name`；`prompt` = 完整任务说明 |
| Cursor | `Task` | `subagent_type` = agent 的 `name`；`prompt` = 完整任务说明 |

下文统一称 **subagent 工具**。执行时选用当前环境实际可用的那个。

### 调度原则

1. **主会话负责编排**：读取 PRD、判断 Agent 启用矩阵、调用 subagent 工具、合并结果、写 TODO。主会话即 orchestrator，不要再 spawn `project-prepare-orchestrator`。
2. **Subagent 不能嵌套**：`.Codex/agents/` 里的 specialist 是叶子 worker，不能再 spawn 其他 subagent。
3. **并行优先**：必选 Agent 和已启用的条件 Agent 应在**同一轮**发出多个 subagent 工具调用，而不是串行等待。
4. **Prompt 必须自包含**：每个 subagent 启动时是独立上下文，prompt 里必须写明要读的文件路径、工具形态、主框架和期望输出格式；不要假设它看过主会话已读内容。
5. **合并规则**：所有 subagent 返回后，主会话按 `.Codex/agents/project-prepare-orchestrator.md` 的合并规则去重、消冲突，形成统一开发规格。

### 标准 prompt 上下文块

调用任一 specialist 时，prompt 开头应包含：

```text
你是 <agent-name> subagent（当前由 02-project-prepare 编排）。

请先读取仓库根目录 prd.md。
工具形态：<来自 prd.md>
主框架：<Next.js | Electron | vite-web-extension>
产品名称：<来自 prd.md>

只输出规格，不写业务代码、不安装依赖、不运行脚手架。
输出必须使用该 Agent 文档中的「标准输出格式」章节。
```

### 可调度 Agents

#### 必选（始终 spawn）

| name | 职责 |
|---|---|
| `mvp-requirement-analyst` | 粗粒度 MVP → 可开发功能规格 |
| `project-architecture-planner` | 架构、框架、模块边界、安全边界 |
| `qa-acceptance-planner` | 验收标准、测试点、验证清单 |

#### 条件启用（主会话先判断，再 spawn）

| name | 启用条件 |
|---|---|
| `ui-interaction-planner` | 有页面、窗口、popup、options、side panel、new tab 或其他可视界面 |
| `api-integration-planner` | PRD/API 文档涉及远程 API、AI、Token、鉴权、同步或第三方服务 |
| `platform-capability-planner` | 桌面软件、浏览器插件，或 PRD 涉及本地文件、剪贴板、通知、manifest、权限等 |

#### 不参与 spawn

| name | 用途 |
|---|---|
| `project-prepare-orchestrator` | **合并规则文档**，供主会话读取；不是 subagent |

### 启用原则

- 架构和 QA 永远启用。
- UI/交互：网站、桌面软件、浏览器插件通常启用。
- API/集成：只有确有远程服务、鉴权、同步或 Key 保护需求时启用。
- 平台能力：桌面软件、浏览器插件通常启用；纯网站仅在 PRD 明确涉及浏览器权限/本地能力时启用。
- 平台能力 ≠ 后端；Electron main/preload 和插件 background/service worker 是平台边界，不是传统服务端。

## 执行流程

### 第一步：读取 PRD

- 只读取仓库根目录 `prd.md`。
- 提取：产品名称、Slogan、工具形态、用户画像、场景故事、核心功能 MVP、交互流程、Mermaid 流程图、UI 设计风格。
- 优先使用 `prd.md` 里的 `工具形态:` 字段；该字段通常来自 `01-mvp-prd-builder` 的第 1 题：
  - `网站，优先在桌面使用`
  - `网站，优先在移动端使用`
  - `桌面软件`
  - `浏览器插件`
- 如果 `prd.md` 缺少工具形态，先暂停并让用户从以上四项中选一项，不要继续生成 TODO。
- 如果 `【核心功能 MVP】` 中有功能只有几个词或一句很泛的描述，必须进入深度拆解流程，不要直接用这些词生成 TODO。

### 第二步：选择开发框架

根据工具形态写入唯一主框架：

| 工具形态 | 开发框架 | 说明 |
|---|---|---|
| 网站，优先在桌面使用 | Next.js | App Router + TypeScript，适合桌面优先 Web 产品 |
| 网站，优先在移动端使用 | Next.js | App Router + TypeScript，按移动端优先响应式设计 |
| 桌面软件 | Electron | Electron + Vite + TypeScript，优先使用 electron-vite 结构 |
| 浏览器插件 | vite-web-extension | 使用 `https://github.com/JohnBra/vite-web-extension`，Manifest V3、React、TypeScript、Tailwind |

不要把工具形态改写成技术方案；在 `TODO.md` 中同时保留原始工具形态和最终框架选择。

### 第三步：判断 Agent 启用矩阵

主会话根据 PRD 写出启用矩阵（写入最终 TODO.md 第 1 节），例如：

```text
必选：mvp-requirement-analyst、project-architecture-planner、qa-acceptance-planner
条件启用：ui-interaction-planner（网站有可视入口）
未启用：api-integration-planner（MVP 无远程 API）；platform-capability-planner（非桌面/插件）
```

### 第四步：spawn subagent 深度拆解

**必须**使用 subagent 工具。同一轮并行发出所有已启用 Agent 的调用。

#### 4.1 必选 Agent（并行）

**mvp-requirement-analyst**

```text
你是 mvp-requirement-analyst subagent（当前由 02-project-prepare 编排）。
读取 prd.md，逐条拆解【核心功能 MVP】。
对每个功能输出：功能名称、用户目标、使用入口、子功能、主流程、输入/输出/反馈、
默认/空/加载/成功/错误态、数据读写、MVP 必做、暂不实现、待确认点及推荐默认值。
粗关键词不得原样作为唯一任务描述。
使用标准输出格式章节输出。
```

**project-architecture-planner**

```text
你是 project-architecture-planner subagent（当前由 02-project-prepare 编排）。
读取 prd.md，按工具形态选择主框架并产出架构规格：
主框架与理由、入口规划、模块边界、数据对象、本地/远程存储、API Key 与安全边界、
是否需要后端或平台边界、开发顺序、架构风险。
不要默认规划后端。
使用标准输出格式章节输出。
```

**qa-acceptance-planner**

```text
你是 qa-acceptance-planner subagent（当前由 02-project-prepare 编排）。
读取 prd.md，为每个 MVP 功能产出验收标准、主流程走查、异常流程、
自动验证命令建议、平台专项验证。
使用标准输出格式章节输出。
```

#### 4.2 条件 Agent（与必选 Agent 同一轮并行 spawn）

仅在启用矩阵中标记为启用的 Agent 才 spawn：

- **ui-interaction-planner**：界面入口、信息架构、组件、状态、响应式/窗口要求
- **api-integration-planner**：按需读 `API文档/`，产出 API 清单、鉴权、降级、`【API 接入方案（待确认）】` 草案
- **platform-capability-planner**：权限、入口、生命周期、Electron/插件边界、平台验证

各 Agent 的完整 prompt 模板见对应 `.Codex/agents/<name>.md` 的「被调用方式」章节。

#### 4.3 等待并收集结果

- 等待所有 subagent 完成后再进入合并。
- 若某个 subagent 失败，最多重试 1 次；仍失败则主会话按该 Agent 文档职责补做，并在 TODO 中标注「⚠️ 由主会话补写」。

#### 4.4 主会话合并规格

读取 `.Codex/agents/project-prepare-orchestrator.md`，按其中合并规则处理全部 subagent 输出：

- 去重、消冲突
- 产品范围以 `prd.md` 为准
- 技术路线以工具形态和框架映射为准
- 安全策略选更严格且符合平台约束的方案
- 产出一份统一开发规格，供第五～七步使用

**禁止** spawn `project-prepare-orchestrator` 作为 subagent。

### 第五步：读取 UI 准则并产出设计系统

- 读取 `.Codex/skills/ui-ux-pro-max/SKILL.md`；如果项目只存在 `.agents/skills/ui-ux-pro-max/SKILL.md` 或 `.cursor/skills/ui-ux-pro-max/SKILL.md`，再读对应路径。
- 在调用/使用 `ui-ux-pro-max` 前，先回到第一步已读取的 `prd.md` 内容，确认是否存在 `【UI 设计风格】`：
  - 有：把该章节作为设计系统的主风格来源，`ui-ux-pro-max` 只用于补齐工程化 token、组件规范、响应式和可访问性细节。
  - 没有：不要暂停要求用户补 UI 风格；必须基于 `prd.md` 里的产品名称、Slogan、工具形态、用户画像、场景故事、核心功能 MVP、交互流程和 UI/交互 Agent 输出，先选择最适合的设计系统方向，再用 `ui-ux-pro-max` 补齐具体规则。
- 当 `prd.md` 没有 UI 设计风格时，设计方向选择必须服务产品语境，而不是泛泛追求“好看”：重点判断用户注意力状态、使用频率、内容密度、平台入口、任务严肃度、情绪调性和核心转化动作。
- 在生成 `MASTER.md` 时写明「设计取向依据」：简要说明这个设计系统如何来自 `prd.md` 的用户、场景、功能、工具形态和界面规格。
- 检查是否已有 `design-system/<产品名>/MASTER.md`：
  - 有：读取并对比 `prd.md` 与新开发规格，只更新过时或冲突内容。
  - 没有：基于 `prd.md`、UI/交互规格和 UI 准则生成 `MASTER.md`。
- 设计系统至少覆盖：颜色 token、字体、圆角、阴影、组件气质、响应式/窗口尺寸原则、关键界面状态。
- 与 `prd.md` 冲突时，以 `prd.md` 的产品表达为准，UI 准则只补齐工程化细节。

### 第六步：读取 API 文档并制定接入方案

- 只有 `api-integration-planner` 启用时才执行本步骤；没有 API 需求时，在 TODO 中写明“当前 MVP 不需要远程 API”。
- 优先采用 `api-integration-planner` subagent 输出的 API 方案草案；主会话核对后写回 `prd.md`。
- 按需读取 `API文档/` 中与 PRD 场景相关的文档；不要整目录盲读。
- 若存在 `API文档/如何接入Token`，先读取鉴权方式。
- 在 `prd.md` 末尾新增或更新 `【API 接入方案（待确认）】`，已存在时只更新，不重复追加。

写回格式：

```markdown

【API 接入方案（待确认）】

### 会调用的 API
- API 名称：用于什么功能；为什么比纯本地实现更合适；失败时如何降级。

### 暂不接入的 API
- API 名称：暂不接入原因；后续什么条件下再接入。
```

### 第七步：生成 TODO.md 并停止

- 在仓库根目录创建或更新 `TODO.md`。
- 如果已存在，按最新 `prd.md`、合并后的开发规格、设计系统和 API 方案重写计划，不保留过时任务。
- TODO 必须明确写出工具形态、主框架和框架映射。
- TODO 必须包含“多 Agent 需求拆解结果”，不能只写“实现核心功能”。
- TODO 应覆盖完整 MVP 开发计划。
- 预留“未完成目标 / 后续功能”章节。
- 模板须含 **§ 已完成模块（详见 prd/）**、**§ 开发进度**、**§ TODO 卸货记录** 占位（首版留空；后续见 `.Codex/rules/todo-writeback.md` 与 `todo-prd-archive.md`）。
- 不要包含 `## 0. 用户确认` 章节。
- 写完后必须停止，向用户请求确认；确认前只能解释或修改 `prd.md` / `TODO.md` / `design-system/`。

交付提示：

```text
我已经把 PRD 的粗粒度 MVP 拆成了可开发规格，并整理好了设计系统、API 接入方案和 TODO.md。请确认：
1. TODO.md 中每个功能的子功能、页面/入口、状态和验收标准是否符合预期
2. prd.md 中的 API 使用方式是否符合预期
3. 主框架和平台能力规划是否正确

确认后我再使用 03-project-develop 开始首版开发；之后日常迭代用 project-iterate。
```

## TODO.md 模板

```markdown
# 开发计划

## 1. 项目框架
- 工具形态：<直接来自 prd.md 的工具形态>
- 主框架：<Next.js | Electron | vite-web-extension>
- 框架映射：网站 → Next.js；桌面软件 → Electron；浏览器插件 → vite-web-extension
- 选择理由：<结合 PRD 的一句话理由>
- Agent 启用矩阵：
  - 必选：mvp-requirement-analyst、project-architecture-planner、qa-acceptance-planner
  - 条件启用：<ui-interaction-planner | api-integration-planner | platform-capability-planner>
  - 未启用：<列出未启用 Agent 与原因>

## 已完成模块（详见 prd/）

> 首版留空。某 §2.x 功能全部 `[x]` 且经 project-verify 验证后，按 `.Codex/rules/todo-prd-archive.md` 写入对应 `prd/<模块>.md`，并在此追加索引；§2 中该块折叠为「已归档 → prd/…」。

（暂无）

## 2. MVP 功能拆解

### 2.1 <功能名>
- 用户目标：<用户为什么需要它>
- 使用入口：<页面/窗口/插件入口/命令入口>
- 子功能：
  - [ ] <可开发子功能 1>
  - [ ] <可开发子功能 2>
- 主流程：
  1. <用户动作>
  2. <系统反馈>
  3. <完成结果>
- 状态要求：
  - 默认态：<要求>
  - 空态：<要求>
  - 加载态：<要求>
  - 成功态：<要求>
  - 错误态：<要求>
- 数据需求：<本地状态/本地存储/API 返回/用户配置>
- MVP 边界：<必须做什么>
- 暂不实现：<后续功能>
- 验收标准：
  - [ ] <可检查标准>
  - [ ] <可检查标准>

## 3. 界面与交互规格
- [ ] <入口/页面/窗口/popup/options/side panel/new tab：具体要展示和支持的操作>
- [ ] <核心组件与状态>
- [ ] <响应式或窗口尺寸要求>

## 4. 架构与模块边界
- [ ] 按主框架初始化或检查项目结构
- [ ] 建立基础布局、全局样式和核心入口
- [ ] 按模块实现：<模块 A>、<模块 B>、<模块 C>
- [ ] 数据对象：<核心数据对象>
- [ ] 状态流：<用户输入 → 处理 → 存储/API → 展示/反馈>
- [ ] 按工具形态配置密钥保存方式：网站/桌面软件使用环境变量或安全本地配置，浏览器插件使用 `chrome.storage.local` 或 PRD 指定的插件本地存储
- [ ] **（Electron 专用）** `npm create electron-vite@latest` 脚手架；`dev` 脚本为 `electron-vite dev --watch`；main dev 态 `loadURL(ELECTRON_RENDERER_URL)`；业务开发前先验收 renderer HMR / preload 刷新 / main 重启

## 5. 设计系统
- [ ] 读取 prd.md 与 ui-ux-pro-max，并在缺少 UI 设计风格时基于 PRD 和界面规格推导设计取向
- [ ] 创建或更新 design-system/<产品名>/MASTER.md
- [ ] 将设计 token 落地到所选框架的样式系统
- [ ] 覆盖关键界面的默认态、空态、加载态、成功态和错误态

## 6. API 与集成
- [ ] <如果需要 API：为每个确认调用的 API 建立安全封装>
- [ ] <如果需要 API：API 封装须含调用日志（入口、关键参数摘要脱敏、成功/失败与错误原因；不输出 Key/Token/隐私原文）>
- [ ] <如果需要 API：加入缓存、失败降级和错误提示>
- [ ] <如果不需要 API：当前 MVP 使用本地状态/静态内容即可>
- [ ] 确保 API Key 不进入公开前端代码或插件包

## 7. 平台能力与权限
- [ ] <Electron：main/preload/renderer 边界，dev watch 与 ELECTRON_RENDERER_URL，或浏览器插件：manifest/permissions/入口>
- [ ] <本地文件/剪贴板/通知/storage/content script 等平台能力>
- [ ] <平台专项失败降级>

## 8. 验证
- [ ] 开发完成后运行 `project-verify` Skill，按 §2 验收标准逐条执行并回写打勾
- [ ] 运行 lint / build / 类型检查（由 project-verify 执行并记入验证记录）
- [ ] 生成或更新 `TESTING_CHECKLIST.md` 与 `test-results/` 证据
- [ ] 验证空态、加载态、错误态和未配置态
- [ ] 按平台验证：Next.js 页面访问 / Electron dev 启动且三类刷新可用 / Chrome Extension 加载已解压扩展
- [ ] 列出失败/跳过项与下一步建议

## 9. 开发完成后更新 PRD
- [ ] 调用 update-prd Skill
- [ ] 基于实际代码创建或更新 prd/ 文档体系
- [ ] 对照原始 prd.md 总目标与 prd/ 已实现文档，把未完成差距写入本 TODO
- [ ] 将根目录 prd.md 归档为 prd.original.md（保留原始总目标；Agent 后续不读取，仅供人类回顾）
- [ ] 生成或更新同内容的 AGENTS.md 和 AGENTS.md，提示后续基于 TODO.md 继续任务

## 10. 未完成目标 / 后续功能
- [ ] 开发完成后由 update-prd 填写：来自原始 prd.md 但尚未在当前实现中完成的功能、差距原因和下一步任务

## 开发进度

> 每轮 `project-iterate` 或开发 session 结束前追加一条；规范见 `.Codex/rules/todo-writeback.md`。

（首版尚未开始开发）

## TODO 卸货记录

> 每次将已完成块从 §2 归档到 `prd/` 时追加；规范见 `.Codex/rules/todo-prd-archive.md`。

（暂无）
```

## 框架规划要求

### Next.js

- 使用 App Router、TypeScript 和 CSS 变量/Tailwind 对齐设计系统。
- API Key 只能由服务端 Route Handler 或 Server Action 从环境变量读取。
- 页面路由按 PRD 交互流程和 UI/交互规格组织。
- 如果 MVP 不需要远程 API，不要为了“架构完整”新增后端接口。

### Electron

- 使用官方 npm 包 `electron`，当前推荐按大版本 30 规划：`package.json` 写 `electron: ^30.0.1`，以锁文件实际解析版本为准。
- 使用 Electron + Vite + TypeScript，**必须**采用 `electron-vite` 官方脚手架（`npm create electron-vite@latest`），不要规划手搓双 Vite 结构。
- TODO 中**必须**写明 dev 刷新要求：
  - `"dev": "electron-vite dev --watch"`（或在 `electron.vite.config.ts` 为 main/preload 开启 `build.watch`）
  - dev 态 main 使用 `process.env.ELECTRON_RENDERER_URL` 加载 renderer，禁止硬编码端口
  - 03 开发前先验收：renderer HMR、preload 改动能刷新、main 改动能重启 app
- TODO 中写明：`npm run dev`（开发）、`npm run build`（打包）、`npm run preview`（仅预览前端）。
- 系统能力、本地文件、环境变量密钥读取等只能放在主进程或安全 preload API 后面。

### vite-web-extension

- 使用 `JohnBra/vite-web-extension` 作为 Chrome Extension 起点。
- TODO 中写明需要哪些插件入口：popup、options、content script、background、side panel 或 new tab。
- 默认按 Chrome Manifest V3 规划，构建目标为 `dist_chrome`。
- 浏览器插件没有服务端后端，不得把私密 API Key 写进 `.env`、源码或构建包。
- 需要远程 API 时，默认规划为用户在 options/popup 中手动填写 API Key，并保存到 `chrome.storage.local`。
- background/service worker 只作为扩展后台脚本，不是服务端后端。

## 自检清单

- [ ] 已读取 `prd.md` 并提取工具形态。
- [ ] 已把工具形态映射到 Next.js、Electron 或 vite-web-extension。
- [ ] 已写出 Agent 启用矩阵。
- [ ] **已通过 subagent 工具并行 spawn 必选 Agent**（不是主会话模拟）。
- [ ] 已按项目形态 spawn 条件 Agent（或未启用并写明原因）。
- [ ] 已按 orchestrator 合并规则整合全部 subagent 输出。
- [ ] 已将几个词级别的 MVP 功能拆成子功能、流程、状态、数据和验收标准。
- [ ] 未默认规划后端；只在确有 API、安全或同步需求时规划。
- [ ] 若 `prd.md` 缺少 `【UI 设计风格】`，已基于 PRD、界面规格和工具形态选择设计系统方向。
- [ ] 已生成或更新设计系统。
- [ ] 已按需写回 `【API 接入方案（待确认）】`。
- [ ] 已创建或更新 `TODO.md`（含 §「已完成模块」、§「开发进度」、§「TODO 卸货记录」占位）。
- [ ] 已停止在计划阶段，没有写业务代码、安装依赖或初始化框架。
