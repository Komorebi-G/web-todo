# Web Todo V3.0

Web 编程 W10：延续 W9 的 Vite + TypeScript Todo，补齐 ESLint、Prettier 和工程化审查。页面保留新增、编辑、切换、删除、筛选、本地保存和旧 UUID 数据迁移。

## 运行与检查

```sh
npm ci
npm run dev
npx eslint src/
npm run lint
npm run format:check
npm run test
npm run build
```

`build` 固定为 `tsc --noEmit && vite build`，`test` 固定为 `vitest run`，`tsconfig.json` 保持 `strict: true`。构建结果在 `dist/`。

课程指定 `.eslintrc.cjs`，因此固定 ESLint 8.57.1；`overrides.files: ['*.ts']` 使 `npx eslint src/` 检查 TypeScript 文件。规则为 `complexity: ['error', 10]`、`max-depth: ['error', 3]`、`@typescript-eslint/no-explicit-any: 'error'`。`npm run lint` 额外限定最多 3 个 warning。Prettier 单独执行，`eslint-config-prettier` 避免格式规则冲突。依赖由 `package-lock.json` 锁定。

## 本周改造与业务规则

W9 基线为 `8a7bc1e`。首次检查有 5 个 error：列表点击回调复杂度 12，`isSavedItem` 为 11，`loadTodos` 为 14，以及两处 4 层嵌套。

- 把 ID 判断抽为 `isSavedId`，保留文字的 `trim` 校验和布尔状态检查。
- 把旧 ID 迁移与重复项处理抽为 `restoreItems`，保留预留数字 ID、跳过重复项和异常提示。
- 把编辑弹窗流程抽为 `editFromPrompt`，保留取消、空白拦截和编辑后的 `return`。
- 所有业务函数仍在 `src/` 中，接受同一套 ESLint 检查。

`addTodo`、`editTodo` 先去除首尾空白，空白输入不改变任务；已完成任务可以再次切回未完成。本地恢复会跳过纯空白文字，但对合法旧任务不擅自修剪原文。增删改与切换保持不可变更新，页面使用 `textContent` 显示任务文字。

## 测试与审查对照

`tests/todo.test.ts` 与 `tests/ai-review.test.ts` 延续 W9 的 9 个测试；`tests/storage.test.ts` 新增 8 个恢复与保存用例，共 17 个用例。新增用例覆盖空白、脏数据、旧 ID 迁移、重复项、原文与状态保留、损坏 JSON、读写失败。

本轮配置、重构、测试和记录使用 Codex 辅助。`review/engineering-prompt.txt` 保留整理后的结构化任务指令。为审查“检查通过但业务失败”，本轮主动让 AI 生成一个删掉 `item.text.trim() !== ''` 的反例；它不是历史会话中自然出现的错误。

```sh
node review/reproduce-rejected.mjs
```

该命令复制工程到系统临时目录，应用 `review/rejected-remove-trim.patch`，运行 ESLint 和针对性测试，最后删除临时副本。ESLint 通过，但业务测试因预期 `[2]`、实际 `[1, 2]` 而失败；脚本确认这种结果后结束，正式源码保持不变。反例已拒绝，发布版保留完整校验。

成功时 ESLint 默认静默。需要明确的数量汇总，可运行：

```sh
npx eslint src/ -f ./review/eslint-summary.cjs
```

该 formatter 只汇总 ESLint 实际返回的错误和警告，不改变规则或退出状态。

W7–W9 的历史实现与协作材料保留在原有 Git 分支中。
