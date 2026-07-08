---
name: js-debug
description: |
  为 JavaScript/Node.js 项目提供系统性 debug 能力。当用户明确要求 debug 或遇到问题时触发：
  - 用户说"debug"、"bug"、"出问题了"、"帮我看看"、"不对"、"报错"
  - 用户说"为什么不行"、"页面空白"、"数据不对"、"登录失败"
  - 用户说"帮我检查"、"帮我测试"、"帮我验证"

  不要在以下场景触发：
  - 用户只是在问代码是做什么的（没有出问题）
  - 用户在写新代码而不是调试
  - 用户要求优化性能但没有报错

  本 skill 强调 AI Agent 主动寻找报错信息的能力：
  - 在可疑代码中植入 console.log，通过 playwright-cli 读取
  - 主动检查 network 请求情况
  - 编写独立测试脚本验证各模块正常
  - 使用 ASCII 可视化呈现 bug 位置和排查过程
  - 与用户进行意图对齐，确认 bug 本质
  - 使用 Explore SubAgent 快速探索问题区域
  - 使用 Plan SubAgent 研究解决方案再给出
compatibility: ["playwright-cli"]
---

# JavaScript/Node.js Debug 流程

## 核心思路

AI Agent Debug 的关键是**主动寻找错误**，而不只是被动等报错。

```
1. 主动植入探针：在可疑代码位置加 console.log
2. 主动检查：用 playwright-cli 读取 console、network 状态
3. 独立验证：写测试脚本验证各模块是否正常
4. 逐步定位：控制变量，一次只改一个因素
```

---

## Phase 0: 意图对齐（非常重要！）

在开始 debug 前，先与用户对齐问题理解，避免方向错误。

**用户描述的问题：** $ARGUMENTS

### 0.1 用户描述分析

用户描述往往不准确，需要主动追问确认：

```
用户说："登录失败了"
  ↓ 需要确认
[意图对齐]
  ├─ 哪个登录？页面登录？API 登录？手机号登录？微信登录？
  ├─ "失败"具体表现是什么？空白？报错？卡住？数据错？
  ├─ 失败的频率？必现？还是偶发？
  └─ 有没有截图？错误信息是什么？
```

### 0.2 ASCII 可视化对齐

用 ASCII 图与用户确认理解是否正确：

```
[用户描述的问题]
┌─────────────────────────────────────┐
│  用户点击"登录"按钮                   │
│         ↓                           │
│    [登录按钮] ──click──→ ???         │
│                            ↓        │
│                       [空白/报错/卡住] │
└─────────────────────────────────────┘

[可能的 5 种情况]
  A: 按钮点击无反应（JS 事件未绑定）
  B: 请求发出但 pending（网络/后端问题）
  C: 请求返回错误（账号密码错/账号被封）
  D: 请求成功但页面未更新（状态更新逻辑问题）
  E: 页面直接崩溃（JS 异常）

请确认：您的实际情况是哪种？（A/B/C/D/E 或描述）
```

### 0.3 记录对齐结果

```
=== 意图对齐结果 ===
问题描述: $ARGUMENTS
问题类型: _______________
触发条件: _______________
预期行为: _______________
实际行为: _______________
关键证据: _______________  (截图/错误信息/日志)
```

---

## Phase 1: 主动检查（不等报错）

### 1.1 使用 Playwright CLI 主动扫描

```bash
# 打开页面，检查 console 有没有隐藏错误
playwright-cli open http://localhost:4000 --persistent

# 主动读取 console（不操作，看有没有积压的错误）
playwright-cli console

# 查看 network 请求情况
playwright-cli network

# 截图记录当前状态
playwright-cli screenshot --filename=test-results/initial-state.png
```

### 1.2 检查服务是否正常

```bash
# 确认服务响应
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000

# 主动测试关键 API
curl -s http://localhost:4000/api/health | jq

# 检查端口占用
lsof -i :4000
```

---

## Phase 2: 探索问题区域（Explore SubAgent）

使用 Explore SubAgent 进行快速探索，定位问题范围：

