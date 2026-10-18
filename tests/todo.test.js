const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../todo.js'), 'utf8');

function setup(store = {}, fail = {}) {
  function element() {
    return { children: [], handlers: {}, value: '', disabled: false, textContent: '',
      append(...nodes) { this.children.push(...nodes); },
      replaceChildren() { this.children = []; },
      setAttribute(key, value) { this[key] = value; },
      addEventListener(type, handler) { this.handlers[type] = handler; }, focus() {} };
  }
  const ids = {};
  for (const id of ['todo-form', 'todo-input', 'todo-list', 'todo-status', 'todo-count', 'todo-add']) ids[id] = element();
  vm.runInNewContext(source, {
    document: { getElementById: id => ids[id], createElement: element },
    localStorage: {
      getItem(key) { if (fail.read) throw Error('read'); return store[key] || null; },
      setItem(key, value) { if (fail.write) throw Error('write'); store[key] = value; }
    }
  });
  ids.submit = value => {
    ids['todo-input'].value = value;
    ids['todo-form'].handlers.submit({ preventDefault() {} });
  };
  return ids;
}

test('待辦可新增、完成、取消完成、刪除，重新開啟仍保留', () => {
  const store = {};
  let el = setup(store);
  el.submit('  準備課程  ');
  el.submit('整理筆記');
  assert.equal(el['todo-input'].value, '');
  assert.equal(el['todo-count'].textContent, '未完成 2 / 共 2 項');
  let check = el['todo-list'].children[0].children[0].children[0];
  check.checked = true;
  check.handlers.change();
  el = setup(store);
  assert.equal(el['todo-count'].textContent, '未完成 1 / 共 2 項');
  assert.equal(el['todo-list'].children[0].children[0].children[1].textContent, '準備課程');
  check = el['todo-list'].children[0].children[0].children[0];
  assert.equal(check.checked, true);
  check.checked = false;
  check.handlers.change();
  assert.equal(el['todo-count'].textContent, '未完成 2 / 共 2 項');
  el['todo-list'].children[0].children[1].handlers.click();
  el = setup(store);
  assert.equal(el['todo-list'].children.length, 1);
  assert.equal(el['todo-list'].children[0].children[0].children[1].textContent, '整理筆記');
});

test('拒絕空白與超長輸入；使用純文字呈現使用者內容', () => {
  const el = setup();
  for (const text of [' ', '字'.repeat(201)]) {
    el.submit(text);
    assert.equal(el['todo-list'].children.length, 0);
    assert.match(el['todo-status'].textContent, /1～200/);
  }
  el.submit('<img src=x onerror=alert(1)>');
  const text = el['todo-list'].children[0].children[0].children[1];
  assert.equal(text.textContent, '<img src=x onerror=alert(1)>');
  assert.equal(text.children.length, 0);
});

test('寫入失敗保留輸入與舊清單，之後可以重試', () => {
  const fail = {};
  const el = setup({}, fail);
  el.submit('第一項');
  fail.write = true;
  el.submit('第二項');
  assert.equal(el['todo-input'].value, '第二項');
  assert.equal(el['todo-list'].children.length, 1);
  assert.match(el['todo-status'].textContent, /儲存失敗/);
  const check = el['todo-list'].children[0].children[0].children[0];
  check.checked = true;
  check.handlers.change();
  assert.equal(el['todo-list'].children[0].children[0].children[0].checked, false);
  el['todo-list'].children[0].children[1].handlers.click();
  assert.equal(el['todo-list'].children.length, 1);
  fail.write = false;
  el.submit('第二項');
  assert.equal(el['todo-list'].children.length, 2);
});

test('讀取失敗或損壞資料不覆寫原資料', () => {
  for (const saved of ['{', '{}', '[null]', '[{"text":"a","done":"yes"}]']) {
    const store = { 'jokehub.todos.v1': saved };
    const el = setup(store);
    assert.equal(el['todo-input'].disabled, true);
    assert.equal(el['todo-add'].disabled, true);
    assert.match(el['todo-status'].textContent, /無法讀取/);
    el.submit('新內容');
    assert.equal(store['jokehub.todos.v1'], saved);
  }
  assert.equal(setup({}, {read: true})['todo-add'].disabled, true);
});
