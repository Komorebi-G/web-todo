import { useEffect, useState } from 'react';
import { addTodo, deleteTodo, editTodo, toggleTodo } from '../todo';
import type { Todo } from '../todo';
import { loadTodos, saveTodos } from '../storage';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

type Filter = 'all' | 'active' | 'completed';
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' },
];

export default function TodoApp() {
  const [loaded] = useState(() => loadTodos(localStorage));
  const [todos, setTodos] = useState<Todo[]>(loaded.todos);
  const [filter, setFilter] = useState<Filter>('all');
  const [saveFailed, setSaveFailed] = useState(false);

  // 外部存储同步放在 Effect 中，更新函数只负责计算下一份 State。
  useEffect(() => {
    setSaveFailed(!saveTodos(localStorage, todos));
    if (import.meta.env.DEV) console.log('[todos]', JSON.stringify(todos));
  }, [todos]);

  function handleAdd(text: string) {
    setTodos((prev) => addTodo(prev, text));
  }
  function handleToggle(id: number) {
    setTodos((prev) => toggleTodo(prev, id));
  }
  function handleDelete(id: number) {
    setTodos((prev) => deleteTodo(prev, id));
  }
  function handleEdit(id: number, text: string) {
    setTodos((prev) => editTodo(prev, id, text));
  }

  const visibleTodos = todos.filter((todo) =>
    filter === 'all' ? true : filter === 'completed' ? todo.completed : !todo.completed,
  );
  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <section className="todo-panel" aria-labelledby="todo-title">
      <div className="todo-heading">
        <h2 id="todo-title">学习待办</h2>
        <span className="meta">V4.0 · React</span>
      </div>
      <p className="meta">把下一件事记下来，任务保存在当前浏览器。</p>
      <TodoForm onAdd={handleAdd} />
      {(loaded.notice || saveFailed) && (
        <p role="status" className="meta">
          {saveFailed ? '本次更改未保存，请检查浏览器存储设置。' : loaded.notice}
        </p>
      )}
      <div id="todo-filters" role="group" aria-label="筛选待办">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            className="filter-button"
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="todo-summary">
        <h3>待办列表</h3>
        <span id="todo-count" className="meta">
          共 {todos.length} 项 · 未完成 {todos.length - completedCount} · 已完成 {completedCount}
        </span>
      </div>
      <TodoList
        todos={visibleTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      {visibleTodos.length === 0 && (
        <p id="empty-state" className="meta">
          {todos.length === 0 ? '还没有待办，先添加一件事。' : '当前筛选下没有任务。'}
        </p>
      )}
    </section>
  );
}
