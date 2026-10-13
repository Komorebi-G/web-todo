// W6 基础版：依据已交 W6 PDF 中的最终代码恢复。
(() => {
  const form = document.querySelector("#todo-form");
  const input = document.querySelector("#todo-input");
  const list = document.querySelector("#todo-list");
  const count = document.querySelector("#todo-count");
  const empty = document.querySelector("#empty-state");
  const message = document.querySelector("#todo-message");
  const todos = [];

  function renderTodos() {
    list.replaceChildren();
    for (const text of todos) {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.textContent = text;
      list.append(li);
    }
    count.textContent = `共 ${todos.length} 项`;
    empty.hidden = todos.length > 0;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (text === "") {
      message.textContent = "请先输入待办内容，不能只填空格。";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    todos.push(text);
    renderTodos();
    input.value = "";
    input.removeAttribute("aria-invalid");
    message.textContent = "已添加一项待办。";
    input.focus();
  });
  renderTodos();
})();
