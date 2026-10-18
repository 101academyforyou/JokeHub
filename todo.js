(function () {
  "use strict";
  const KEY = "jokehub.todos.v1";
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const status = document.getElementById("todo-status");
  let tasks = [];

  function render() {
    list.replaceChildren();
    for (const [index, task] of tasks.entries()) {
      const item = document.createElement("li");
      const label = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = task.done;
      check.addEventListener("change", () => {
        update(tasks.map((entry, i) => i === index ? { ...entry, done: check.checked } : entry));
      });
      const text = document.createElement("span");
      text.textContent = task.text;
      if (task.done) text.className = "todo-done";
      label.append(check, text);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary";
      remove.textContent = "刪除";
      remove.setAttribute("aria-label", "刪除待辦：" + task.text);
      remove.addEventListener("click", () => update(tasks.filter((_, i) => i !== index)));
      item.append(label, remove);
      list.append(item);
    }
    document.getElementById("todo-count").textContent =
      tasks.length ? `未完成 ${tasks.filter(task => !task.done).length} / 共 ${tasks.length} 項` : "目前沒有待辦事項。";
  }

  // 先儲存再更新畫面；儲存失敗時保留原清單及輸入，讓使用者重試。
  function update(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      tasks = next;
      render();
      status.textContent = "已儲存。";
      return true;
    } catch {
      status.textContent = "儲存失敗，請再試一次。";
      render();
      return false;
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(saved) || saved.some(task =>
      !task || typeof task.text !== "string" || !task.text.trim() ||
      task.text.length > 200 || typeof task.done !== "boolean")) throw Error("invalid data");
    tasks = saved;
  } catch {
    status.textContent = "無法讀取已儲存的待辦清單，請稍後重新開啟。";
    // 避免下一次操作覆寫無法讀取的資料。
    input.disabled = true;
    document.getElementById("todo-add").disabled = true;
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (input.disabled) return;
    const text = input.value.trim();
    if (!text || text.length > 200) {
      status.textContent = "請輸入 1～200 字的待辦事項。";
      return;
    }
    if (update([...tasks, { text, done: false }])) {
      input.value = "";
      input.focus();
    }
  });
  render();
})();
