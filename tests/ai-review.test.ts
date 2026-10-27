import { expect, it } from 'vitest';
import { addTodo, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

it('修补 AI 弱断言：切换后状态改变，原数组不变', () => {
  const todos: Todo[] = [{ id: 1, text: '复习 TS', completed: false }];
  const result = toggleTodo(todos, 1);
  expect(result[0].completed).toBe(true);
  expect(todos[0].completed).toBe(false);
});

it('补充状态、重复与越界：切换两次和不存在的 ID', () => {
  const todos: Todo[] = [{ id: 1, text: '复习 TS', completed: false }];
  const once = toggleTodo(todos, 1);
  const twice = toggleTodo(once, 1);
  expect(once[0].completed).toBe(true);
  expect(twice[0]).toEqual({ id: 1, text: '复习 TS', completed: false });
  expect(toggleTodo(todos, 99)).toEqual(todos);
  expect(todos[0].completed).toBe(false);
});

it('补充空值和格式：空字符串及纯空格都不新增', () => {
  const todos: Todo[] = [{ id: 1, text: '已有任务', completed: false }];
  expect(addTodo(todos, '')).toEqual(todos);
  expect(addTodo(todos, '  \t  ')).toEqual(todos);
  expect(todos).toEqual([{ id: 1, text: '已有任务', completed: false }]);
});

it('补充格式和安全：保留修剪后的 HTML 普通文字', () => {
  const todos: Todo[] = [];
  const payload = '<img src=x onerror=alert(1)>';
  const result = addTodo(todos, `  ${payload}  `);
  expect(result).toHaveLength(1);
  expect(result[0].text).toBe(payload);
  expect(result[0].completed).toBe(false);
  expect(todos).toEqual([]);
});
