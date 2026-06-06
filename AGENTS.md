# 项目协作说明

- 使用中文回复我
- 后续任务以仓库根目录 `TODO.md` 为准。

## 文档依据（重要）

- **`TODO.md`**：后续开发计划与开发合同，**继续开发以此为准**。
- **`prd/`**：基于当前代码实现重建的「已实现产品文档」，描述项目现状；入口 `prd/README.md`。
- **`prd.original.md`**：最初的粗粒度总目标，仅供人类回顾，**Agent 不得作为开发依据读取**。
- **`README.md`**：项目使用与运行说明。
- **`design-system/Vibe Closet/MASTER.md`**：设计系统来源。

开始工作前请先读取：
- `.claude/rules/coach.md`
- `.claude/rules/todo-writeback.md`
- `.claude/rules/todo-prd-archive.md`（TODO 过长、已完成模块归档到 `prd/` 时）
- `TODO.md`

执行时请优先完成 `TODO.md` 中未勾选的任务；如果实际代码、`prd/` 与 `TODO.md` 冲突，以当前代码事实和 `prd/` 已实现文档为依据，并把新的差距或后续任务更新回 `TODO.md`。已有代码库的日常迭代用 `project-iterate`，不要重跑首版 `03-project-develop`。

**每轮开发结束前必须回写 `TODO.md`**（含未做完、部分完成、阻塞项），规范见 `.claude/rules/todo-writeback.md`。禁止只改代码、不更新 TODO。

**TODO 过长时**：将已稳定完成且已验证的功能块卸货到对应 `prd/` 文档，再精简 TODO，规范见 `.claude/rules/todo-prd-archive.md`。

## 工程约定

- 框架：Next.js 14 App Router + TypeScript + Tailwind；数据全本地 `localStorage`；唯一服务端为 `app/api/style` AI 代理。
- 页面/组件**禁止**直接读写 `localStorage`，必走 `lib/storage → lib/closet → lib/hooks` 链。
- AI Key 只在服务端 `process.env.SILICONFLOW_API_KEY` 读取，禁止 `NEXT_PUBLIC_` 前缀，禁止进前端 bundle。

写代码时请遵守：
- 涉及 API 调用、IPC 调用、第三方服务请求或降级逻辑时，必须增加必要的调用日志，至少覆盖调用入口、关键参数摘要、成功/失败结果和错误原因，方便本地调试与问题定位。
- 日志不得输出 API Key、Token、用户隐私原文等敏感信息；需要记录时只保留脱敏后的摘要。
- 复杂逻辑和关键代码请补充中文注释，注释应解释“为什么这样做”和调试观察点，避免只重复代码表面含义。
