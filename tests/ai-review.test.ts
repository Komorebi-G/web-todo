import { expect, it } from 'vitest';
import { toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

it('修补 AI 初稿：切换后状态确实改变，原数组不变', () => {
  const todos: Todo[] = [{ id: 1, text: '复习 TS', completed: false }];
  const result = toggleTodo(todos, 1);
  expect(result[0].completed).toBe(true);
  expect(todos[0].completed).toBe(false);
});

it('补充边界：同一任务连续切换两次恢复原状态', () => {
  const todos: Todo[] = [{ id: 1, text: '复习 TS', completed: false }];
  const once = toggleTodo(todos, 1);
  const twice = toggleTodo(once, 1);
  expect(once[0].completed).toBe(true);
  expect(twice[0]).toEqual({ id: 1, text: '复习 TS', completed: false });
  expect(todos[0].completed).toBe(false);
});
