# GitHub Pages 部署故障排除指南

## 常見問題與解決方案

### 問題 1：使用 `npm run deploy` 時出現認證錯誤

**錯誤訊息範例：**
```
Error: Command failed: git push --set-upstream origin gh-pages
Permission denied (publickey)
```

**解決方案：**

#### 方法 A：使用 Personal Access Token（推薦）

1. 在 GitHub 上創建 Personal Access Token：
   - 前往 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 點擊 "Generate new token (classic)"
   - 選擇權限：`repo`（完整倉庫權限）
   - 複製生成的 token

2. 使用 token 進行認證：
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git
   npm run deploy
   ```

3. 或者使用環境變數：
   ```bash
   GITHUB_TOKEN=your_token_here npm run deploy
   ```

#### 方法 B：使用 SSH 金鑰（更安全）

1. 生成 SSH 金鑰（如果還沒有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 將公鑰添加到 GitHub：
   - 複製 `~/.ssh/id_ed25519.pub` 的內容
   - 前往 GitHub → Settings → SSH and GPG keys → New SSH key
   - 貼上公鑰並儲存

3. 更改遠程倉庫 URL 為 SSH：
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   npm run deploy
   ```

---

### 問題 2：GitHub Pages 沒有啟用或設置錯誤

**檢查步驟：**

1. 前往 GitHub 倉庫 → Settings → Pages
2. 確認 "Source" 設置：
   - 如果使用 `gh-pages` 分支：選擇 "Deploy from a branch" → `gh-pages` → `/ (root)`
   - 如果使用 GitHub Actions：選擇 "GitHub Actions"
3. 點擊 "Save"
4. 等待幾分鐘讓 GitHub 處理

---

### 問題 3：部署後網站顯示 404 或空白頁

**原因：** `vite.config.ts` 中的 `base` 路徑設置不正確

**當前設置：** `base: '/Exam/'`

**解決方案：**

根據您的 GitHub 倉庫名稱調整 `base` 路徑：

- 如果倉庫名為 `Exam`：保持 `base: '/Exam/'`
- 如果倉庫名為其他名稱（例如 `exam-board`）：改為 `base: '/exam-board/'`
- 如果使用自定義域名：改為 `base: '/'`

**修改 `vite.config.ts`：**
```typescript
export default defineConfig({
  base: '/您的倉庫名稱/',  // 修改這裡
  // ... 其他設置
});
```

修改後需要重新構建和部署：
```bash
npm run build
npm run deploy
```

---

### 問題 4：構建失敗

**檢查項目：**

1. 確認所有依賴已安裝：
   ```bash
   npm install
   ```

2. 嘗試本地構建：
   ```bash
   npm run build
   ```
   如果本地構建失敗，先修復構建錯誤

3. 檢查 TypeScript 錯誤：
   ```bash
   npx tsc --noEmit
   ```

---

### 問題 5：使用 GitHub Actions 自動部署（推薦方法）

**優點：**
- 不需要本地認證
- 自動化部署流程
- 構建日誌清晰可見

**設置步驟：**

1. 已為您創建 `.github/workflows/deploy.yml` 文件

2. 在 GitHub 上啟用 Pages：
   - 前往 Settings → Pages
   - Source 選擇 "GitHub Actions"

3. 如果使用環境變數（如 GEMINI_API_KEY）：
   - 前往 Settings → Secrets and variables → Actions
   - 點擊 "New repository secret"
   - 名稱：`GEMINI_API_KEY`
   - 值：您的 API 金鑰

4. 推送代碼到 main 分支：
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

5. 查看部署狀態：
   - 前往倉庫的 "Actions" 標籤
   - 查看工作流運行狀態

---

### 問題 6：gh-pages 分支不存在或推送失敗

**解決方案：**

1. 確認遠程倉庫 URL 正確：
   ```bash
   git remote -v
   ```

2. 如果 URL 不正確，設置正確的 URL：
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   ```

3. 手動創建並推送 gh-pages 分支：
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

---

### 問題 7：Windows 路徑或編碼問題

如果在 Windows 上遇到路徑問題：

1. 使用 Git Bash 或 WSL 而不是 PowerShell
2. 或者在項目根目錄使用完整路徑：
   ```bash
   cd "D:\Cursor_ai_output\電子白板"
   npm run deploy
   ```

---

## 快速檢查清單

部署前確認：

- [ ] 已執行 `npm install` 安裝所有依賴
- [ ] `npm run build` 本地構建成功
- [ ] `vite.config.ts` 中的 `base` 路徑正確（匹配倉庫名稱）
- [ ] GitHub 倉庫存在且可訪問
- [ ] GitHub Pages 已在設置中啟用
- [ ] 已設置正確的認證（Token 或 SSH）

---

## 推薦部署方法

### 方法 1：GitHub Actions（最推薦）✅

**優點：**
- 自動化，無需本地配置
- 每次推送 main 分支自動部署
- 構建過程透明可見

**設置：**
1. 使用已創建的 `.github/workflows/deploy.yml`
2. 在 GitHub Settings → Pages 中選擇 "GitHub Actions"
3. 推送代碼即可

### 方法 2：gh-pages npm 套件

**優點：**
- 簡單快速
- 適合手動部署

**缺點：**
- 需要本地認證配置
- 需要手動執行命令

---

## 需要幫助？

如果以上方法都無法解決問題，請提供：
1. 完整的錯誤訊息
2. 使用的部署方法（npm run deploy / GitHub Actions）
3. 操作系統和 Node.js 版本

