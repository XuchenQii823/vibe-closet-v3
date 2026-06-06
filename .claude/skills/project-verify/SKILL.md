---
name: project-verify
description: 按 TODO.md 验收标准执行验证、回写打勾与验证记录。默认在 project-iterate 后按指定范围增量验证；用户要求时可验全部 §2，或在 update-prd 前核对。Next.js 动态验证遵循 nextjs-testing-guide；Electron / 插件见 references/。
compatibility: ["playwright-cli"]
---

# Project Verify：TODO 验收 → 执行 → 回写

本 Skill **只负责执行与回写**：读取 `TODO.md` §2 验收标准，跑静态/动态验证，把结果写回 checkbox 与「验证记录」。

| 环节 | 负责方 |
| --- | --- |
| 写验收标准 | `qa-acceptance-planner` → TODO §2 |
| 实现 + testid | `project-iterate`（日常）/ `03-project-develop`（首版脚手架） |
| **执行验收 + 打勾** | **本 Skill** |
| 重建 prd/ | `update-prd` |

**默认**：`project-iterate` 完成后按需唤起，验证**本轮相关**的 §2.x（或用户指定范围）。

**全量 §2**：用户明确要求「全部验收/打勾」、`update-prd` 前核对，或里程碑需要完整回归时。

## 何时使用 / 暂停

**使用**：
- `project-iterate` 某轮完成后，验证本轮改动的 §2.x
- 用户要求验收、打勾、跑 lint/build/playwright
- `update-prd` 前需确认全部 §2 已有证据
- 用户指定范围，例如「只验 TODO §2.3」

**暂停**：无 `TODO.md` → 先 `02-project-prepare`；无可运行代码 → 先 `project-iterate`（日常）或 `03-project-develop`（尚未有首版交付时）。

## 框架加载（只读一份）

| 主框架 | 动态验证读什么 |
| --- | --- |
| **Next.js** | 增量：读 `nextjs-testing-guide` 中与本轮 §2 相关的章节；全量 §2：完整读取 `.claude/skills/nextjs-testing-guide/SKILL.md` |
| Electron | `references/electron.md`（增量时可只读相关段落） |
| vite-web-extension | `references/vite-web-extension.md`（增量时可只读相关段落） |

## 打勾规则

| 结果 | 写法 | 条件 |
| --- | --- | --- |
| 通过 | `[x]` | 命令成功 / 截图 / playwright 输出 |
| 失败 | `[ ]` | 验证记录写原因 |
| 跳过 | `[ ]` + `⚠️` | 无 Key、需 GUI 等 |
| 阻塞 | `[ ]` | build 或 dev 起不来 |

禁止无证据把 §2 全部打勾。

## 执行流程

### 1. 读合同

读 `TODO.md`：主框架、§2 验收标准、§8 验证、§3 入口。读 `package.json` scripts。

确认**本轮验证范围**：默认只处理与本轮改动相关的 §2.x；用户要求全量时再扫描全部 §2。

无 `TESTING_CHECKLIST.md` 时，从本轮范围的 §2 + §8 生成（表格格式见 `nextjs-testing-guide` §2）；全量验证时覆盖全部 §2。

### 2. 静态验证（必做）

按 scripts 依次跑 `lint` → 类型检查 → `build`（有则跑）。失败记入验证记录，UI 项不得标通过。

### 3. 动态验证

1. 装依赖、建 `test-results/`、启动 dev（或按框架 reference 构建/启动）。
2. 记录实际 URL / 端口 / 扩展输出目录。
3. **Next.js**：严格按 `nextjs-testing-guide` 执行 playwright-cli；缺 testid 可补最小 testid 或 snapshot  fragile 定位。
4. **Electron / 插件**：按对应 reference。
5. **API Key**：有 Key 跑真实 API 项；无 Key 只验校验/空态/错误态/localStorage，远程生成项标跳过。

逐条对照 §2 验收标准，更新 `TESTING_CHECKLIST.md` 状态。

### 4. 写回 TODO

- §2 验收标准、§8 验证：仅有证据项 `[x]`
- **失败 / 跳过 / 阻塞**：保持 `[ ]`，在条目下或验证记录写 `❌` / `⚠️` 与原因（见 `.claude/rules/todo-writeback.md`）
- 默认不改 §3/§4，除非验证中明确覆盖
- 末尾追加/更新 **验证记录**（模板见下）
- 验证结束后：失败项须在 TODO 中可见，方便下轮 `project-iterate` 接着做

### 5. 汇报

通过/失败/跳过数量、阻塞项、`TESTING_CHECKLIST.md` 与 `test-results/` 路径。有阻塞时提醒先修复再 update-prd。

## 验证记录模板

```markdown
---

## 验证记录

最后验证：YYYY-MM-DD
主框架：<...>

### 静态验证
| 命令 | 结果 | 备注 |
| npm run lint | ✅/❌ | |
| npm run build | ✅/❌ | |

### §2 摘要
| 功能 | 通过 | 失败 | 跳过 |

### 失败 / 跳过
- [ ] <项> — ❌/⚠️ 原因

### 证据
- `test-results/`、`TESTING_CHECKLIST.md`
```

## 按需复用 Specialist Agents

本 Skill **执行**验收，**不写**验收标准。若 §2 缺失或不可执行：

| 情况 | 动作 |
| --- | --- |
| 验收项空泛（如「功能正常」） | spawn `qa-acceptance-planner` 补标准 → 写回 TODO §2 → 再继续本 Skill |
| 某功能无 §2 条目 | spawn `qa-acceptance-planner` 或请用户确认后补写 |
| 验证中发现规格与实现不一致 | 记录验证记录；规格问题交 `project-iterate` 或 `03-project-develop` 更新 TODO，不自行改产品范围 |

`qa-acceptance-planner` 是项目级 agent，不限于 `02-project-prepare` 调用。

## 其它 Skill

- **`project-iterate`**：日常开发；完成后可按需带范围唤起本 Skill。
- **`js-debug`**：失败项深入排查；修完后重跑本 Skill 对应条目。
- **`nextjs-testing-guide`**：Next.js 怎么测；**本 Skill**：测什么、怎么打勾。增量验证时只读相关章节。

## 自检

- [ ] 已确认本轮验证范围（默认增量；全量时覆盖 §2 全部）
- [ ] 已读范围内验收标准；Next.js 已读 `nextjs-testing-guide` 相关章节；其它框架已读对应 reference
- [ ] 静态验证已跑并记录
- [ ] 范围内 §2 已逐条执行或标注跳过，无无证据打勾
- [ ] 失败/跳过项已在 TODO 留痕（非仅写在聊天里）
- [ ] 已写回 TODO 与验证记录
