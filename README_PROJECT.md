# Soul System 網站

這是一個使用 React + Vite 構建的現代化單頁應用網站，參考了 andrewisfrequency.com 的技術架構。

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

網站將在 `http://localhost:5173` 啟動

### 構建生產版本

```bash
npm run build
```

構建的文件將輸出到 `dist/` 目錄

### 預覽生產版本

```bash
npm run preview
```

## 📁 項目結構

```
soul-system-website/
├── index.html          # HTML 入口文件
├── vite.config.js      # Vite 配置文件
├── package.json        # 項目依賴配置
├── src/
│   ├── main.jsx        # React 應用入口
│   ├── App.jsx         # 主應用組件
│   ├── App.css         # 主樣式文件
│   └── index.css       # 全局樣式
└── dist/               # 構建輸出目錄（構建後生成）
```

## 🎨 功能特點

- ✨ 現代化的 UI 設計
- 🎭 流暢的動畫效果
- 📱 完全響應式設計
- ⚡ 使用 Vite 構建，極速開發體驗
- 🎯 SEO 優化（Meta 標籤、Open Graph）
- 🌈 漸變背景和動態效果

## 🛠️ 技術棧

- **React 18** - 前端框架
- **Vite** - 構建工具
- **CSS3** - 樣式和動畫
- **ES6+** - 現代 JavaScript

## 📦 部署

### 部署到 Cloudflare Pages

1. 構建項目：`npm run build`
2. 將 `dist/` 目錄上傳到 Cloudflare Pages
3. 設置構建命令：`npm run build`
4. 設置輸出目錄：`dist`

### 部署到其他平台

任何支持靜態網站託管的平台都可以：
- Vercel
- Netlify
- GitHub Pages
- 等等

## 🎯 自定義

### 修改顏色主題

編輯 `src/index.css` 中的 CSS 變量：

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  /* ... */
}
```

### 修改內容

編輯 `src/App.jsx` 中的組件內容

### 添加新頁面

在 `src/App.jsx` 中添加新的組件和路由

## 📝 許可證

MIT License

