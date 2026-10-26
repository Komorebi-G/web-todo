// 教师给出的缺陷版本，仅用于复现；页面入口不加载此文件。
list.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  const item = e.target.closest('li');
  if (!item || !list.contains(item)) return;
  const id = item.dataset.id;
  if (!id) return;
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn && item.contains(delBtn)) {
    deleteTodo(id);
  }
  toggleTodo(id);
});
