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
- [x] 笑話庫：25 則繁體中文笑話（雙關語、腦筋急轉彎）
- [x] 「不說謊」關鍵字過濾，中文用子字串比對，英文用整字比對（避免 `believe` 被誤判為 `lie`）
- [x] 淺色 / 深色模式
- [x] 圖示 16 / 32 / 48 / 128 px
- [x] 自動測試（Node 內建 test runner，3 項測試全數通過）
- [x] README：安裝方式與新增笑話說明

**驗證狀態：** `npm test` 通過；popup 已在無頭 Chromium 中確認畫面正常。
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
tests/jokes.test.js  測試：笑話全部通過過濾、過濾規則正確、無重複
package.json         只有 test 腳本，沒有任何相依套件
README.md            使用者說明
HANDOFF.md           本文件
```

笑話資料格式：`{ q: "題目", a: "答案" }`。

## 4. 開發與測試

- 需要 Node.js 18 以上（開發時使用 v22），不需要 `npm install`。
- 執行測試：`npm test`
- 手動測試：Chrome 開啟 `chrome://extensions` → 開啟「開發人員模式」→「載入未封裝項目」→ 選專案資料夾。
  修改程式後在擴充功能頁按重新整理圖示即可。
- 純靜態專案，沒有打包或建置步驟；Manifest V3 禁止遠端程式碼與 inline script，
  JavaScript 一律放在獨立的 .js 檔中。

## 5. Git 分支

- 目前所有程式碼在 `claude/bold-pascal-s3uagm` 分支（也是 GitHub 上目前的預設分支）。
- 建議接手後從這個分支開新分支開發，完成後再開 Pull Request。

## 6. 建議的下一步（依優先順序）

1. **擴充笑話庫**：增加到 50 則以上，維持繁體中文、全年齡、不含說謊題材；
   考慮把笑話移到 `jokes.json` 方便維護（記得 popup 仍需經過 `isHonestJoke()`）。
2. **笑話分類**：例如「腦筋急轉彎 / 雙關語 / 冷笑話」，popup 加上分類切換。
3. **複製與分享**：加入「複製笑話」按鈕（使用 `navigator.clipboard`，不需要額外權限）。
4. **我的最愛**：使用 `chrome.storage.local` 收藏笑話（需在 manifest 加入 `"storage"` 權限）。
5. **多語系**：使用 `_locales/` 支援英文介面。
6. **上架準備**：補隱私權說明、商店截圖、版本號規則，打包成 zip 上架 Chrome Web Store。
7. **CI**：新增 GitHub Actions，在每次 push / PR 時執行 `npm test`。

## 7. 注意事項

- 不要為了簡單功能引入框架或大型相依套件，保持零相依、輕量。
- 若之後接外部笑話 API，必須：在 manifest 宣告 `host_permissions`、處理離線與錯誤狀況、
  並且所有取回的笑話都要先經過 `isHonestJoke()` 過濾。關鍵字過濾無法擋掉所有說謊題材，
  外部來源的笑話最好另外再做人工審核或白名單。
- 每次新增笑話後都要跑 `npm test`。
- 介面文字使用繁體中文。
