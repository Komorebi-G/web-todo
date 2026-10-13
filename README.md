# Web Todo

Web 编程 W7：把 W6 的学习待办重构为数据驱动的 V2.0，保留 W5 简历布局和配色。基础提交依据已交 W6 PDF 中的最终代码恢复。

## Run

无构建依赖。在本目录运行：

```sh
python3 -m http.server 8077
```

打开 http://localhost:8077/ 。也可以直接用浏览器打开 `index.html`；存储按访问来源区分，验证保存与刷新时请一直使用同一个地址。

## Data flow

`todos` 保存完整任务数组，`currentFilter` 只决定当前显示哪些任务。

- `addTodo()`：展开生成新数组，新增项用 UUID 标识。
- `removeTodo()`：`filter()` 排除目标 ID。
- `toggleTodo()`：`map()` 加对象展开，仅替换目标对象。
- `clearCompleted()`：`filter()` 保留未完成项，控制台可直接调用。

四个操作均按 `todos = 新数组 → save() → render()` 执行。`render()` 筛选视图、创建元素、挂载列表；任务文字用 `textContent`。

`save()` 将完整数组序列化到 `web-w07-todos`，初始化由 `load()` 恢复。过滤按钮不会删掉数据；刷新后视图回到“全部”。无法恢复的数据有提示，存储失败时页面会说明更改未保存。

## Git workflow

在 `feature/v2-data-driven` 中分步完成不可变更新、筛选与恢复、批量清理，再使用 `--no-ff` 合并回 `main`，保留功能分支和合并记录。

## Check

本次用 Windows Edge 实际检查了添加、完成、删除、筛选、刷新恢复与 `clearCompleted()`；冻结旧数组和对象检查不可变更新；检查异常存储与纯文本显示。320～1100px 的代表视口保持原有响应式布局。

## Review drafts

- [draft1.js](review/draft1.js)：记录 1 的完整 AI 初稿，保留时间戳 ID 写法。
- [draft2.js](review/draft2.js)：记录 2 的完整 AI 初稿，保留初始保存、恢复与筛选写法。

这些文件用于核对协作记录中的审查与修改；页面入口使用根目录的最终 `todo.js`。
