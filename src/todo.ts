export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 从未使用的正整数中选一个，避免已有任务发生 ID 冲突。
export function nextId(todos: readonly Todo[]): number {
  const used = new Set(todos.map((todo) => todo.id));
  let id = 1;
  while (used.has(id)) id++;
  return id;
}

export function addTodo(todos: readonly Todo[], rawText: string): Todo[] {
  const text = rawText.trim();
  if (!text) return [...todos];
  return [...todos, { id: nextId(todos), text, completed: false }];
}

export function toggleTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

export function deleteTodo(todos: readonly Todo[], id: number): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

export function editTodo(todos: readonly Todo[], id: number, rawText: string): Todo[] {
  const text = rawText.trim();
  if (!text) return [...todos];
  return todos.map((todo) => todo.id === id ? { ...todo, text } : todo);
}