```bash
# 启动 Explore SubAgent 探索
探索任务: "页面空白的问题，用户在 /login 页面点击登录后无反应"
探索范围: 
  - 前端: pages/login.tsx, components/LoginForm.tsx
  - 后端: pages/api/auth/login.ts
  - 状态: zustand store auth.ts

探索目标:
  1. 找到登录按钮的点击事件处理
  2. 找到 API 请求的发出位置
  3. 找到后端接口的处理逻辑
  4. 找到可能导致空白的原因
```

### 探索结果可视化

```
[Explore SubAgent 探索结果]
┌─────────────────────────────────────────────────────────┐
│ 问题定位图                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [LoginForm.tsx]                                        │
│       │                                                 │
│       ├─ onClick={handleLogin} ──→ handleLogin()         │
│       │                              │                 │
│       │                              ↓                 │
│       │                         [调用 API]             │
│       │                              │                 │
│       │                              ↓                 │
│       └─ {loading ? <Spinner/> : <Button/>}            │
│                                                         │
│  [!] 发现可疑点:                                         │
│     - handleLogin 是 async 但没有 .catch()               │
│     - 如果 API 抛异常，状态不会变，页面就"卡住"了          │
│                                                         │
│  [!] 网络层检查:                                         │
│     - API /api/auth/login 存在                           │
│     - 但返回 401 而不是 200                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

[推测的 bug 根因]
  handleLogin 没有 catch，所以 API 的 401 异常没有被处理
  → loading 状态一直是 true
  → 页面显示 Spinner 而不是按钮
  → 看起来像"空白"或"卡住"
```

---

## Phase 3: 研究解决方案（Plan SubAgent）

在确定问题后，使用 Plan SubAgent 研究最佳解决方案：

```bash
# 启动 Plan SubAgent 研究
研究任务: "修复 LoginForm.tsx 中 handleLogin 未 catch 异常的问题"
背景:
  - handleLogin 是 async 函数
  - API 返回 401 时会抛出异常
  - 但异常没有被 catch，导致 loading 状态无法恢复

预期:
  - 方案应该处理 API 异常
  - 应该有用户友好的错误提示
  - 不应该破坏其他正常功能

约束:
  - 不能改动太多地方（怕引入新 bug）
  - 优先使用现有的错误处理机制
```

### Plan SubAgent 研究结果

```
[Plan SubAgent 研究结果]
┌─────────────────────────────────────────────────────────┐
│ 解决方案评估                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [方案 A] 加 try-catch                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ async function handleLogin() {                   │  │
│  │   try {                                          │  │
│  │     setLoading(true);                            │  │
│  │     const result = await loginAPI();              │  │
│  │     setUser(result.user);                        │  │
│  │   } catch (error) {                              │  │
│  │     setError(error.message);        ← 新增        │  │
│  │     setLoading(false);              ← 新增        │  │
│  │   }                                              │  │
│  │ }                                                │  │
│  └──────────────────────────────────────────────────┘  │
│  优点: 改动小，立即生效                                  │
│  缺点: error 状态需要配套 UI 显示                        │
│                                                         │
│  [方案 B] 使用 React Query / SWR                         │
│  - 优点: 自动处理 loading/error 状态                      │
│  - 缺点: 改动较大，需要引入新依赖                         │
│                                                         │
│  [推荐] 先用方案 A，后续考虑引入 React Query             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 4: 定位问题区域

### 4.1 主动植入 console.log

在可疑代码中植入探针：

```typescript
// 在入口点加 log
console.log('[DEBUG] 请求进入:', { path, method, body })

// 在数据处理关键节点加 log
console.log('[DEBUG] 处理数据:', { stage: 'transform', data: processedData })

// 在可能出错的地方加 log
console.log('[DEBUG] 条件判断:', { condition: shouldProceed, context })

// 使用结构化 log 便于追踪
console.log(JSON.stringify({
  stage: 'handler',
  timestamp: new Date().toISOString(),
  userId: user?.id,
  data: { /* 可疑变量 */ }
}))
```

### 4.2 执行操作后读取 log

```bash
# 清除之前积压的 log
playwright-cli eval "console.clear()"

