(function () {
  "use strict";

  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");
  const revealBtn = document.getElementById("reveal");
  const nextBtn = document.getElementById("next");
  const categoryEl = document.getElementById("category");
  const copyBtn = document.getElementById("copy");
  const copyStatus = document.getElementById("copy-status");
  let jokes = [];
  let queue = [];
  let currentJoke = null;
  let copying = false;
  let viewVersion = 0;

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showNextJoke() {
    viewVersion++;
    copyStatus.textContent = "";
    answerEl.textContent = "";
    answerEl.hidden = true;
    if (jokes.length === 0) {
      currentJoke = null;
      questionEl.textContent = "目前沒有可顯示的笑話。";
      revealBtn.disabled = true;
      nextBtn.disabled = true;
      copyBtn.disabled = true;
      return;
    }
    if (queue.length === 0) queue = shuffle(jokes);
    currentJoke = queue.pop();
    questionEl.textContent = currentJoke.q;
    answerEl.textContent = currentJoke.a;
    revealBtn.disabled = false;
    nextBtn.disabled = false;
    copyBtn.disabled = copying;
  }

  function changeCategory() {
    // 分類前仍一律經過 isHonestJoke()，不直接讀取原始笑話庫。
    jokes = window.JokeHub.getHonestJokes(categoryEl.value);
    queue = [];
    showNextJoke();
  }

  revealBtn.addEventListener("click", () => {
    if (!currentJoke) return;
    answerEl.hidden = false;
    revealBtn.disabled = true;
  });
  nextBtn.addEventListener("click", showNextJoke);
  categoryEl.addEventListener("change", changeCategory);
  copyBtn.addEventListener("click", async () => {
    if (!currentJoke || copying) return;
    const version = viewVersion;
    const text = currentJoke.q + "\n" + currentJoke.a;
    copying = true;
    copyBtn.disabled = true;
    copyStatus.textContent = "複製中…";
    try {
      await navigator.clipboard.writeText(text);
      if (version === viewVersion) copyStatus.textContent = "已複製題目與答案！";
    } catch {
      if (version === viewVersion) copyStatus.textContent = "複製失敗，請再試一次。";
    } finally {
      copying = false;
      copyBtn.disabled = !currentJoke;
    }
  });

  changeCategory();
})();
