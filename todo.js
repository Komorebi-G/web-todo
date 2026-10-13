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
