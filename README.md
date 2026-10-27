# Web Todo

Web 编程 W9：在 W8 的事件委托版本上完成 TypeScript 重构和单元测试，保留待办的新增、编辑、切换、删除、筛选和本地保存。

## 运行

需要 Node.js 和 npm。在项目目录执行：

```sh
npm install
npm run dev
```

按终端提示打开页面；`npm run build` 先做 TypeScript 严格检查，再生成生产构建。运行 `npm run test` 可执行全部 Vitest 测试。

## 类型和数据

`src/todo.ts` 定义 `Todo` 接口，`id` 是正整数。增删改和切换函数只接收旧数组并返回新数组；新增时去掉文字首尾空格，空白内容不创建任务。

`src/main.ts` 保留 W8 的列表事件委托。读取元素与事件目标时检查类型、空值及容器归属；`dataset.id` 先校验为正整数字符串，再用 `Number()` 转换并检查 `Number.isSafeInteger()`；删除和编辑各自 `return`，不会继续切换完成状态。文字使用 `textContent`。

`src/storage.ts` 用 `unknown` 接住解析后的本地数据，检查数组、ID、文字及完成状态，跳过无效或重复项并提示。之前 W8 保存的 UUID 字符串会转换为不冲突的数字 ID，干净数据迁移后保存，保留文字和完成状态；不能读取或保存时显示提示。

## 单元测试

- `tests/todo.test.ts`：5 个基础用例，覆盖正常新增、空白拦截、切换指定项、不存在的 ID、已完成项再次切换；每个用例独立准备数据，断言业务内容和状态。
- `review/ai-test-prompt.txt`、`review/ai-test-draft.txt`：结构化提问与待审查的 AI 测试初稿。
- `tests/ai-review.test.ts`：针对初稿断言过弱和遗漏的边界，补充状态变化、重复切换、不存在的 ID、空字符串/空格及 HTML 文字的具体断言。

早期 JS 版本和第八周调试记录仍可在仓库的 `feature/w08-event-delegation` 分支查看。
