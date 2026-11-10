import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

export interface TodoFormProps {
  onAdd: (text: string) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) {
      setError('请先输入待办内容，不能只填空格。');
      inputRef.current?.focus();
      return;
    }
    onAdd(text);
    setText('');
    setError('');
    inputRef.current?.focus();
  }

  return (
    <form id="todo-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="todo-input">下一件准备做的事</label>
      <div className="todo-entry">
        <input
          ref={inputRef}
          id="todo-input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="例如：复习 React 组件"
          aria-describedby="todo-message"
          aria-invalid={error ? true : undefined}
          autoComplete="off"
        />
        <button type="submit">添加</button>
      </div>
      <p id="todo-message" role="status" aria-live="polite">
        {error}
      </p>
    </form>
  );
}
