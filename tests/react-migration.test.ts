import { expect, it } from 'vitest';
import { addTodo, deleteTodo, editTodo, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

it('不可变更新：新数组和被切换的对象改变引用，未改项复用', () => {
  const original: Todo[] = [
    { id: 1, text: '任务A', completed: false },
    { id: 2, text: '任务B', completed: false },
  ];
  original.forEach(Object.freeze);
  Object.freeze(original);
  const result = toggleTodo(original, 1);
  expect(result).not.toBe(original);
  expect(result[0]).not.toBe(original[0]);
  expect(result[1]).toBe(original[1]);
  expect(result[0].completed).toBe(true);
  expect(original[0].completed).toBe(false);
});

it('删除与编辑：只处理目标，空白编辑不改变原文', () => {
  const original: Todo[] = [
    { id: 1, text: '任务A', completed: true },
    { id: 2, text: '任务B', completed: false },
  ];
  const edited = editTodo(original, 1, '  已修改  ');
  expect(edited[0]).toEqual({ id: 1, text: '已修改', completed: true });
  expect(original[0].text).toBe('任务A');
  expect(editTodo(edited, 1, '   ')).toEqual(edited);
  expect(deleteTodo(edited, 1)).toEqual([original[1]]);
  expect(edited).toHaveLength(2);
});

it('连续新增：按上一步结果计算，已有 ID 不冲突', () => {
  const first = addTodo([], '任务A');
  const second = addTodo(first, '任务B');
  expect(second.map((todo) => todo.text)).toEqual(['任务A', '任务B']);
  expect(new Set(second.map((todo) => todo.id)).size).toBe(2);
  expect(first).toHaveLength(1);
});
