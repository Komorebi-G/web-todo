import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Todo } from '../todo';

export interface TodoItemProps {
  todo: Readonly<Todo>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [error, setError] = useState('');

  function startEdit() {
    setDraft(todo.text);
    setError('');
    setEditing(true);
  }
  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      setError('待办内容不能为空，原任务未修改。');
      return;
    }
    onEdit(todo.id, draft);
    setEditing(false);
  }

  return (
    <li className={`todo-item${todo.completed ? ' is-completed' : ''}`}>
      {editing ? (
        <form className="todo-edit-form" onSubmit={saveEdit}>
          <label htmlFor={`edit-${todo.id}`}>编辑待办</label>
          <input
            id={`edit-${todo.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `edit-error-${todo.id}` : undefined}
          />
          <div className="todo-actions">
            <button type="submit">保存</button>
            <button type="button" onClick={() => setEditing(false)}>
              取消
            </button>
          </div>
          {error && (
            <p id={`edit-error-${todo.id}`} role="status">
              {error}
            </p>
          )}
        </form>
      ) : (
        <>
          <div className="todo-content">
            <input
              type="checkbox"
              className="todo-toggle"
              checked={todo.completed}
              aria-label={`切换完成状态：${todo.text}`}
              onChange={() => onToggle(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
          </div>
          <div className="todo-actions">
            <button
              className="todo-edit"
              type="button"
              aria-label={`编辑 ${todo.text}`}
              onClick={startEdit}
            >
              编辑
            </button>
            <button
              className="todo-delete"
              type="button"
              aria-label={`删除 ${todo.text}`}
              onClick={() => onDelete(todo.id)}
            >
              <span aria-hidden="true">×</span>
              <span>删除</span>
            </button>
          </div>
        </>
      )}
    </li>
  );
}
