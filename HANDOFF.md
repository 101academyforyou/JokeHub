# JokeHub 開發交接文件（HANDOFF）

> 給接手的開發者或 AI 編碼助手（例如 Codex）。開始之前請先讀完這份文件和 `README.md`。

## 1. 專案目標

JokeHub 是一個 **Chrome / Edge 瀏覽器插件（Manifest V3）**。
使用者點擊工具列上的圖示，會跳出小視窗（popup）顯示笑話。

### 核心規則（不可違反）

**笑話內容不能包含說謊的內容。** 包括說謊、欺騙、吹牛、假裝、作弊、隱瞞等題材，
也包括笑點建立在某人騙人上的笑話（即使沒有出現關鍵字也不行）。

這條規則目前有兩層保護：
1. 人工挑選：笑話庫裡的每一則都刻意避開這類題材。
2. 程式過濾：`jokes.js` 的 `isHonestJoke()` 會擋掉含有 `FORBIDDEN_KEYWORDS` 關鍵字的笑話，
   畫面只透過 `getHonestJokes()` 取得笑話；`npm test` 會檢查整個笑話庫都通過過濾。

新增或修改功能時，兩層保護都必須保留，所有笑話來源（包括未來的外部 API）都要先經過 `isHonestJoke()`。

## 2. 目前進度（v1.0.0，已完成）

- [x] Manifest V3 插件設定，不需要任何權限、可離線使用
- [x] Popup 小視窗：先顯示題目，按「看答案」揭曉答案，按「下一則」換一則
- [x] 洗牌播放：一輪看完前不會重複
- [x] 笑話庫：55 則繁體中文、全年齡笑話；逐則審閱，避開欺瞞題材
- [x] 分類切換：全部／腦筋急轉彎／雙關語／冷笑話；切換時重新洗牌、收起答案
- [x] 複製完整題目與答案：navigator.clipboard，成功／失敗提示，不新增權限
- [x] 「不說謊」關鍵字過濾，中文用子字串比對，英文用整字比對（避免 `believe` 被誤判為 `lie`）
- [x] 淺色 / 深色模式
- [x] 圖示 16 / 32 / 48 / 128 px
- [x] 自動測試（Node 內建 test runner，15 項測試全數通過，保留原有 3 項測試）
- [x] 待辦清單：新增、勾選／取消完成、刪除、未完成統計，localStorage 自動儲存，無新增權限
- [x] 待辦讀寫失敗提示；寫入失敗不修改原清單，讀取失敗停用新增以避免覆寫資料
- [x] README：安裝方式與新增笑話說明

**本次驗證狀態：** `npm test` 15/15 通過。Node VM 模擬 DOM／剪貼簿驗證分類、每輪去重、答案收合、複製成功／失敗、非同步切換及空分類恢復；另驗證過濾不可繞過、零相依與無新增權限。
待辦資料格式：`[{ text: "事項", done: false }]`；文字限 1～200 字，採 textContent 顯示。資料不會上傳、不跨裝置同步；移除插件或清除其資料會清除清單。待辦文字為使用者自行輸入，不會作為笑話來源；笑話取得與過濾維持原路徑。

**歷史驗證：** 原版 popup 曾在無頭 Chromium 確認畫面；本次未重新執行瀏覽器畫面測試。
**尚未做過：** 實際以「載入未封裝項目」裝進 Chrome 做手動測試。

## 3. 檔案結構

```
manifest.json        插件設定（Manifest V3），popup 指向 popup.html
popup.html           小視窗的 HTML，依序載入 jokes.js、popup.js
popup.css            樣式；顏色定義在 :root 變數，深色模式在 prefers-color-scheme 區塊
popup.js             顯示邏輯：取得 getHonestJokes()、洗牌、看答案 / 下一則
jokes.js             笑話庫 JOKES、FORBIDDEN_KEYWORDS、isHonestJoke()、getHonestJokes()
                     瀏覽器中掛在 window.JokeHub；Node 中可 require()（給測試用）
icons/               插件圖示 PNG
tests/jokes.test.js  測試：笑話全部通過過濾、過濾規則正確、無重複、數量及分類
tests/popup.test.js  Node VM 測試：分類、洗牌、複製與錯誤情境、MV3 限制
todo.js              待辦清單，localStorage key: jokehub.todos.v1
tests/todo.test.js   待辦操作、持久化、輸入驗證、純文字顯示及讀寫失敗
package.json         只有 test 腳本，沒有任何相依套件
README.md            使用者說明
HANDOFF.md           本文件
```

笑話資料格式：`{ q: "題目", a: "答案", category: "腦筋急轉彎" }`。

## 4. 開發與測試

- 需要 Node.js 18 以上（開發時使用 v22），不需要 `npm install`。
- 執行測試：`npm test`
- 手動測試：Chrome 開啟 `chrome://extensions` → 開啟「開發人員模式」→「載入未封裝項目」→ 選專案資料夾。
  修改程式後在擴充功能頁按重新整理圖示即可。
- 純靜態專案，沒有打包或建置步驟；Manifest V3 禁止遠端程式碼與 inline script，
  JavaScript 一律放在獨立的 .js 檔中。

## 5. Git 分支

- 目前所有程式碼在 `claude/bold-pascal-s3uagm` 分支（也是 GitHub 上目前的預設分支）。
- 本次功能分支：`codex/joke-categories-and-copy`，從上述分支建立，PR 目標也是上述分支。

## 6. 建議的下一步（依優先順序）

本次原建議第 1～3 項已完成：55 則笑話、三類分類切換、複製題目與答案。笑話仍保留在 jokes.js，維持同步離線載入。

1. **手動驗收**：Chrome／Edge 載入未封裝項目，確認分類、鍵盤操作、淺深色畫面及實際剪貼簿成功／拒絕情境；待辦新增、完成、刪除後關閉再開啟，確認保留。
2. **CI**：新增 GitHub Actions，在每次 push / PR 時執行 npm test。
3. **我的最愛**：使用 chrome.storage.local 收藏笑話（需新增 storage 權限，另案處理）。
4. **多語系**：使用 _locales/ 支援英文介面。
5. **上架準備**：隱私權說明、商店截圖、版本號規則及 zip 打包。

## 7. 注意事項

- 不要為了簡單功能引入框架或大型相依套件，保持零相依、輕量。
- 若之後接外部笑話 API，必須：在 manifest 宣告 `host_permissions`、處理離線與錯誤狀況、
  並且所有取回的笑話都要先經過 `isHonestJoke()` 過濾。關鍵字過濾無法擋掉所有說謊題材，
  外部來源的笑話最好另外再做人工審核或白名單。
- 每次新增笑話後都要跑 `npm test`。
- 介面文字使用繁體中文。
