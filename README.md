# 隨篩｜聯捷人選篩選台

網站：https://wangdeshian.github.io/resume-filter/

來源：[聯捷印尼引進履歷](https://www.imaid.com.tw/biox/index.php?fun=resume&sales=adam)。

依來源清單對應編號、遮罩姓名、年齡、婚姻、身高、體重、履歷狀態及工作經歷，提供交叉篩選、排序、CSV / JSON 匯出。照護搜尋另外讀取完整履歷的「工作經驗」與「備註」，提供幫傭／家務、照顧小孩、嬰幼兒照顧、煮飯備餐，以及翻身、臥床、移位／抱扶、鼻胃管等原文關鍵字，支援全部／任一條件及自由文字多詞交叉搜尋。可點選「工作記載」核對原文與相符片段。關鍵字只表示文字提及（可能包含否定敘述），不代表能力驗證；未取得或未提及相關資料者不會出現在照護搜尋結果。

另支援自行匯入 Excel、CSV、TSV、JSON、TXT；匯入檔案只在瀏覽器處理。

宗教僅作為原始記載的獨立閱讀資訊，不納入搜尋、篩選、排序或聘用推薦。未列出的經驗不代表沒有經驗。來源資料並非可聘用狀態的保證。

## 更新方式

推送 main、手動執行 Actions 或每小時排程觸發更新與發布。GitHub 排程可能延遲，頁面顯示實際資料取得時間。「載入最新資料」讀取最近一次發布成功的資料，不會直接抓取來源網站。詳細工作經驗、備註與宗教原文每 24 小時重新整理，新增履歷則在下次更新時取得。

如果來源暫時無法讀取，保留最後一次成功的清單並顯示提示；首次建置沒有可用資料時直接失敗。公開資料產物只存於 Pages 發布內容與 Actions 快取，不提交至程式碼歷史。本站未設定任何訪客上傳資料到伺服器的功能。

## 本機開發

需 Node.js 22 或更新版本，無需安裝套件。

```sh
npm run check
npm run build
python -m http.server 4173 --directory site
```

網站由 GitHub Pages 發布；更新入口位於儲存庫的 Actions → Update data and publish website → Run workflow。

Excel 解析使用隨附的 SheetJS Community Edition 0.20.3（Apache-2.0），保留原始授權聲明。
