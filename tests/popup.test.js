const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const hub = require('../jokes.js');

function setup(writeText = async () => {}, api = hub) {
  const elements = {};
  for (const id of ['question', 'answer', 'reveal', 'next', 'category', 'copy', 'copy-status']) {
    elements[id] = {
      value: id === 'category' ? '全部' : '', textContent: '', disabled: false,
      handlers: {}, addEventListener(event, fn) { this.handlers[event] = fn; }
    };
  }
  vm.runInNewContext(fs.readFileSync(require.resolve('../popup.js'), 'utf8'), {
    window: { JokeHub: api }, document: { getElementById: id => elements[id] },
    navigator: { clipboard: { writeText } }, Math
  });
  elements.change = category => {
    elements.category.value = category;
    elements.category.handlers.change();
  };
  return elements;
}

test('分類切換只顯示該分類、重設答案且每輪不重複', () => {
  const el = setup();
  for (const category of ['全部', ...hub.CATEGORIES]) {
    el.change(category);
    const allowed = hub.getHonestJokes(category);
    const seen = new Set();
    for (let i = 0; i < allowed.length; i++) {
      assert.ok(allowed.some(j => j.q === el.question.textContent));
      assert.ok(!seen.has(el.question.textContent));
      seen.add(el.question.textContent);
      assert.equal(el.answer.hidden, true);
      el.reveal.handlers.click();
      assert.equal(el.answer.hidden, false);
      assert.equal(el.reveal.disabled, true);
      el.next.handlers.click();
    }
    assert.equal(seen.size, allowed.length);
    assert.equal(el.next.disabled, false);
  }
});

test('複製完整題目與答案，不必先揭曉，並顯示成功提示', async () => {
  let copied;
  const el = setup(async text => { copied = text; });
  await el.copy.handlers.click();
  assert.equal(copied, el.question.textContent + '\n' + el.answer.textContent);
  assert.equal(el.answer.hidden, true);
  assert.equal(el['copy-status'].textContent, '已複製題目與答案！');
  assert.equal(el.copy.disabled, false);
  el.next.handlers.click();
  assert.equal(el['copy-status'].textContent, '');
});

test('剪貼簿拒絕或不可用時提供可重試的失敗提示', async () => {
  for (const write of [async () => { throw Error('denied'); }, null]) {
    const el = setup(write);
    await el.copy.handlers.click();
    assert.equal(el['copy-status'].textContent, '複製失敗，請再試一次。');
    assert.equal(el.copy.disabled, false);
  }
});

test('複製期間防止重複送出，切換分類後不顯示過期提示', async () => {
  let finish;
  let calls = 0;
  const el = setup(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  const pending = el.copy.handlers.click();
  assert.equal(el.copy.disabled, true);
  await el.copy.handlers.click();
  assert.equal(calls, 1);
  el.change('冷笑話');
  finish();
  await pending;
  assert.equal(el['copy-status'].textContent, '');
  assert.equal(el.copy.disabled, false);
});

test('空分類停用操作，切回有效分類可恢復', () => {
  const el = setup();
  el.change('不存在');
  assert.equal(el.question.textContent, '目前沒有可顯示的笑話。');
  assert.equal(el.answer.textContent, '');
  for (const id of ['reveal', 'next', 'copy']) assert.equal(el[id].disabled, true);
  el.change('雙關語');
  for (const id of ['reveal', 'next', 'copy']) assert.equal(el[id].disabled, false);
});

test('popup 使用過濾後資料，包含分類切換', () => {
  const bad = {q: '假裝不知道', a: '答案', category: '冷笑話'};
  hub.JOKES.push(bad);
  try {
    const el = setup();
    for (const category of ['全部', '冷笑話']) {
      el.change(category);
      for (let i = 0; i < hub.JOKES.length * 2; i++) {
        assert.notEqual(el.question.textContent, bad.q);
        el.next.handlers.click();
      }
    }
  } finally { hub.JOKES.pop(); }
});

test('Manifest V3 無額外權限、相依套件與 inline script', () => {
  const root = require('node:path').join(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(root + '/manifest.json', 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(root + '/package.json', 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.permissions, undefined);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
  assert.equal(Object.keys(pkg.devDependencies || {}).length, 0);
  const html = fs.readFileSync(root + '/popup.html', 'utf8');
  assert.ok(!/\son\w+\s*=|javascript:/i.test(html));
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    assert.match(script[1], /src="[^" :]+\.js"/);
    assert.equal(script[2].trim(), '');
  }
  for (const category of ['全部', ...hub.CATEGORIES]) assert.ok(html.includes(`value="${category}"`));
});
