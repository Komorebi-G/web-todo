# Web Todo V4.0

Web 编程 W11：在 W10 的 Vite + TypeScript 工程上，用 React 重构学习待办。保留个人简历、任务增删改、完成状态往返切换、筛选、本地保存和旧 UUID 数据迁移。

## 运行

```sh
npm ci
npm run dev
npm run lint
npm run format:check
npm run test
npm run build
```

`build` 为 `tsc --noEmit && vite build`，`test` 为 `vitest run`，保持 TypeScript strict。新增 React 插件和自动 JSX 编译；ESLint 同时检查 TS/TSX，保留 W10 的复杂度、嵌套和禁止 any 规则，并检查 Hooks 使用和依赖。

## 组件与状态

- `src/components/TodoApp.tsx`：管理任务和筛选，调用原有纯函数，以函数式更新接入 React State。Effect 在状态提交后同步浏览器存储。
- `TodoForm.tsx`：受控输入，拦截空白，添加成功后清空并恢复输入焦点。
- `TodoList.tsx`：接收只读列表，用任务 ID 作 key，向每项传递回调。
- `TodoItem.tsx`：显示单条任务，以回调通知切换和删除；本地 State 管理编辑草稿，保存时上报，取消时不更改任务。

`src/main.tsx` 只负责挂载 React；组件不手动重建列表。表单 ref 仅用于焦点控制。筛选列表和数量从当前任务计算，不另存一份任务 State。旧版编辑弹窗改为行内表单，保留空白拦截和取消语义；完成状态用复选框切换，避免编辑/删除触发额外切换。

开发模式在浏览器控制台输出 `[todos]` 和提交后的 JSON 快照，便于按模板核对页面。它不是全局可写变量；生产构建移除此开发分支。StrictMode 首次挂载可能打印两次，不表示添加了两份任务。

## 回归与审查

保留 W10 的 17 项业务和存储测试，增加 3 项针对不可变引用、编辑/删除及连续新增的用例，共 20 项。纯函数测试验证业务；实际浏览器操作另核对输入清空、完成样式、删除后的空列表、State 日志、编辑、筛选与刷新恢复。单测不代替组件操作验证。

`review/fake-react-original.txt` 为本周模板提供的错误靶子，不能作为应用入口；`review/react-prompt.txt` 为本轮整理的约束与核对指令。最终修复已落实在四个组件和 `src/todo.ts` 中。W9/W10 的旧审查材料保留在对应 Git 分支，不随本周重复打包。
