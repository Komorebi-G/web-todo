import type { Todo } from './todo';

export const storageKey = 'web-w07-todos';

type SavedItem = { id: number | string; text: string; completed: boolean };
type LoadResult = { todos: Todo[]; notice: string; migrated: boolean };

function isSavedItem(value: unknown): value is SavedItem {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  const validId = (typeof item.id === 'number' && Number.isSafeInteger(item.id) && item.id > 0)
    || (typeof item.id === 'string' && item.id.trim() !== '');
  return validId && typeof item.text === 'string' && item.text.trim() !== ''
    && typeof item.completed === 'boolean';
}

export function loadTodos(storage: Storage): LoadResult {
  try {
    const raw = storage.getItem(storageKey);
    if (raw === null) return { todos: [], notice: '', migrated: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Invalid list');
    const valid = parsed.filter(isSavedItem);
    const dirty = valid.length !== parsed.length;
    // 先保留旧数据中的数字 ID，避免迁移 UUID 时与它们冲突。
    const reserved = new Set(valid.filter((item) => typeof item.id === 'number').map((item) => item.id));
    const used = new Set<number>();
    const legacyIds = new Set<string>();
    const todos: Todo[] = [];
    let migrated = false;
    let duplicate = false;
    for (const item of valid) {
      let id: number;
      if (typeof item.id === 'number') {
        id = item.id;
      } else {
        if (legacyIds.has(item.id)) { duplicate = true; continue; }
        legacyIds.add(item.id);
        id = 1;
        while (reserved.has(id) || used.has(id)) id++;
        migrated = true;
      }
      if (used.has(id)) { duplicate = true; continue; }
      used.add(id);
      todos.push({ id, text: item.text, completed: item.completed });
    }
    return {
      todos,
      notice: dirty || duplicate ? '本地数据含无效或重复项，已跳过这些项。' : '',
      migrated: migrated && !dirty && !duplicate
    };
  } catch {
    return { todos: [], notice: '本地数据无法恢复，本次从空列表开始。', migrated: false };
  }
}

export function saveTodos(storage: Storage, todos: readonly Todo[]): boolean {
  try {
    storage.setItem(storageKey, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
