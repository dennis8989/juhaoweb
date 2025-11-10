# 網頁分析工具

這個工具可以幫助您分析網站的技術實現、使用的框架和庫。

## 安裝依賴

```bash
pip install -r requirements.txt
```

## 使用方法

```bash
python analyze_website.py
```

## 功能

這個工具會分析以下內容：

1. **技術棧檢測**
   - React, Vue.js, Angular
   - jQuery, Bootstrap, Tailwind CSS
   - Next.js, GSAP, Three.js 等

2. **HTML 結構分析**
   - 標題和 Meta 標籤
   - 響應式設計檢測

3. **資源分析**
   - CSS 文件（外部和內聯）
   - JavaScript 文件（外部和內聯）
   - 圖片資源

4. **特殊功能檢測**
   - PWA 支持
   - 自定義字體
   - 動畫庫

5. **性能優化檢測**
   - 資源預加載
   - DNS 預解析

分析結果會保存到 `website_analysis.json` 文件中。

