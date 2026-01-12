# 手動部署靜態網頁指南

本文檔說明如何手動將此應用部署為靜態網頁到 GitHub Pages 或其他靜態網站託管服務。

## 方法一：GitHub Pages（使用 gh-pages 分支）

### 步驟 1：構建靜態文件

在項目根目錄執行以下命令：

```bash
npm install
npm run build
```

這會在 `dist` 目錄生成靜態文件。

### 步驟 2：推送 dist 目錄到 gh-pages 分支

#### 方法 A：使用 Git 命令

```bash
# 進入 dist 目錄
cd dist

# 初始化 git（如果還沒有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Deploy static site"

# 添加遠程倉庫（替換 YOUR_USERNAME 和 YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 gh-pages 分支
git branch -M gh-pages
git push -u origin gh-pages --force
```

#### 方法 B：從項目根目錄推送

```bash
# 構建後，在項目根目錄執行
git subtree push --prefix dist origin gh-pages
```

或者使用更簡單的方法：

```bash
# 構建項目
npm run build

# 複製 dist 目錄內容到臨時目錄
cp -r dist ../dist-temp

# 切換到 gh-pages 分支
git checkout -b gh-pages

# 刪除所有文件（除了 .git）
git rm -rf .

# 複製 dist 內容回來
cp -r ../dist-temp/* .

# 提交並推送
git add .
git commit -m "Deploy static site"
git push origin gh-pages --force

# 切換回主分支
git checkout main
```

### 步驟 3：在 GitHub 上啟用 Pages

1. 進入您的 GitHub 倉庫
2. 點擊 **Settings**（設置）
3. 在左側菜單中找到 **Pages**
4. 在 **Source** 中選擇 **Deploy from a branch**
5. 選擇 **gh-pages** 分支
6. 選擇 **/ (root)** 目錄
7. 點擊 **Save**

幾分鐘後，您的網站將可在 `https://YOUR_USERNAME.github.io/YOUR_REPO/` 訪問。

---

## 方法二：GitHub Pages（使用 docs 文件夾）

### 步驟 1：修改構建輸出目錄

修改 `vite.config.ts`：

```typescript
build: {
  outDir: 'docs',  // 改為 docs
  assetsDir: 'assets',
}
```

或者創建一個構建腳本，將 dist 複製到 docs：

```bash
npm run build
cp -r dist/* docs/
```

### 步驟 2：提交並推送

```bash
git add docs
git commit -m "Add docs folder for GitHub Pages"
git push origin main
```

### 步驟 3：在 GitHub 上設置

1. 進入倉庫的 **Settings** → **Pages**
2. 在 **Source** 中選擇 **Deploy from a branch**
3. 選擇 **main** 分支
4. 選擇 **/docs** 目錄
5. 點擊 **Save**

---

## 方法三：使用 GitHub Pages（自動部署 - 推薦）

如果您已經配置了 GitHub Actions（`.github/workflows/deploy.yml`），只需：

1. 確保倉庫設置中啟用了 **GitHub Pages**
2. 推送到 `main` 或 `master` 分支：

```bash
git add .
git commit -m "Update site"
git push origin main
```

GitHub Actions 會自動構建並部署到 GitHub Pages。

---

## 方法四：使用 gh-pages npm 套件（最簡單）

### 安裝 gh-pages

```bash
npm install --save-dev gh-pages
```

### 添加部署腳本到 package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 執行部署

```bash
npm run deploy
```

這會自動構建並推送到 gh-pages 分支。

---

## 方法五：其他靜態網站託管服務

### Netlify

1. 訪問 [netlify.com](https://www.netlify.com)
2. 註冊/登入帳號
3. 點擊 **Add new site** → **Deploy manually**
4. 將 `dist` 文件夾拖放到頁面上
5. 完成！

或者使用 Netlify CLI：

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Vercel

1. 訪問 [vercel.com](https://www.vercel.com)
2. 註冊/登入
3. 點擊 **Add New Project**
4. 導入您的 GitHub 倉庫
5. 構建命令：`npm run build`
6. 輸出目錄：`dist`
7. 點擊 **Deploy**

或使用 Vercel CLI：

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Cloudflare Pages

1. 訪問 [pages.cloudflare.com](https://pages.cloudflare.com)
2. 連接 GitHub 倉庫
3. 構建命令：`npm run build`
4. 輸出目錄：`dist`
5. 點擊 **Save and Deploy**

---

## 重要提示

1. **確保 base 路徑正確**：如果部署到子路徑（如 `/your-repo/`），需要在 `vite.config.ts` 中設置 `base: '/your-repo/'`

2. **環境變量**：如果使用環境變量，需要確保在構建時正確設置

3. **清除緩存**：部署後如果看不到更新，嘗試清除瀏覽器緩存或使用無痕模式

4. **HTTPS**：GitHub Pages、Netlify、Vercel 都自動提供 HTTPS

5. **自定義域名**：所有上述服務都支持自定義域名設置

---

## 快速檢查清單

- [ ] 執行 `npm install` 安裝依賴
- [ ] 執行 `npm run build` 構建靜態文件
- [ ] 檢查 `dist` 目錄是否包含所有文件
- [ ] 選擇部署方法（GitHub Pages / Netlify / Vercel 等）
- [ ] 配置域名和 HTTPS（可選）
- [ ] 測試網站功能是否正常

