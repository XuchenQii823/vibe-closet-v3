# Vibe Closet — Design System MASTER

> 设计取向依据：本设计系统直接来自 `vibe_closet_project_brief_prd.md`（产品定位 Retro-Vacation / Poolsuite）、`DESIGN.md`（已成熟的 Retro-Brutalism token）与 `vibe_closet_your_digital_wardrobe.html`（已实现的完整 UI 原型）。
> 目标用户林小曼（24 岁视觉设计助理）把「管理衣橱」当成创意项目而非家务，因此界面气质偏「高概念、可把玩、有硬件触感」：黑色 OS 标题栏 + 硬投影 + 等宽字体，在移动端高频、轻松、低严肃度的使用场景下，强调「点按有物理反馈、信息密度高但不杂」。
> 当 `DESIGN.md` / 原型与 PRD 冲突时，以 **PRD 的产品表达为准**，本文件只补齐工程化落地细节。

---

## 1. 品牌气质

**Retro-Brutalism × Poolsuite**：80–90 年代消费电子的「硬件 UI」结构感，叠加海岸度假的明亮粉彩。把数字界面当成实体设备：每个卡片是一个带标题栏的「窗口」，按钮可被「按下去」。lo-fi 的复古趣味 + hi-fi 的精致收口。

---

## 2. 颜色 Token（页面底色以 #F5E7DC 为准）

| 角色 | 值 | 用途 |
|---|---|---|
| `--page-bg`（页面底） | `#F5E7DC` | 全局背景，温暖纸感米色（**覆盖 DESIGN.md 的 #fff8f4**） |
| `--surface-card` | `#FFFFFF` | 卡片内容区，纯白以在米底上「跳出」 |
| `--ink`（结构墨黑） | `#1A1A1A` | 所有边框、硬投影、标题栏底、高优先文字 |
| `--mint`（动作） | `#A8DAD0` | 主按钮、激活态、主 CTA |
| `--blush`（高亮） | `#F2C9CB` | 次级强调、结果标题卡、tag |
| `--on-mint / --on-ink` | `#1A1A1A / #FFFFFF` | 对应前景文字 |
| `--error / --on-error` | `#BA1A1A / #FFFFFF` | 错误态 |
| `--error-container` | `#FFDAD6` | 错误卡底色 |
| `--surface-variant` | `#EEE0D5` | 图片加载占位块 |

> 其余 Material 风格的扩展色阶见 `DESIGN.md`，工程上仅需上表核心 token 即可覆盖 MVP。

---

## 3. 字体

| Token | 字体 | 规格 | 用途 |
|---|---|---|---|
| headline | **Space Mono** 700 | 大写、紧字距 `tracking-tighter` | 标题、标题栏、品牌名 |
| label / meta | **Space Mono** | 大写、`tracking-widest` | 标签、序号 `L-042`、元数据、按钮文字 |
| body | **DM Sans** 400 | 常规 | 正文、搭配理由、描述 |

Mono 模拟终端/小票打印质感，DM Sans 保证长文可读。

---

## 4. 形状与圆角

- **统一 0px 直角**（以原型为准，覆盖 DESIGN.md 的 4px）。
- 唯一例外：选择圆点 / favorite pip / 状态灯用 `rounded-full`。
- 选择指示器、徽标保持正方或正圆，强化「控制面板」观感。

---

## 5. 边框与硬投影（Hard Offset Shadow）

拒绝模糊环境阴影，用「物理位移」表达层级（像 90 年代音响的按钮）。

| 分级 | 边框 | 投影 | 用于 |
|---|---|---|---|
| 主 CTA（splash/关键按钮） | `2px solid #1A1A1A` | `6px 6px 0 #1A1A1A` | Splash 进入、NEXT |
| 卡片 / 主按钮 | `2px solid #1A1A1A` | `4px 4px 0 #1A1A1A` | 单品卡、look 卡、Save/Regen |
| 小元素（chip/小按钮） | `1.5–2px solid #1A1A1A` | `2px 2px 0 #1A1A1A` | 筛选 chip、tag |
| 输入内层 | `1.5px solid #1A1A1A` | 焦点时升 `2px` | 表单字段 |

**按下态**：统一「下沉」——`translate(2px,2px)`（小）到 `(6px,6px)`（主 CTA），同时投影归零（`.btn-press` / `.hardware-btn`）。

---

## 6. 签名组件：标题栏窗口

每个卡片/窗口顶部一条 **黑底（#1A1A1A）+ 薄荷或白色 Space Mono 大写文字** 的标题栏，可选 3 个窗口控制小方块或 close 图标。这是品牌识别核心组件（如 `SYSTEM.INIT`、`SKILL_01.EXE`、`L-042 // Midnight`）。

---

## 7. 组件规格

- **按钮**：直角、薄荷/粉填充、2px 黑边、硬投影、居中粗体 Space Mono、按下下沉。
- **卡片**：纯白底、2px 黑边、4px 硬投影、可选黑标题栏。
- **输入框**：米色底（etched 感）、1.5px 黑边、聚焦变白底 + 投影升级。
- **Chip / Tag**：小直角矩形、薄荷或粉填充、细黑边、无投影（从属于按钮）。
- **图标**：2px 线性图标，纯 `#1A1A1A`；装饰元素可用像素风。
- **纹理**：`scanline`（4px 扫描线）用于终端/加载态；`radial-gradient` 圆点网格用于 Style 背景与 Looks 拼贴底；图片统一灰度 + `mix-blend-multiply` 融入米底。

---

## 8. 布局与间距

- **基线网格 4px**；内边距偏大（16/24px）以对比纤细黑边。
- **移动优先**：4 列流体网格、16px 两侧边距；桌面 12 列、max 1280px、16px gutter。
- **固定栏**：顶部 `TopAppBar` 56px、底部 `BottomNavBar` 80px（`/add` 页除外）；正文需 `pt-14 + pb-20` 避让。
- 偏好卡片竖向堆叠 + 集合区横向滚动「卡带条」。

---

## 9. 关键界面状态规范

| 状态 | 表现 |
|---|---|
| 默认 | 完整内容 + 可交互 |
| **空态** | 虚线边框卡 + 图标 + 引导文案 + 主按钮（衣橱空 / looks 空 / 单品不足三处必做） |
| **加载态** | 终端风：黑标题栏 `GENERATING...` / `Processing...` + 状态灯脉冲 + scanline，禁用相关按钮 |
| 成功态 | 新数据置顶/高亮一次 |
| **错误态** | `error-container` 底卡 + `on-error` 文案 + RETRY/重试按钮（AI 失败、未配置 Key、存储写满） |

---

## 10. 排版变体规范

- **Scrapbook**：拼贴片随机旋转 **-3°~+5°**（原型实测，PRD 写 -3~3，放宽并在此记录）、不同 z-index 叠放、每片独立 4px 硬投影。用于 Looks 卡预览与 Result 的「心情板」模式。
- **Optimized Stack**：卡片可控偏移叠放，关键视觉区不被遮挡，信息更清晰。作为 Result 默认排版。
- Result 页通过 toggle 在 Stack / Scrapbook 间切换。

---

## 11. 待 03 定稿确认（来自原型 vs PRD 差异）

1. **Closet 布局**：双排横向滚动卡带（PRD 目标）vs 竖向网格（原型现状）——MVP 取双排横滚，网格作桌面 fallback。
2. **Result 排版**：本系统已规定 Stack + Scrapbook 可切换，原型为规整网格，需补 Stack/Scrapbook。
3. **Accessories 类别**：原型筛选缺该类，需补齐（PRD 五类齐全）。
