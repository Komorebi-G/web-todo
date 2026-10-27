import { describe, expect, it } from 'vitest';
import { addTodo, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

describe('手写：addTodo 和 toggleTodo', () => {
  it('新增任务，去掉首尾空格并保留内容', () => {
    const todos: Todo[] = [];
    const result = addTodo(todos, '  复习 TypeScript  ');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('复习 TypeScript');
    expect(result[0].completed).toBe(false);
    expect(result[0].id).toBe(1);
    expect(todos).toEqual([]);
  });

  it('拦截只有空格的任务', () => {
    const todos: Todo[] = [{ id: 1, text: '已有任务', completed: false }];
    const result = addTodo(todos, '   ');
    expect(result).toEqual([{ id: 1, text: '已有任务', completed: false }]);
  });

  it('切换指定任务，其他任务不变', () => {
    const todos: Todo[] = [
      { id: 1, text: '第一项', completed: false },
      { id: 2, text: '第二项', completed: false }
    ];
    const result = toggleTodo(todos, 1);
    expect(result[0].completed).toBe(true);
    expect(result[1]).toEqual({ id: 2, text: '第二项', completed: false });
    expect(todos[0].completed).toBe(false);
  });

  it('ID 不存在时不改变任何任务', () => {
    const todos: Todo[] = [{ id: 1, text: '已有任务', completed: false }];
    const result = toggleTodo(todos, 99);
    expect(result).toEqual([{ id: 1, text: '已有任务', completed: false }]);
  });

  it('已完成任务再次切换后变为未完成', () => {
    const todos: Todo[] = [{ id: 1, text: '复习单元测试', completed: true }];
    const result = toggleTodo(todos, 1);
    expect(result[0]).toEqual({ id: 1, text: '复习单元测试', completed: false });
    expect(todos[0].completed).toBe(true);
  });
});
