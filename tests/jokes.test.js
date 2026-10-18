const test = require("node:test");
const assert = require("node:assert");
const { JOKES, isHonestJoke, getHonestJokes } = require("../jokes.js");

test("笑話庫中的每一則笑話都不含說謊內容", () => {
  for (const joke of JOKES) {
    assert.ok(isHonestJoke(joke), `含有說謊相關內容：${joke.q} ${joke.a}`);
  }
});

test("含有說謊內容的笑話會被過濾掉", () => {
  assert.strictEqual(isHonestJoke({ q: "他為什麼說謊？", a: "不知道" }), false);
  assert.strictEqual(isHonestJoke({ q: "被騙了怎麼辦？", a: "哈哈" }), false);
  assert.strictEqual(isHonestJoke({ q: "Why?", a: "He is a LIAR." }), false);
  assert.strictEqual(isHonestJoke({ q: "什麼門關不上？", a: "球門。" }), true);
  assert.strictEqual(isHonestJoke({ q: "I believe in you", a: "Thanks!" }), true);
});

test("每則笑話都有題目與答案，且沒有重複", () => {
  const seen = new Set();
  for (const joke of getHonestJokes()) {
    assert.ok(joke.q && joke.a);
    assert.ok(!seen.has(joke.q), `重複的笑話：${joke.q}`);
    seen.add(joke.q);
  }
});
