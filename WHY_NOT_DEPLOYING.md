# 為什麼修改文件後不會自動重新部署？

## 🔍 檢查清單（按順序檢查）

### ✅ 1. 確認 GitHub Actions 工作流文件已推送

**檢查步驟：**
- 前往您的 GitHub 倉庫
- 查看是否有 `.github/workflows/deploy.yml` 文件
- 如果沒有，說明工作流文件沒有被推送到 GitHub

**解決方法：**
```bash
# 確認文件已添加並提交
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

### ✅ 2. 確認 GitHub Pages 的 Source 設置正確（最常見的問題）

**檢查步驟：**
1. 前往 GitHub 倉庫 → **Settings** → **Pages**
2. 查看 **Source** 的設置

**❌ 錯誤設置：**
- Source 選擇了 "Deploy from a branch"
- 選擇了 `gh-pages` 或 `main` 分支

**✅ 正確設置：**
- Source 選擇 **"GitHub Actions"**
- 不應該選擇任何分支

**如果設置錯誤，修改步驟：**
1. 在 Source 下拉選單中選擇 **"GitHub Actions"**
2. 點擊 **Save**
3. 這會立即觸發部署（如果工作流文件存在）

---

### ✅ 3. 確認推送到正確的分支

GitHub Actions 工作流只會在推送到 `main` 或 `master` 分支時觸發。

**檢查步驟：**
- 在 GitHub 倉庫頁面，查看當前分支名稱
- 確認您在 `main` 或 `master` 分支上

**如果分支名稱不同：**
- 修改 `.github/workflows/deploy.yml` 文件，在工作流的 `branches` 部分添加您的分支名稱
- 或者切換到 `main` 分支

---

### ✅ 4. 檢查 GitHub Actions 是否被觸發

**檢查步驟：**
1. 前往 GitHub 倉庫 → **Actions** 標籤
2. 查看是否有 "Deploy to GitHub Pages" 工作流運行記錄
3. 查看最新的運行狀態：
   - ✅ 綠色勾號 = 成功
   - ❌ 紅色叉號 = 失敗（點擊查看錯誤訊息）
   - 🟡 黃色圓圈 = 正在運行

**如果沒有任何工作流記錄：**
- 說明工作流文件可能沒有被推送，或格式有誤

**如果有運行但失敗：**
- 點擊失敗的工作流運行記錄
- 查看錯誤訊息並修復

---

### ✅ 5. 確認 GitHub Actions 已啟用

**檢查步驟：**
1. 前往 GitHub 倉庫 → **Settings** → **Actions** → **General**
2. 確認 "Actions permissions" 設置為：
   - ✅ "Allow all actions and reusable workflows"
   - 或至少允許使用 Actions

---

### ✅ 6. 手動觸發部署（測試用）

即使自動觸發不工作，您也可以手動觸發：

1. 前往 GitHub 倉庫 → **Actions** 標籤
2. 選擇 "Deploy to GitHub Pages" 工作流
3. 點擊右側的 **"Run workflow"** 按鈕
4. 選擇分支（通常是 `main`）
5. 點擊 **"Run workflow"**

如果手動觸發成功，說明工作流配置正確，問題可能是自動觸發設置。

---

## 🎯 最可能的問題和解決方案

### 問題 A：GitHub Pages Source 設置錯誤（80% 的情況）

**症狀：**
- 修改文件並推送，但沒有自動部署
- Actions 標籤中沒有工作流運行記錄

**解決方案：**
1. Settings → Pages → Source
2. 選擇 **"GitHub Actions"**（不是 "Deploy from a branch"）
3. Save

---

### 問題 B：工作流文件沒有被推送到 GitHub

**症狀：**
- 本地有 `.github/workflows/deploy.yml` 文件
- 但 GitHub 上沒有這個文件
- Actions 標籤中沒有任何工作流

**解決方案：**
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

---

### 問題 C：推送到錯誤的分支

**症狀：**
- 推送後沒有觸發工作流
- 但 GitHub Pages Source 設置正確

**解決方案：**
- 確認您推送到 `main` 或 `master` 分支
- 或修改工作流文件以包含您的分支名稱

---

### 問題 D：工作流執行失敗

**症狀：**
- Actions 標籤中有工作流運行記錄
- 但狀態是失敗（紅色叉號）

**解決方案：**
1. 點擊失敗的工作流運行記錄
2. 查看錯誤訊息
3. 常見錯誤：
   - 構建失敗（檢查代碼錯誤）
   - 權限問題（檢查 Pages 設置）
   - 環境變數缺失（如果使用 secrets）

---

## 📋 快速診斷流程

1. **檢查 GitHub Pages Source 設置**
   - Settings → Pages → Source 應該是 "GitHub Actions"

2. **檢查工作流文件是否存在**
   - 在 GitHub 上確認 `.github/workflows/deploy.yml` 存在

3. **檢查 Actions 標籤**
   - 是否有工作流運行記錄？
   - 狀態是成功還是失敗？

4. **手動觸發測試**
   - Actions → Deploy to GitHub Pages → Run workflow
   - 如果手動觸發成功，問題是自動觸發
   - 如果手動觸發失敗，查看錯誤訊息

---

## 🔧 完整設置步驟（從頭開始）

如果您想重新設置自動部署：

1. **確認工作流文件存在並已推送**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add deployment workflow"
   git push origin main
   ```

2. **設置 GitHub Pages**
   - Settings → Pages → Source → 選擇 "GitHub Actions" → Save

3. **測試部署**
   - 修改任何文件
   - 提交並推送
   - 前往 Actions 標籤查看部署狀態

4. **等待部署完成**
   - 通常需要 1-3 分鐘
   - 部署完成後網站會自動更新

---

## 💡 提示

- GitHub Actions 工作流只在推送到 GitHub 後才會運行
- 本地修改不會觸發部署，必須推送
- 部署通常需要 1-3 分鐘完成
- 部署完成後，網站更新可能需要幾秒到幾分鐘才會生效（緩存）