# 执行用户操作（登录、点击等）
playwright-cli fill "data-testid=login-input-email" "admin@test.com"
playwright-cli click "data-testid=login-btn-submit"

# 等待一下让 log 生成
sleep 1

# 读取 console 探针
playwright-cli console
```

---

## Phase 5: 检查 Network

### 5.1 使用 playwright-cli network

```bash
# 检查所有请求的状态
playwright-cli network

# 常见的 network 问题：
# - 请求 pending 没有返回
# - 请求失败（红色）
# - 请求成功但返回错误数据
```

### 5.2 手动检查 API

```bash
# 测试 API 是否正常响应
curl -s -w "\n%{http_code}" http://localhost:4000/api/xxx | jq

# 测试带参数的 API
curl -s -X POST http://localhost:4000/api/xxx \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}' | jq

# 检查 API 响应时间
curl -s -w "%{time_total}" -o /dev/null http://localhost:4000/api/xxx
```

---

## Phase 6: 独立功能测试脚本

写一个独立的测试脚本，验证各模块是否正常：

```python
# tests/debug_check.py
import requests
import json

BASE = "http://localhost:4000"

def test_all():
    results = []

    # 测试 1: 服务是否运行
    try:
        r = requests.get(f"{BASE}/", timeout=5)
        results.append(("服务响应", r.status_code == 200, r.status_code))
    except Exception as e:
        results.append(("服务响应", False, str(e)))

    # 测试 2: 登录 API
    try:
        r = requests.post(f"{BASE}/api/auth/login", json={
            "email": "admin@test.com",
            "password": "password"
        }, timeout=5)
        results.append(("登录 API", r.status_code == 200, r.status_code))
    except Exception as e:
        results.append(("登录 API", False, str(e)))

    # 测试 3: 数据 API
    try:
        r = requests.get(f"{BASE}/api/books", timeout=5)
        data = r.json()
        results.append(("书籍 API", 'books' in data or isinstance(data, list), len(data) if isinstance(data, list) else 'no list'))
    except Exception as e:
        results.append(("书籍 API", False, str(e)))

    # 打印结果
    print("\n=== Debug 检查结果 ===")
    for name, passed, detail in results:
        status = "✓" if passed else "✗"
        print(f"{status} {name}: {detail}")

    return all(r[1] for r in results)

if __name__ == "__main__":
    test_all()
```

运行：
```bash
python3 tests/debug_check.py
```

---

## 问题驱动的 Debug 流程

### 症状：页面空白/加载不出

```
[症状分析图]
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   页面空白可能的原因:                                    │
│                                                         │
│   1. [JS 异常]     → console.error 有报错               │
│   2. [网络请求]    → network pending 或 failed           │
│   3. [组件渲染]    → React 组件未正确导出/挂载           │
│   4. [数据状态]    → 数据未正确更新到 state               │
│   5. [样式问题]    → 内容被隐藏或容器高度为 0            │
│                                                         │
│   排查顺序:                                             │
│   [1] playwright-cli console  ← 优先看 JS 异常          │
│   [2] playwright-cli network  ← 其次看网络              │
│   [3] playwright-cli snapshot ← 看页面元素是否渲染       │
│   [4] 检查代码实现    ← 最后看代码                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. 先主动读取 console：`playwright-cli console`
2. 检查有没有 console.error
3. 看 network 有没有 failed 请求
4. 如果 React，检查组件是否正确导出

### 症状：操作后数据不变

