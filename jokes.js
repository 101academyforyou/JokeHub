// JokeHub 笑話庫與「不說謊」過濾規則。
// 瀏覽器中會掛在 window.JokeHub；在 Node 中可用 require() 取得（供測試使用）。
(function (root) {
  "use strict";

  // 與說謊、欺騙相關的關鍵字；只要笑話含有任一詞就不會顯示。
  const FORBIDDEN_KEYWORDS = [
    "說謊", "撒謊", "謊言", "謊話", "扯謊", "謊稱", "謊",
    "騙", "欺瞞", "隱瞞", "瞞著", "瞞",
    "吹牛", "唬爛", "唬弄", "糊弄", "胡謅", "瞎掰",
    "假裝", "裝作", "冒充", "偽裝", "造假", "作弊",
    "lie", "lying", "liar", "fake", "cheat", "trick"
  ];

  const JOKES = [
    { q: "為什麼數學課本總是很憂鬱？", a: "因為它裡面有太多問題了。" },
    { q: "小明的爸爸有三個兒子，老大叫大毛，老二叫二毛，老三叫什麼？", a: "叫小明啊！" },
    { q: "什麼東西越洗越髒？", a: "水。" },
    { q: "什麼門永遠關不上？", a: "球門。" },
    { q: "鉛筆姓什麼？", a: "姓蕭（削）。" },
    { q: "哪一種動物最沒有方向感？", a: "麋鹿（迷路）。" },
    { q: "什麼魚不能吃？", a: "木魚。" },
    { q: "為什麼企鵝只有肚子是白的？", a: "因為手太短，只洗得到肚子。" },
    { q: "冰塊最大的願望是什麼？", a: "退伍，因為它當「冰」當太久了。" },
    { q: "什麼人一年只上一天班，還沒人說他偷懶？", a: "聖誕老人。" },
    { q: "熊貓這輩子最大的願望是什麼？", a: "拍一張彩色照片。" },
    { q: "為什麼海是藍色的？", a: "因為魚一直在吐泡泡：blue～blue～blue～" },
    { q: "什麼車寸步難行？", a: "風車。" },
    { q: "哪個字所有人都會念「錯」？", a: "就是「錯」這個字。" },
    { q: "什麼東西越生氣就變得越大？", a: "脾氣。" },
    { q: "什麼動物最會算數？", a: "章魚，牠有八隻手可以幫忙數。" },
    { q: "一年之中哪個月大家講話最少？", a: "二月，因為它天數最少。" },
    { q: "為什麼電腦總是覺得冷？", a: "因為它開了太多視窗（Windows）。" },
    { q: "為什麼程式設計師分不清萬聖節和聖誕節？", a: "因為 Oct 31 = Dec 25。（八進位 31 等於十進位 25）" },
    { q: "為什麼稻草人得了獎？", a: "因為它在自己的領域（field）表現傑出。" },
    { q: "番茄寶寶走太慢，番茄爸爸對它說什麼？", a: "「Ketchup！」（快跟上 catch up）" },
    { q: "布和紙各怕什麼？", a: "布怕一萬，紙怕萬一。" },
    { q: "什麼東西有很多牙齒卻從來不咬人？", a: "梳子。" },
    { q: "什麼路最窄？", a: "冤家路窄。" },
    { q: "為什麼蜜蜂說話總是很甜？", a: "因為牠整天都在採蜜。" }
  ];

  function isHonestJoke(joke) {
    const text = (joke.q + " " + joke.a).toLowerCase();
    return !FORBIDDEN_KEYWORDS.some((word) =>
      // 英文字以完整單字比對，避免 "believe" 這類字誤判為 "lie"。
      /^[a-z]+$/.test(word)
        ? new RegExp("\\b" + word + "\\b").test(text)
        : text.includes(word)
    );
  }

  const api = {
    FORBIDDEN_KEYWORDS,
    JOKES,
    isHonestJoke,
    // 實際提供給畫面的笑話：一律先經過過濾。
    getHonestJokes() {
      return JOKES.filter(isHonestJoke);
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.JokeHub = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
