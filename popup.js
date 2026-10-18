(function () {
  "use strict";

  const jokes = window.JokeHub.getHonestJokes();
  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");
  const revealBtn = document.getElementById("reveal");
  const nextBtn = document.getElementById("next");

  // 洗牌後依序播放，整輪看完前不會重複。
  let queue = [];

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showNextJoke() {
    if (jokes.length === 0) {
      questionEl.textContent = "目前沒有可顯示的笑話。";
      answerEl.hidden = true;
      revealBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    if (queue.length === 0) queue = shuffle(jokes);
    const joke = queue.pop();
    questionEl.textContent = joke.q;
    answerEl.textContent = joke.a;
    answerEl.hidden = true;
    revealBtn.disabled = false;
  }

  revealBtn.addEventListener("click", () => {
    answerEl.hidden = false;
    revealBtn.disabled = true;
  });
  nextBtn.addEventListener("click", showNextJoke);

  showNextJoke();
})();
