"use strict";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#todo-count");
const empty = document.querySelector("#empty-state");
const message = document.querySelector("#todo-message");
const storageKey = "web-w07-todos";
let currentFilter = "all";
let todos = load();

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(todos));
    message.textContent = "";
  } catch {
    message.textContent = "本次更改未保存，请检查浏览器存储设置。";
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey)) ?? [];
    const valid = Array.isArray(saved) && saved.every((todo) =>
      todo !== null && typeof todo === "object" &&
      typeof todo.id === "string" && typeof todo.text === "string" &&
      typeof todo.completed === "boolean"
    );
    if (!valid) throw new Error("Invalid todo data");
    return saved;
  } catch {
    message.textContent = "本地数据无法恢复，本次从空列表开始。";
    return [];
  }
}

// 操作函数只改数据，统一交给 render() 更新页面。
function addTodo(rawText) {
  const text = rawText.trim();
  if (text === "") return false;
  const item = { id: crypto.randomUUID(), text, completed: false };
  todos = [...todos, item];
  save();
  render();
  return true;
}

function deleteTodo(id) {
  console.log(`[deleteTodo] id=${id}`);
  todos = todos.filter((todo) => todo.id !== id);
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  save();
  render();
}

function toggleTodo(id) {
  console.log(`[toggleTodo] id=${id} found=${todos.some((todo) => todo.id === id)}`);
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  save();
  render();
}

function editTodo(id) {
  const item = todos.find((todo) => todo.id === id);
  if (!item) return;
  const rawText = window.prompt("编辑待办内容", item.text);
  if (rawText === null) return;
  const text = rawText.trim();
  if (text === "") {
    message.textContent = "待办内容不能为空，原任务未修改。";
    return;
  }
  console.log(`[editTodo] id=${id} completed=${item.completed}`);
  todos = todos.map((todo) => todo.id === id ? { ...todo, text } : todo);
  save();
  render();
}

function render() {
  list.replaceChildren();
  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });
  visibleTodos.forEach(({ id, text, completed }) => {
    const li = document.createElement("li");
    li.className = `todo-item${completed ? " is-completed" : ""}`;
    li.dataset.id = id;
    const content = document.createElement("div");
    content.className = "todo-content";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-toggle";
    checkbox.checked = completed;
    checkbox.setAttribute("aria-label", `切换完成状态：${text}`);
    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = text;
    content.append(checkbox, span);
    const actions = document.createElement("div");
    actions.className = "todo-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "todo-edit";
    editButton.dataset.action = "edit";
    editButton.textContent = "编辑";
    editButton.setAttribute("aria-label", `编辑 ${text}`);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "todo-delete";
    button.dataset.action = "delete";
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "delete-icon";
    deleteIcon.setAttribute("aria-hidden", "true");
    deleteIcon.textContent = "×";
    const deleteText = document.createElement("span");
    deleteText.className = "delete-text";
    deleteText.textContent = "删除";
    button.append(deleteIcon, deleteText);
    button.setAttribute("aria-label", `删除 ${text}`);
    actions.append(editButton, button);
    li.append(content, actions);
    list.append(li);
  });
  const completedCount = todos.filter((todo) => todo.completed).length;
  count.textContent = `共 ${todos.length} 项 · 未完成 ${todos.length - completedCount} · 已完成 ${completedCount}`;
  empty.hidden = visibleTodos.length > 0;
  empty.textContent = todos.length === 0 ? "还没有待办，先添加一件事。" : "当前筛选下没有任务。";
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
  });
}

// 只在父容器注册一次；render() 重建 li 后仍由这里接收点击。
list.addEventListener("click", (e) => {
  if (!(e.target instanceof Element)) return;
  const item = e.target.closest("li");
  if (!item || !list.contains(item)) return;
  const id = item.dataset.id;
  if (!id) return;
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn && item.contains(delBtn)) {
    deleteTodo(id);
    return;
  }
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn && item.contains(editBtn)) {
    editTodo(id);
    return;
  }
  toggleTodo(id);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!addTodo(input.value)) {
    message.textContent = "请先输入待办内容，不能只填空格。";
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  input.value = "";
  input.removeAttribute("aria-invalid");
  if (message.textContent === "") message.textContent = "已添加一项待办。";
  input.focus();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

render();
