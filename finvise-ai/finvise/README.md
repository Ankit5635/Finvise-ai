# ⚡ FinVise AI — Indian Stock Market Intelligence Platform

> **AI-powered stock analysis + auto-generated 90-second video briefs for the Indian market (NSE/BSE)**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit-orange)](https://your-finvise.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-blue)](https://your-finvise-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 📸 Demo

| Stock Dashboard | AI Brief Script | Auto-Generated Video |
|:-:|:-:|:-:|
| Real-time NSE price data | LLM-structured 90s script | gTTS + MoviePy MP4 |

> Sample video: [finvise-RELIANCE-sample.mp4](./sample_output/finvise_sample.mp4)

---

## 🏗️ What I Built

A **full-stack AI stock intelligence platform** that does 5 things in a single click:

1. **Fetches real-time NSE/BSE stock data** — OHLCV, 52-week range, P/E, market cap via `yfinance`
2. **Fetches recent news** — NewsAPI → Google News RSS → ET Markets RSS (cascading fallback)
3. **Generates a structured AI brief** via Groq (Llama-3 free tier) → Gemini Flash fallback → deterministic fallback
4. **Displays a polished React dashboard** — price card, 52-week slider, 5-section brief viewer, news feed
5. **Auto-generates a 90-second MP4 video** — gTTS voiceover + Pillow slides + MoviePy assembly, fully downloadable

### Architecture Diagram

```
User Browser (React/Vercel)
        │
        │  POST /api/analyse
        ▼
FastAPI Backend (Render)
   ├── yfinance  ──→  Stock OHLCV data
   ├── NewsAPI/RSS ─→  News headlines
   ├── Groq API  ──→  AI brief (JSON)
   │   └── Gemini  ─→  (fallback)
   │       └── static → (no-key fallback)
   └── Background job:
        ├── gTTS  ──→  MP3 per section
        ├── Pillow ─→  Slide images
        └── MoviePy → MP4 (served at /videos/)
```

---

## 🎬 Video Brief Format

The AI-generated brief follows the exact 90-second timed structure:

| Segment | Timing | Content |
|---------|--------|---------|
| 🎣 Hook | 0–10 sec | Punchy opening to grab attention |
| 📊 Stock Snapshot | 10–30 sec | Price, movement, 52-week context in plain English |
| 📰 What's Happening | 30–60 sec | 2–3 key news events explained simply |
| 💡 Beginner Takeaway | 60–80 sec | What this means for first-time investors |
| 📢 Call to Action | 80–90 sec | Neutral educational closing |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + plain CSS | Full SPA, no framework overhead, precise custom styling |
| **Backend** | FastAPI + Uvicorn | Async, fast, clean REST API with background tasks |
| **Stock Data** | yfinance (`.NS` suffix) | Free, reliable NSE data, no API key needed |
| **News** | NewsAPI → Google News RSS → ET Markets RSS | 3-tier fallback, always returns data |
| **LLM** | Groq (Llama-3-8b) → Gemini 1.5 Flash | Both free tier; Groq is fast (Llama inference), Gemini as backup |
| **TTS** | gTTS (Google TTS, free) | No API key, Indian-English accent (`tld=co.in`) |
| **Video** | MoviePy + Pillow | Pure Python, fully free, no account needed, outputs MP4 |
| **Frontend Deploy** | Vercel | Free tier, instant deploys from GitHub |
| **Backend Deploy** | Render | Free tier Python web service, persistent disk for videos |

### Why gTTS + MoviePy over alternatives?

- **Remotion**: React-based but requires a paid licence for server-side rendering; complex headless Chrome setup
- **Canva API**: Free tier is limited and requires approval; not fully programmatic
- **gTTS + MoviePy**: Zero cost, zero approval, works offline, produces quality MP4 — ideal for a 24-hour build

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- ffmpeg (`brew install ffmpeg` / `apt install ffmpeg`)

### 1. Clone

```bash
git clone https://github.com/yourusername/finvise-ai.git
cd finvise-ai
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — add your Groq/Gemini/NewsAPI keys (all optional, see below)

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Docker (full stack)

```bash
cp backend/.env.example backend/.env  # add your keys
docker-compose up --build
```

Frontend → http://localhost:3000  
Backend  → http://localhost:8000

---

## 🌐 Deployment

### Backend → Render (free tier)

1. Push to GitHub
2. New → Web Service → connect repo → set root dir to `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars (GROQ_API_KEY etc.)
6. Add a **Disk** (1 GB) mounted at `/app/video_output`

### Frontend → Vercel (free tier)

1. Import repo on vercel.com → set root to `frontend`
2. Add env var: `REACT_APP_API_URL=https://YOUR-RENDER-URL.onrender.com`
3. Edit `vercel.json` — replace `YOUR-RENDER-URL` with your actual Render URL
4. Deploy

---

## 🔑 API Keys (All Free Tier, All Optional)

| Key | Service | Free Tier | Get It |
|-----|---------|-----------|--------|
| `GROQ_API_KEY` | Groq | 14,400 req/day | [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | Google Gemini | 1,500 req/day | [aistudio.google.com](https://aistudio.google.com) |
| `NEWSAPI_KEY` | NewsAPI | 100 req/day | [newsapi.org](https://newsapi.org) |

**No keys = no problem.** The app has 3 layers of fallbacks:
1. Groq → Gemini → deterministic template (LLM)
2. NewsAPI → Google News RSS → ET Markets RSS (news)
3. yfinance requires no key at all

---

## 📡 API Reference

### `POST /api/analyse`

```json
{
  "ticker": "RELIANCE",
  "generate_video": true
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "stock": { "price": 2934.5, "change_pct": 1.23, ... },
  "news":  [{ "title": "...", "source": "...", ... }],
  "brief": {
    "hook": "...",
    "stock_snapshot": "...",
    "whats_happening": "...",
    "beginner_takeaway": "...",
    "call_to_action": "..."
  }
}
```

### `GET /api/video/{job_id}`

```json
{
  "job_id": "uuid",
  "status": "done",
  "video_url": "/videos/uuid.mp4"
}
```

Status values: `pending` → `processing` → `done` | `error`

### `GET /api/video/{job_id}/download`

Returns the MP4 file as a direct download.

---

## ⚠️ Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Invalid ticker | `402` with descriptive error message |
| yfinance no data | `502` with fallback message |
| NewsAPI rate limit | Silently falls back to Google News RSS |
| Groq rate limit | Falls back to Gemini, then to static template |
| ffmpeg not installed | Video job returns `error` status; brief still shown |
| Network timeout | `httpx` 10–30s timeouts, handled per-layer |

---

## 🔮 What I'd Improve With More Time

1. **Streaming LLM responses** — show the brief being typed in real-time (SSE)
2. **Better video visuals** — replace Pillow slides with SVG animations or a Remotion integration hosted on Render
3. **Caching layer** — Redis cache on stock data (5-min TTL) to avoid yfinance rate limits under load
4. **Historical chart** — embed a candlestick chart (Plotly/Recharts) in the dashboard
5. **Multi-stock comparison** — side-by-side brief for 2–3 tickers
6. **WhatsApp / Telegram share** — one-tap send of the video brief
7. **User accounts** — save past analyses, favourite stocks, custom watchlist

---

## 📁 Project Structure

```
finvise-ai/
├── backend/
│   ├── main.py            # FastAPI app — stock, news, LLM, video
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Ticker.js
│   │   │   ├── SearchBar.js
│   │   │   ├── Dashboard.js
│   │   │   ├── StockCard.js
│   │   │   ├── BriefCard.js
│   │   │   ├── VideoPanel.js
│   │   │   ├── NewsCard.js
│   │   │   └── SkeletonBlock.js
│   │   └── index.css
│   ├── public/index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## 📄 License

MIT — free to use, fork, and build on.

---

> Built for the FinVise AI Tech Technical Assignment · 2024  
> For educational purposes only. Not investment advice.
