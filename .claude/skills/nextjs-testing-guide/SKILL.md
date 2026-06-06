---
name: nextjs-testing-guide
description: |
  为 Next.js 项目编写或优化测试文档时触发。适用场景：
  - 写测试文档 / 更新测试文档
  - 给项目添加 data-testid 属性
  - 编写验证清单
  - 让 AI Agent 执行playwright-cli浏览器自动化测试
  - 验证 Next.js 项目功能是否正常

  当用户提到"测试"、"验证"、"data-testid"、"playwright"、"E2E"等关键词时触发。
compatibility: ["playwright-cli"]
---

# Next.js 测试文档编写规范

本 skill 用于生成通用的、可复用的 Next.js 测试文档和验证清单。

---

## 1. data-testid 规范

所有可交互元素必须添加 `data-testid` 属性，作为 AI Agent 和测试的"眼睛"。

### 命名规则

```
{页面简称}-{元素类型}-{动作}
```

### 命名示例

| 元素 | data-testid | 说明 |
|------|-------------|------|
| 登录按钮 | `login-btn-submit` | btn = button |
| 注册链接 | `login-link-register` | link = 链接 |
| 邮箱输入框 | `login-input-email` | input = 输入框 |
| 登出按钮 | `layout-btn-logout` | layout = 全局布局 |
| 反思按钮 | `home-btn-reflect` | home = 首页 |
| 导航菜单 | `layout-nav-discover` | nav = 导航 |

### 前端组件示例

```tsx
// ✅ 正确：为所有可交互元素添加 data-testid
<button data-testid="login-btn-submit" onClick={handleSubmit}>
  登录
</button>

<input
  data-testid="login-input-email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// ❌ 错误：只有视觉样式，没有 testid
<button className="submit-btn" onClick={handleSubmit}>
  登录
</button>
```

### 强制要求

- 所有 `<button>`、`<a>`、`<input>`、`<select>` 必须有 data-testid
- 对话框、模态框、折叠面板等交互组件也必须有
- testid 在整个项目中必须唯一

---

## 2. 验证清单模板

### 使用说明

1. 复制模板到项目根目录 `TESTING_CHECKLIST.md`
2. 根据项目实际功能修改清单内容
3. 让 AI Agent 按清单执行，人只做 review

### 验证清单格式

```markdown
# [项目名称] 验证清单

最后更新：YYYY-MM-DD
测试人员：___
AI Agent：___

---

## 环境信息

| 项目 | 值 |
|------|---|
| 服务地址 | http://localhost:{项目运行的端口号} |
| 测试工具 | playwright-cli |
| 登录账号 | admin@mirrorbook.com / admin123 |

### 设置 Admin API Key（如需要）

Admin 页面需要设置 Admin API Key（在浏览器 DevTools Console 执行）：

```javascript
localStorage.setItem('adminApiKey', 'your-admin-api-key')
```

---

## 功能验证

### 1. 认证模块

| 功能 | 验证方法 | 预期结果 | 状态 | 备注 |
|------|---------|---------|------|------|
| 登录成功 | 输入正确账号密码 → 点击登录 | 跳转首页，显示用户信息 | ⬜ | |
| 登录失败 | 输入错误密码 → 点击登录 | 显示错误提示 | ⬜ | |
| 登出 | 点击 Logout 按钮 | 跳转登录页，清除会话 | ⬜ | |

### 2. 核心业务（按项目填写）

| 功能 | 验证方法 | 预期结果 | 状态 | 备注 |
|------|---------|---------|------|------|
| [功能A] | [操作步骤] | [预期结果] | ⬜ | |
| [功能B] | [操作步骤] | [预期结果] | ⬜ | |

---

## AI Agent 测试 Prompt

将以下模板发送给 AI Agent：

```markdown
## 测试任务

请使用 playwright-cli 对 [项目名称] 进行自动化验证。

### 环境
- 服务地址：http://localhost:{端口号}
- 登录账号：admin@mirrorbook.com / admin123

### 待测试功能（使用 data-testid 定位元素）

1. **登录功能**
   - 命令：
     ```
     playwright-cli open http://localhost:{端口号}/login --persistent
     playwright-cli fill "data-testid=login-input-email" "账号邮箱"
     playwright-cli fill "data-testid=login-input-password" "密码"
     playwright-cli click "data-testid=login-btn-submit"
     playwright-cli screenshot --filename=test-results/login-success.png
     ```
   - 预期：跳转首页，显示用户信息和 Admin 链接

2. **[功能B]**
   - 命令：
     ```
     playwright-cli goto http://localhost:{端口号}/[路径]
     playwright-cli click "data-testid=[testid]"
     playwright-cli screenshot --filename=test-results/[功能名].png
     ```
   - 预期：[描述预期结果]

### 要求

1. 每完成一项，在验证清单对应行的"状态"列打 ✅
2. 如果失败，记录错误信息到"备注"列
3. 截图保存到 `test-results/` 目录，命名格式：`{功能名}-{timestamp}.png`
4. 返回测试报告
```

---

## 3. AI Agent 测试执行流程

### Step 1: 准备工作

```bash
# 1. 确保服务运行中
npm run dev

# 2. 全局安装 playwright-cli（如果未安装）
npm install -g playwright-cli

# 3. 创建截图目录
mkdir -p test-results
```

### Step 2: AI Agent 执行测试

**关键：保持会话状态**

```bash
# ✅ 正确：使用 --persistent 保持登录状态
playwright-cli open http://localhost:{端口号}/login --persistent
playwright-cli fill "data-testid=login-input-email" "账号"
playwright-cli fill "data-testid=login-input-password" "密码"
playwright-cli click "data-testid=login-btn-submit"

