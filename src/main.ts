import { addTodo, deleteTodo, editTodo, toggleTodo } from './todo';
import type { Todo } from './todo';
import { loadTodos, saveTodos } from './storage';

type Filter = 'all' | 'active' | 'completed';

function requiredElement<T extends Element>(selector: string, type: { new(): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`找不到页面元素：${selector}`);
  return element;
}

const form = requiredElement('#todo-form', HTMLFormElement);
const input = requiredElement('#todo-input', HTMLInputElement);
const list = requiredElement('#todo-list', HTMLUListElement);
const count = requiredElement('#todo-count', HTMLElement);
const empty = requiredElement('#empty-state', HTMLElement);
const message = requiredElement('#todo-message', HTMLElement);
const loaded = loadTodos(localStorage);
let todos: Todo[] = loaded.todos;
let currentFilter: Filter = 'all';
message.textContent = loaded.notice;
if (loaded.migrated && !saveTodos(localStorage, todos)) {
  message.textContent = '旧数据已转换，但未能保存，请检查浏览器存储设置。';
}

function update(next: Todo[]): void {
  todos = next;
  message.textContent = saveTodos(localStorage, todos) ? '' : '本次更改未保存，请检查浏览器存储设置。';
  render();
}

function render(): void {
  list.replaceChildren();
  const visible = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });
  visible.forEach(({ id, text, completed }) => {
    const li = document.createElement('li');
    li.className = `todo-item${completed ? ' is-completed' : ''}`;
    li.dataset.id = String(id);
    const content = document.createElement('div');
    content.className = 'todo-content';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-toggle';
    checkbox.checked = completed;
    checkbox.setAttribute('aria-label', `切换完成状态：${text}`);
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = text;
    content.append(checkbox, span);
    const actions = document.createElement('div');
    actions.className = 'todo-actions';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'todo-edit';
    editButton.dataset.action = 'edit';
    editButton.textContent = '编辑';
    editButton.setAttribute('aria-label', `编辑 ${text}`);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'todo-delete';
    deleteButton.dataset.action = 'delete';
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'delete-icon';
    deleteIcon.setAttribute('aria-hidden', 'true');
    deleteIcon.textContent = '×';
    const deleteText = document.createElement('span');
    deleteText.className = 'delete-text';
    deleteText.textContent = '删除';
    deleteButton.append(deleteIcon, deleteText);
    deleteButton.setAttribute('aria-label', `删除 ${text}`);
    actions.append(editButton, deleteButton);
    li.append(content, actions);
    list.append(li);
  });
  const completedCount = todos.filter((todo) => todo.completed).length;
  count.textContent = `共 ${todos.length} 项 · 未完成 ${todos.length - completedCount} · 已完成 ${completedCount}`;
  empty.hidden = visible.length > 0;
  empty.textContent = todos.length === 0 ? '还没有待办，先添加一件事。' : '当前筛选下没有任务。';
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
  });
}

// dataset 是字符串或 undefined，只接受安全的正整数 ID。
function readId(value: string | undefined): number | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

list.addEventListener('click', (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const item = target.closest('li');
  if (!item || !list.contains(item)) return;
  const id = readId(item.dataset.id);
  if (id === null) return;
  const deleteButton = target.closest('[data-action="delete"]');
  if (deleteButton && item.contains(deleteButton)) {
    update(deleteTodo(todos, id));
    return;
  }
  const editButton = target.closest('[data-action="edit"]');
  if (editButton && item.contains(editButton)) {
    const todo = todos.find((entry) => entry.id === id);
    if (!todo) return;
    const text = window.prompt('编辑待办内容', todo.text);
    if (text === null) return;
    if (!text.trim()) {
      message.textContent = '待办内容不能为空，原任务未修改。';
      return;
    }
    update(editTodo(todos, id, text));
    return;
  }
  update(toggleTodo(todos, id));
});

form.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();
  if (!input.value.trim()) {
    message.textContent = '请先输入待办内容，不能只填空格。';
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  update(addTodo(todos, input.value));
  input.value = '';
  input.removeAttribute('aria-invalid');
  if (!message.textContent) message.textContent = '已添加一项待办。';
  input.focus();
});

document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    if (filter !== 'all' && filter !== 'active' && filter !== 'completed') return;
    currentFilter = filter;
    render();
  });
});

render();
