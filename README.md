# TAIDE Multimodal Dashboard

從 `dashboard.html` 重構成的正式 Next.js 網站, 支援團隊登入編輯、資料庫儲存、Vercel 一鍵部署。

## 🛠 技術棧

- **Next.js 14** (App Router) + TypeScript
- **Postgres** (Neon serverless) + Drizzle ORM
- **Auth.js v5** + GitHub OAuth (含白名單權限控制)
- **Vercel** 部署

## 📁 專案結構

```
taide-dashboard/
├── app/
│   ├── api/                 # 後端 API (datasets / models / tasks / tags)
│   │   └── auth/            # GitHub OAuth callback
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx             # 首頁 -> 渲染 Dashboard
│   └── providers.tsx        # SessionProvider 包裝
├── components/
│   ├── Dashboard.tsx        # 主畫面 (top nav + tabs + grids)
│   ├── Cards.tsx            # DatasetCard / ModelCard / TaskCard
│   ├── Chips.tsx            # 共用小元件 (Chip, StatusChip, Metric, etc.)
│   ├── DatasetForm.tsx      # 新增/編輯 dataset 表單
│   ├── ModelForm.tsx        # 新增/編輯 model 表單
│   ├── TaskForm.tsx         # 新增/編輯 task 表單
│   ├── TagInput.tsx         # 標籤輸入 (含自動完成)
│   ├── Modal.tsx            # 通用 Modal + Button
│   └── AuthButton.tsx       # 登入/登出按鈕
├── lib/
│   ├── schema.ts            # Drizzle schema (datasets/models/tasks/global_tags)
│   ├── db.ts                # 資料庫連線
│   ├── auth.ts              # Auth.js 設定 + 權限檢查
│   └── tokens.ts            # 設計 tokens (顏色/狀態/優先度)
├── scripts/
│   └── seed.ts              # 把原 dashboard.html 的資料塞進 DB
├── drizzle.config.ts
└── .env.example             # 環境變數範本
```

---

## 🚀 本地開發步驟

### 1. 安裝依賴

```bash
npm install
# 或 pnpm install / yarn
```

### 2. 建立 Neon 資料庫

1. 到 [neon.tech](https://neon.tech) 註冊（免費方案夠用，3 GB 儲存）
2. 建立一個新 Project, 名字隨便取（例如 `taide-dashboard`）
3. 從 Dashboard 複製 **Connection string**, 形式類似:
   ```
   postgres://user:pass@xxx.neon.tech/dbname?sslmode=require
   ```

### 3. 建立 GitHub OAuth App

1. 到 [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. 填寫:
   - **Application name**: TAIDE Dashboard (Local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. 建立後記下 **Client ID**, 並產生一組 **Client Secret**

### 4. 設定環境變數

複製範本:

```bash
cp .env.example .env.local
```

編輯 `.env.local`:

```bash
DATABASE_URL="postgres://...你的 Neon connection string"
AUTH_SECRET="..." # 用 `openssl rand -base64 32` 產生
AUTH_GITHUB_ID="...你的 GitHub Client ID"
AUTH_GITHUB_SECRET="...你的 GitHub Client Secret"
ALLOWED_GITHUB_USERS="bear7011" # 允許編輯的 GitHub 帳號 (逗號分隔)
```

### 5. 建表 + 灌入初始資料

```bash
npm run db:push   # 建立資料表
npm run db:seed   # 把原 dashboard.html 資料塞進去
```

### 6. 啟動開發伺服器

```bash
npm run dev
```

開 [http://localhost:3000](http://localhost:3000) 就能看到網站。

---

## 🌐 Vercel 部署步驟

### 1. 推上 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:你的帳號/taide-dashboard.git
git push -u origin main
```

### 2. 在 Vercel 匯入專案

1. 到 [vercel.com](https://vercel.com) 點 **Add New → Project**
2. 選你剛 push 的 repo
3. **Framework Preset** 會自動偵測為 Next.js
4. 不用改任何 Build settings

### 3. 設定 Vercel 環境變數

在 Vercel Project → **Settings → Environment Variables** 加上:

| Name | Value |
|------|-------|
| `DATABASE_URL` | (你的 Neon connection string) |
| `AUTH_SECRET` | (隨機字串, 同本地) |
| `AUTH_GITHUB_ID` | (新建一個 production 用的 GitHub OAuth App) |
| `AUTH_GITHUB_SECRET` | (對應 secret) |
| `ALLOWED_GITHUB_USERS` | (你和團隊的 GitHub username, 逗號分隔) |

> ⚠️ **重要**: GitHub OAuth App 要建一個新的 production 用, callback URL 改為:
> `https://你的網域.vercel.app/api/auth/callback/github`

### 4. 部署

點 **Deploy**。第一次部署完成後:

- 在本地執行 `npm run db:push` 把 schema 推到正式資料庫（如果還沒做）
- 執行 `npm run db:seed` 灌入初始資料（如果想要）

之後每次 `git push` 到 main 分支, Vercel 都會自動重新部署 ✨

---

## ✏️ 功能說明

### 沒登入

- 可以瀏覽全部 datasets / models / tasks
- 看不到「+ Dataset」「+ Model」「+ Task」按鈕
- 卡片上沒有 EDIT / DEL 按鈕

### 登入後且在白名單內

- 卡片右上角顯示 EDIT / DEL 按鈕
- 各區塊頂部有「+ 新增」按鈕
- 點開新增/編輯 modal 可以設定所有欄位

### Tag 系統 (你說的「新增 label」)

兩種都做好了:

1. **新增整張卡片** (dataset/model/task) — 用 `+` 按鈕
2. **新增自訂 tag** — 在表單的 Tags 欄位輸入文字按 Enter 即可
   - 全域 tag 字典會自動記錄, 下次新增時會出現在自動完成下拉
   - 越常用的 tag 排越前面

---

## 🐛 常見問題

**Q: Vercel 部署後登入失敗**
A: 檢查 GitHub OAuth App 的 callback URL 是不是 production 網域 + `/api/auth/callback/github`

**Q: API 回傳 401 Unauthorized**
A: 你的 GitHub username 不在 `ALLOWED_GITHUB_USERS` 白名單內。檢查環境變數, 用全小寫 username。

**Q: 想改 schema (加新欄位)**
A: 改 `lib/schema.ts` → 跑 `npm run db:push` → 對應的 Form 元件加上新欄位即可。

**Q: 免費額度夠嗎?**
A: Vercel Hobby 對個人/研究用綽綽有餘。Neon 免費方案 0.5 GB 計算 + 3 GB 儲存, 你這種 metadata 資料量用一輩子都用不完。

---

## 📌 你還可以加的功能 (架構都已預留)

- 🔍 搜尋框（API 已支援, 加個 input 串 query 就好）
- 📊 統計圖表（recharts 一插就能用）
- 📝 編輯歷史（schema 已有 `createdBy`, 加個 `updatedBy` 和 history table 即可）
- 🔔 訊息通知（Vercel 提供 webhook, 改完通知 Slack）
- 🌐 多語言支援
