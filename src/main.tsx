import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TodoApp from './components/TodoApp';

// 仅入口读取挂载容器；列表内容由 React 管理。
const root = document.getElementById('root');
if (!root) throw new Error('找不到 React 挂载容器');
createRoot(root).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
);
