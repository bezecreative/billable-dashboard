# BillTrack — ClickUp Billable Hours Dashboard

A premium, real-time billable hours dashboard built on **Next.js + Tailwind CSS** (frontend) and **Python serverless functions** (backend), deployable as a single monorepo on **Vercel**.

---

## 📁 File Structure

```
billable-dashboard/
├── api/
│   └── data.py              ← Python serverless function (Vercel)
├── src/
│   ├── components/
│   │   ├── ClientChart.tsx
│   │   ├── DailyHeatmap.tsx
│   │   ├── EmployeeRings.tsx
│   │   ├── ErrorState.tsx
│   │   ├── GoalTracker.tsx
│   │   ├── Skeleton.tsx
│   │   ├── StatCards.tsx
│   │   ├── SummaryTable.tsx
│   │   └── TopBar.tsx
│   ├── hooks/
│   │   └── useDashboard.ts  ← Data fetching + 5-min auto-refresh
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx        ← Main dashboard page
│   └── styles/
│       └── globals.css
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── requirements.txt
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Deployment (Vercel + GitHub)

### 1. Push to GitHub

```bash
cd billable-dashboard
git init
git add .
git commit -m "Initial commit: BillTrack dashboard"
gh repo create billable-dashboard --private --push --source=.
# or manually create a repo and: git remote add origin <url> && git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Vercel will auto-detect **Next.js** — no framework overrides needed
4. The `vercel.json` registers `api/data.py` as a Python 3.12 serverless function automatically

### 3. Set Environment Variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Environments |
|---|---|---|
| `CLICKUP_TOKEN` | `pk_XXXXXXXX...` | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | *(leave blank)* | All |

Leaving `NEXT_PUBLIC_API_URL` blank means the frontend calls `/api/data` (relative), which Vercel routes to your Python function automatically.

### 4. Deploy

Vercel auto-deploys on every push to `main`. Or trigger manually:

```bash
vercel --prod
```

---

## 🧪 Local Development

```bash
# Install JS dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# Then edit .env.local and add your CLICKUP_TOKEN

# Run dev server (frontend only — Python function needs Vercel CLI for local)
npm run dev

# Run with Python function locally (requires Vercel CLI)
npm i -g vercel
vercel dev
```

> **Note:** `vercel dev` runs both Next.js and the Python serverless function locally using the same routing as production.

---

## ⚙️ How the Python API Works

`/api/data.py` is a pure-stdlib Python handler (no pip dependencies needed):

1. **Authenticates** with ClickUp using `CLICKUP_TOKEN` from env
2. **Discovers** your team → up to 4 Spaces → all Lists (clients) within those spaces
3. **Fetches** time entries within the requested date range
4. **Filters** only `billable: true` entries (or entries tagged "billable")
5. **Aggregates** by employee, client, and day
6. **Computes** pacing vs. Mon–Fri work week goal (default: 80h team total)
7. Returns JSON with CORS headers

### Query Parameters

| Param | Values | Default |
|---|---|---|
| `range` | `this_week`, `last_week`, `this_month`, `last_month`, `custom` | `this_week` |
| `start` | ISO date string (custom range only) | — |
| `end` | ISO date string (custom range only) | — |
| `client` | Client/list name | all |
| `employee` | Employee username or ID | all |
| `history` | `true` / `false` | `false` |

---

## 🎛️ Customization

### Change the Weekly Goal

In `api/data.py`, find `goal: float = 80.0` in both `compute_pacing()` and `build_weekly_history()` and update the default.

### Change Employee Baseline (Utilization Rings)

In `api/data.py`, find `baseline = 32 * weeks_in_range` — change `32` to your expected billable hours per person per week.

### Change Refresh Interval

In `src/hooks/useDashboard.ts`, change:
```ts
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

---

## 🔒 Security Notes

- `CLICKUP_TOKEN` is **only ever read server-side** in the Python function — it is never exposed to the browser
- `NEXT_PUBLIC_API_URL` is intentionally public (it's just a URL)
- The Python handler validates the token is set before making any ClickUp calls
- CORS is permissive (`*`) since this is a read-only API on your own Vercel deployment; restrict to your domain in production if desired

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 14 (Pages Router) |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Python 3.12 (stdlib only) |
| Serverless hosting | Vercel |
| Source control | GitHub |
| Data source | ClickUp API v2 |
