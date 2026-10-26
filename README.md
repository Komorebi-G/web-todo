# Web Todo

Web 编程 W8：在 W7 数据驱动 V2.0 上完成事件委托重构，保留原简历布局、筛选与保存恢复。

## Run

无构建依赖。在本目录运行：

```sh
python3 -m http.server 8078
```

打开 http://localhost:8078/ 。存储按访问来源区分，验证保存与刷新时请一直使用同一个地址。

## Data flow

`todos` 保存完整任务数组，`currentFilter` 只决定当前显示哪些任务。

- `addTodo()`：展开生成新数组，新增项用 UUID 标识。
- `deleteTodo()`：`filter()` 排除目标 ID。
- `toggleTodo()`：`map()` 加对象展开，仅替换目标对象。
- `clearCompleted()`：`filter()` 保留未完成项，控制台可直接调用。
- `editTodo()`：只替换文字，保留 ID 和完成状态；取消或空白输入不修改任务。

各操作均按 `todos = 新数组 → save() → render()` 执行。`render()` 筛选视图、创建元素、挂载列表；任务文字用 `textContent`。

`save()` 将完整数组序列化到 `web-w07-todos`，初始化由 `load()` 恢复。过滤按钮不会删掉数据；刷新后视图回到“全部”。无法恢复的数据有提示，存储失败时页面会说明更改未保存。

## Event delegation

`render()` 使用 `createElement()` 创建任务，写入 `li.dataset.id` 与按钮的 `dataset.action`，不在任务循环内注册事件。`#todo-list` 只注册一次点击监听，先检查事件目标、`closest('li')` 返回值、容器归属与 ID，再分流：

- 删除：查找 `[data-action="delete"]`，调用 `deleteTodo(id)` 后立即 `return`。
- 编辑：查找 `[data-action="edit"]`，调用 `editTodo(id)` 后立即 `return`。
- 其余任务区域：调用 `toggleTodo(id)`。

任务内容使用普通容器；复选框有独立的可访问名称，避免 `label` 默认激活再派发一次点击。鼠标和空格操作均只切换一次。

## Debug exercise

[review/w08-missing-return.js](review/w08-missing-return.js) 保留教师的缺陷监听器，正式页面不加载。复现时仅替换监听器，删除后会继续调用切换，控制台出现同一个 ID 的两条日志。最终监听器用 `return` 结束当前回调，防止一个点击走入两种操作。

本例按 ID 删除后，后续 `map()` 找不到已删项，因此没有误改另一项；但切换函数及保存、渲染仍被多余执行。页面没有异常，不能证明操作分流正确。

## Check

Windows Edge 实际验证了文字切换、按钮删除、按钮内文字与图标删除、列表空白点击、动态新增后的切换与删除。另验证复选框鼠标与键盘操作、编辑后刷新、取消编辑、空白编辑和筛选；本轮没有未捕获的 JavaScript 异常。390px 浏览器视口查看了实际画面，没有横向溢出。本周实现和验证使用了 AI 辅助，包括编辑分支。

## Review drafts

- [draft1.js](review/draft1.js)：记录 1 的完整 AI 初稿，保留时间戳 ID 写法。
- [draft2.js](review/draft2.js)：记录 2 的完整 AI 初稿，保留初始保存、恢复与筛选写法。

这些文件用于核对 W7 协作记录中的审查与修改；W7 最终实现可在提交 `04c400c` 查看。本周代码保存在 `feature/w08-event-delegation` 分支，页面入口使用根目录的 `todo.js`。
