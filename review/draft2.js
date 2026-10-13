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
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

function load() {
  return JSON.parse(localStorage.getItem(storageKey)) || [];
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

function removeTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  save();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
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
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-toggle";
    checkbox.checked = completed;
    checkbox.addEventListener("change", () => toggleTodo(id));
    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = text;
    label.append(checkbox, span);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "todo-delete";
    button.textContent = "删除";
    button.setAttribute("aria-label", `删除 ${text}`);
    button.addEventListener("click", () => removeTodo(id));
    li.append(label, button);
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
  message.textContent = "已添加一项待办。";
  input.focus();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

render();
