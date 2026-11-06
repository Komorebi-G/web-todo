import { describe, expect, it, vi } from 'vitest';
import { loadTodos, saveTodos, storageKey } from '../src/storage';

function memoryStorage(raw: string | null = null): Storage {
  const data = new Map<string, string>();
  if (raw !== null) data.set(storageKey, raw);
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe('storage business rules', () => {
  it('rejects whitespace-only saved text', () => {
    const storage = memoryStorage(
      JSON.stringify([
        { id: 1, text: '   ', completed: false },
        { id: 2, text: '有效任务', completed: true },
      ]),
    );
    const result = loadTodos(storage);
    expect(result.todos.map((todo) => todo.id)).toEqual([2]);
    expect(result.todos[0]).toEqual({ id: 2, text: '有效任务', completed: true });
    expect(result.notice).toBe('本地数据含无效或重复项，已跳过这些项。');
    expect(result.migrated).toBe(false);
  });

  it('skips invalid shapes, IDs and field types', () => {
    const invalid = [
      null,
      [],
      1,
      { id: 0, text: 'x', completed: false },
      { id: 1.5, text: 'x', completed: false },
      { id: Number.MAX_SAFE_INTEGER + 1, text: 'x', completed: false },
      { id: '  ', text: 'x', completed: false },
      { id: 1, text: 12, completed: false },
      { id: 1, text: 'x', completed: 'false' },
    ];
    const result = loadTodos(memoryStorage(JSON.stringify(invalid)));
    expect(result.todos).toEqual([]);
    expect(result.notice).toBe('本地数据含无效或重复项，已跳过这些项。');
    expect(result.migrated).toBe(false);
  });

  it('migrates UUIDs without colliding with later numeric IDs', () => {
    const data = [
      { id: 'old-a', text: '旧任务', completed: true },
      { id: 1, text: '数字任务', completed: false },
      { id: 'old-b', text: '另一个旧任务', completed: false },
    ];
    expect(loadTodos(memoryStorage(JSON.stringify(data)))).toEqual({
      todos: [
        { id: 2, text: '旧任务', completed: true },
        data[1],
        { id: 3, text: '另一个旧任务', completed: false },
      ],
      notice: '',
      migrated: true,
    });
  });

  it('keeps the first duplicate and avoids automatic dirty migration', () => {
    const data = [
      { id: 'old-a', text: '第一项', completed: false },
      { id: 'old-a', text: '重复旧ID', completed: true },
      { id: 1, text: '数字任务', completed: true },
      { id: 1, text: '重复数字ID', completed: false },
    ];
    expect(loadTodos(memoryStorage(JSON.stringify(data)))).toEqual({
      todos: [{ id: 2, text: '第一项', completed: false }, data[2]],
      notice: '本地数据含无效或重复项，已跳过这些项。',
      migrated: false,
    });
  });

  it('restores valid text and state without rewriting the saved text', () => {
    const data = [{ id: 7, text: '  保留旧数据原文  ', completed: true }];
    const storage = memoryStorage(JSON.stringify(data));
    expect(loadTodos(storage)).toEqual({ todos: data, notice: '', migrated: false });
    expect(storage.getItem(storageKey)).toBe(JSON.stringify(data));
    expect(loadTodos(memoryStorage())).toEqual({ todos: [], notice: '', migrated: false });
  });

  it('reports malformed JSON and non-array data', () => {
    const expected = { todos: [], notice: '本地数据无法恢复，本次从空列表开始。', migrated: false };
    expect(loadTodos(memoryStorage('{broken'))).toEqual(expected);
    expect(loadTodos(memoryStorage('{"id":1}'))).toEqual(expected);
  });

  it('reports blocked storage reads', () => {
    const storage = memoryStorage();
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadTodos(storage)).toEqual({
      todos: [],
      notice: '本地数据无法恢复，本次从空列表开始。',
      migrated: false,
    });
  });

  it('saves normally and reports failed writes', () => {
    const data = [{ id: 1, text: '复习 ESLint', completed: false }];
    const storage = memoryStorage();
    expect(saveTodos(storage, data)).toBe(true);
    expect(JSON.parse(storage.getItem(storageKey) ?? 'null')).toEqual(data);
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(saveTodos(storage, data)).toBe(false);
  });
});
