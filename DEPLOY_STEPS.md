# 重新部署步驟指南

## 方法 1：使用 GitHub Actions（推薦）✅

### 步驟 1：提交並推送代碼

在 Cursor 的 Source Control 面板中：
1. 按 `Ctrl+Shift+G` 打開 Source Control
2. 點擊所有變更文件旁的「+」標記，或點擊「Stage All Changes」
3. 在訊息框中輸入提交訊息，例如：「移除考場欄位」
4. 點擊「Commit」
5. 點擊「Sync Changes」或「Push」推送到 GitHub

或者使用終端（Git Bash 或命令提示字元）：
```bash
git add .
git commit -m "移除考場欄位並更新部署配置"
git push origin main
```

### 步驟 2：在 GitHub 上設置 Pages

1. 前往您的 GitHub 倉庫頁面
2. 點擊 **Settings**（設置）
3. 在左側菜單中找到 **Pages**
4. 在 **Source** 中選擇 **GitHub Actions**（重要：不要選擇「Deploy from a branch」）
5. 點擊 **Save**

### 步驟 3：查看部署狀態

1. 前往倉庫的 **Actions** 標籤
2. 您會看到「Deploy to GitHub Pages」工作流正在運行
3. 等待構建完成（通常需要 1-3 分鐘）
4. 部署成功後，綠色勾號表示完成

### 步驟 4：訪問您的網站

部署完成後，網站將在以下地址可用：
- `https://YOUR_USERNAME.github.io/Exam/`（如果倉庫名為 Exam）
- 或查看 Actions 工作流中的部署 URL

---

## 方法 2：使用 npm run deploy（需要本地認證）

### 前提條件

確保已配置 GitHub 認證（Personal Access Token 或 SSH 金鑰）

### 執行步驟

在 Git Bash 或命令提示字元中：

```bash
npm run deploy
```

這會自動：
1. 構建項目（`npm run build`）
2. 將 `dist` 目錄推送到 `gh-pages` 分支

### 在 GitHub 上設置

1. 前往倉庫的 **Settings** → **Pages**
2. 在 **Source** 中選擇 **Deploy from a branch**
3. 選擇 **gh-pages** 分支
4. 選擇 **/ (root)** 目錄
5. 點擊 **Save**

---

## 重要提示

### Base 路徑設置

您的 `vite.config.ts` 中設置了 `base: '/Exam/'`，這表示：

- ✅ 如果您的 GitHub 倉庫名稱是 `Exam`，設置正確
- ❌ 如果倉庫名稱不同，需要修改 `vite.config.ts` 中的 `base` 路徑

例如，如果倉庫名為 `exam-board`，需要改為：
```typescript
base: '/exam-board/',
```

### 環境變數（如果需要）

如果您的應用使用 GEMINI_API_KEY：

**使用 GitHub Actions：**
- 前往倉庫的 **Settings** → **Secrets and variables** → **Actions**
- 點擊 **New repository secret**
- 名稱：`GEMINI_API_KEY`
- 值：您的 API 金鑰

**使用 npm run deploy：**
- 環境變數在構建時不會包含（這是正常的，因為 API 金鑰不應該提交到倉庫）
- 如果需要，請使用環境變數文件（不提交到 git）

---

## 故障排除

### 部署後網站顯示 404

檢查 `vite.config.ts` 中的 `base` 路徑是否與倉庫名稱匹配

### GitHub Actions 部署失敗

1. 前往 **Actions** 標籤查看錯誤訊息
2. 檢查是否有構建錯誤
3. 確認 GitHub Pages 設置正確（Source 選擇「GitHub Actions」）

### 使用 npm run deploy 時認證失敗

參考 `DEPLOY_TROUBLESHOOTING.md` 文件中的認證設置說明

---

## 快速檢查清單

- [ ] 所有變更已提交並推送到 GitHub
- [ ] GitHub Pages 已啟用（Settings → Pages）
- [ ] Source 選擇正確（GitHub Actions 或 gh-pages 分支）
- [ ] `vite.config.ts` 中的 `base` 路徑正確
- [ ] 查看 Actions 標籤確認部署狀態



