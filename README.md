# TAIDE Multimodal Dashboard

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