```
[症状分析图]
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   数据不变可能的原因:                                    │
│                                                         │
│   [用户操作] ──→ [触发 handler] ──→ [调用 API]          │
│                              │                          │
│                              ↓                          │
│                       [API 返回数据]                    │
│                              │                          │
│                              ↓                          │
│                    ┌─────────┴─────────┐                │
│                    ↓                   ↓                 │
│               [数据更新成功]     [数据更新失败]           │
│                    ↓                   ↓                 │
│               [UI 刷新]          [UI 无变化]             │
│                                                         │
│   排查顺序:                                             │
│   [1] network 检查请求是否发出                           │
│   [2] 检查 API 返回数据格式                             │
│   [3] 检查 state 更新逻辑                               │
│   [4] 检查组件是否正确接收 props                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. 在操作触发的地方加 log
2. 用 playwright-cli network 检查请求发出没有
3. 检查 API 返回数据是否正确
4. 检查前端是否正确处理响应

### 症状：服务启动失败

```
[症状分析图]
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   启动失败排查:                                          │
│                                                         │
│   [1] 端口检查                                           │
│       lsof -i :4000                                     │
│       → 端口被占用？换一个端口                           │
│                                                         │
│   [2] 环境检查                                           │
│       echo $NODE_ENV                                    │
│       → NODE_ENV=production 可能导致不同行为             │
│                                                         │
│   [3] 依赖检查                                           │
│       ls node_modules/                                  │
│       → node_modules 丢失？npm install                   │
│                                                         │
│   [4] 启动日志                                           │
│       npm run dev 2>&1 | tee start.log                  │
│       → 看完整报错信息                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. 检查端口是否被占用：`lsof -i :4000`
2. 检查环境变量：`echo $NODE_ENV`
3. 检查依赖是否安装：`ls node_modules/`
4. 看启动时的完整报错日志

---

## Debug 检查清单

```
┌─────────────────────────────────────────────────────────┐
│  Debug 检查清单                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [意图对齐]                                              │
│  □ 确认用户描述的问题类型                                 │
│  □ 用 ASCII 图与用户对齐预期/实际行为                     │
│  □ 记录对齐结果                                          │
│                                                         │
│  [主动检查 - 不等报错]                                   │
│  □ playwright-cli console 读取积压错误                   │
│  □ playwright-cli network 检查请求状态                   │
│  □ curl 测试关键 API 是否正常                            │
│                                                         │
│  [Explore 探索]                                         │
│  □ 使用 Explore SubAgent 快速定位问题区域                   │
│  □ 绘制问题定位 ASCII 图                                 │
│                                                         │
│  [Plan 研究]                                            │
│  □ 使用 Plan SubAgent 研究解决方案                          │
│  □ 评估方案优缺点，推荐方案                              │
│                                                         │
│  [定位问题]                                              │
│  □ 在可疑代码位置植入 console.log                       │
│  □ 执行操作，然后 playwright-cli console 读取探针         │
│  □ 用 playwright-cli network 检查请求流程                 │
│                                                         │
│  [验证修复]                                              │
│  □ 运行独立测试脚本确认各模块正常                        │
│  □ 执行完整操作流程验证问题解决                          │
│  □ 截图保存修复后状态                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## AI Agent 独特能力

这些是人类手动难以做到，但 AI Agent 可以的：

| 能力 | 用途 |
|------|------|
| 主动植入探针 | 在代码中加 console.log，然后用 playwright-cli 读取 |
| 并行检查 | 同时检查 console、network、API 状态 |
| 写测试脚本 | 快速写一个 Python/JS 脚本验证各模块 |
| 直接读文件 | 检查代码实现细节，找到可疑点 |
| Explore SubAgent | 快速探索问题区域，定位可疑点 |
| Plan SubAgent | 研究解决方案，评估方案优缺点 |
| `/context` | 查看加载的 memory、skills、MCP 工具 |

---

## 常用命令速查

```bash
# 意图对齐
# → 用 ASCII 图与用户确认问题理解

# 主动检查
playwright-cli console    # 读取 browser console
playwright-cli network    # 检查 network 请求
playwright-cli snapshot   # 查看页面元素

# 截图
playwright-cli screenshot --filename=test-results/debug.png

# API 测试
curl -s http://localhost:4000/api/xxx | jq
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/xxx

# 环境检查
lsof -i :4000
ps aux | grep node | grep -v grep

# 植入探针后读取
playwright-cli eval "console.clear()"
# ... 执行操作 ...
playwright-cli console

# Explore SubAgent 探索
探索任务: "描述问题"
探索范围: ["file1.tsx", "file2.ts"]
探索目标: ["目标1", "目标2"]

# Plan SubAgent 研究
研究任务: "描述问题"
背景: "相关背景"
预期: "预期结果"
约束: "约束条件"
```