# 然后用 goto 在同一会话内导航（保持登录状态）
playwright-cli goto http://localhost:{端口号}/discover
playwright-cli click "data-testid=discover-btn-random"

# ❌ 错误：使用 open 跳转会创建新会话，丢失登录 Cookie
playwright-cli open http://localhost:{端口号}/login
playwright-cli open http://localhost:{端口号}/discover  # 会话丢失！
```

### Step 3: 人工 Review

1. 检查 Agent 返回的截图
2. 核对验证清单状态
3. 对有问题的项进行复查
4. 签名确认或打回重测

---

## 4. 常用 playwright-cli 命令

| 命令 | 作用 |
|------|------|
| `playwright-cli open <url> --persistent` | 打开页面（持久化会话，保持登录状态） |
| `playwright-cli goto <url>` | 导航到页面（在当前会话内跳转，保持登录状态） |
| `playwright-cli click "data-testid=<id>"` | 点击元素（**必须加引号**） |
| `playwright-cli fill "data-testid=<id>" <文本>` | 填写表单（**必须加引号**） |
| `playwright-cli screenshot --filename=path.png` | 截图保存到指定路径 |
| `playwright-cli snapshot` | 查看页面所有元素（含 data-testid） |
| `playwright-cli close` | 关闭当前浏览器 |
| `playwright-cli close-all` | 关闭所有浏览器 |

### data-testid 定位格式

```bash
# ✅ 正确：使用 "data-testid=xxx" 格式（带引号）
playwright-cli click "data-testid=login-btn-submit"
playwright-cli fill "data-testid=login-input-email" "test@example.com"

# ❌ 错误：直接使用 testid 值（不带引号）
playwright-cli click login-btn-submit
playwright-cli fill login-input-email "test@example.com"
```

### 会话保持技巧

```bash
# 1. 登录时使用 --persistent
playwright-cli open http://localhost:4000/login --persistent
playwright-cli fill "data-testid=login-input-email" "admin@example.com"
playwright-cli fill "data-testid=login-input-password" "password"
playwright-cli click "data-testid=login-btn-submit"

# 2. 后续页面使用 goto（保持 Cookie）
playwright-cli goto http://localhost:4000/discover
playwright-cli goto http://localhost:4000/history
playwright-cli goto http://localhost:4000/admin/dashboard

# 3. 如果需要新会话（登出后重新登录），使用 open 覆盖
playwright-cli open http://localhost:4000/login --persistent
```

---

## 5. Review 指南

### AI Agent 测试结果检查项

| 检查点 | 通过标准 | 失败处理 |
|--------|---------|---------|
| 截图完整性 | 每项功能都有对应截图 | 要求 Agent 重测并截图 |
| 预期结果对比 | 截图内容与"预期结果"一致 | 标记为失败，分析原因 |
| 错误处理 | 失败项有错误日志 | 根据日志修复问题 |

### 常见失败模式

| 现象 | 可能原因 | 解决方式 |
|------|---------|---------|
| 元素找不到 | 使用了错误的定位语法 | 使用 `"data-testid=xxx"` 格式 |
| 页面加载超时 | 服务未启动 / 网络问题 | 检查服务状态 |
| 登录状态丢失 | 使用 `open` 而非 `goto` 跳转 | 使用 `--persistent` + `goto` |
| 断言失败 | 功能 bug 或预期错误 | 记录 bug 或修正预期 |

---

## 6. 快速开始模板

新建项目时，复制以下结构：

```
项目/
├── TESTING_CHECKLIST.md    # 验证清单（本项目专属，根目录）
├── test-results/           # 测试截图存放（根目录）
│   └── .gitkeep
└── .env.local              # 测试账号（不提交）
```

`.env.local` 示例：
```bash
TEST_EMAIL=test@example.com
TEST_PASSWORD=test123
```

**注意：`test-results/` 放项目根目录，不要放在 `docs/` 下。**

---

## 7. 为任何项目快速生成指南

当需要为现有项目生成测试指南时：

1. **识别核心页面和功能**
   - 用户认证相关
   - CRUD 操作
   - 数据展示/表单提交

2. **列出所有可交互元素**，并为它们分配合适的 data-testid

3. **生成验证清单**，表格格式

4. **输出 AI Agent Prompt 模板**（包含正确的命令格式）

5. **提供 Review 检查项**

---

## 示例输出

为一个登录页面生成的测试指南：

```markdown
# 登录功能验证清单

## data-testid 参考

| 元素 | data-testid |
|------|-------------|
| 邮箱输入框 | login-input-email |
| 密码输入框 | login-input-password |
| 登录按钮 | login-btn-submit |
| 注册链接 | login-link-register |
| 错误提示 | login-error-message |

## 验证清单

| 功能 | 验证方法 | 预期结果 |
|------|---------|---------|
| 正常登录 | 填写正确账号密码 → login-btn-submit | 跳转 /dashboard |
| 错误密码 | 填写错误密码 → login-btn-submit | 显示错误提示 |
| 空表单提交 | 直接点击登录 | 显示验证错误 |
| 注册跳转 | 点击 login-link-register | 跳转 /register |

## AI Agent Prompt

使用 playwright-cli 测试登录功能：
1. playwright-cli open http://localhost:3000/login --persistent
2. playwright-cli fill "data-testid=login-input-email" "test@example.com"
3. playwright-cli fill "data-testid=login-input-password" "password123"
4. playwright-cli click "data-testid=login-btn-submit"
5. playwright-cli screenshot --filename=test-results/login-success.png
```