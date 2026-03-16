"""
FinVise AI — Indian Stock Market Intelligence Platform
FastAPI Backend: Stock data, News, LLM summaries, Video generation
"""

import os
import re
import json
import uuid
import logging
import tempfile
import textwrap
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import httpx
import yfinance as yf
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import feedparser

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("finvise")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="FinVise AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEO_DIR = Path("video_output")
VIDEO_DIR.mkdir(exist_ok=True)
app.mount("/videos", StaticFiles(directory=str(VIDEO_DIR)), name="videos")

# ── Environment ───────────────────────────────────────────────────────────────
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
NEWSAPI_KEY    = os.getenv("NEWSAPI_KEY", "")

# ── Schemas ───────────────────────────────────────────────────────────────────
class StockRequest(BaseModel):
    ticker: str                  # e.g. RELIANCE or RELIANCE.NS
    generate_video: bool = True

class VideoStatusResponse(BaseModel):
    job_id: str
    status: str                  # pending | processing | done | error
    video_url: Optional[str] = None
    error: Optional[str] = None

# ── In-memory job store ───────────────────────────────────────────────────────
jobs: dict[str, dict] = {}

# ═════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def normalise_ticker(raw: str) -> str:
    """Accept bare ticker (RELIANCE) or suffixed (RELIANCE.NS / RELIANCE.BO)."""
    t = raw.strip().upper()
    if "." not in t:
        t = t + ".NS"           # default to NSE
    return t


def fetch_stock_data(ticker: str) -> dict:
    """Fetch OHLCV + metadata from yfinance."""
    try:
        stock = yf.Ticker(ticker)
        info  = stock.info or {}

        # Fast path: last 5 days so we always get ≥1 trading day
        hist = stock.history(period="5d")
        if hist.empty:
            raise ValueError(f"No price history for {ticker}")

        latest   = hist.iloc[-1]
        prev_row = hist.iloc[-2] if len(hist) >= 2 else latest

        price      = round(float(latest["Close"]), 2)
        prev_close = round(float(prev_row["Close"]), 2)
        change_pct = round(((price - prev_close) / prev_close) * 100, 2) if prev_close else 0.0

        return {
            "ticker":       ticker,
            "company_name": info.get("longName", ticker.replace(".NS", "")),
            "sector":       info.get("sector", "N/A"),
            "price":        price,
            "open":         round(float(latest["Open"]), 2),
            "high":         round(float(latest["High"]), 2),
            "low":          round(float(latest["Low"]), 2),
            "volume":       int(latest["Volume"]),
            "prev_close":   prev_close,
            "change_pct":   change_pct,
            "week_52_high": round(float(info.get("fiftyTwoWeekHigh", 0)), 2),
            "week_52_low":  round(float(info.get("fiftyTwoWeekLow",  0)), 2),
            "market_cap":   info.get("marketCap", 0),
            "pe_ratio":     info.get("trailingPE", None),
            "as_of":        str(hist.index[-1].date()),
        }
    except Exception as e:
        log.error("Stock fetch failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Stock data unavailable: {e}")


def fetch_news(company_name: str, ticker_bare: str) -> list[dict]:
    """Try NewsAPI first, then fall back to Google News RSS."""
    articles = []

    # ── NewsAPI ──────────────────────────────────────────────────────────────
    if NEWSAPI_KEY:
        try:
            url = (
                "https://newsapi.org/v2/everything"
                f"?q={company_name}+stock+NSE"
                "&sortBy=publishedAt&pageSize=5&language=en"
                f"&apiKey={NEWSAPI_KEY}"
            )
            resp = httpx.get(url, timeout=10)
            data = resp.json()
            for a in data.get("articles", [])[:5]:
                articles.append({
                    "title":       a.get("title", ""),
                    "description": a.get("description", ""),
                    "source":      a.get("source", {}).get("name", ""),
                    "url":         a.get("url", ""),
                    "published":   a.get("publishedAt", "")[:10],
                })
            if articles:
                return articles
        except Exception as e:
            log.warning("NewsAPI failed: %s", e)

    # ── Google News RSS fallback ──────────────────────────────────────────────
    try:
        query = f"{company_name} NSE stock"
        rss   = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}&hl=en-IN&gl=IN&ceid=IN:en"
        feed  = feedparser.parse(rss)
        for entry in feed.entries[:5]:
            articles.append({
                "title":       entry.get("title", ""),
                "description": entry.get("summary", ""),
                "source":      "Google News",
                "url":         entry.get("link", ""),
                "published":   entry.get("published", "")[:10],
            })
    except Exception as e:
        log.warning("RSS fetch failed: %s", e)

    # ── ET Markets RSS fallback ───────────────────────────────────────────────
    if not articles:
        try:
            et_rss = "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms"
            feed   = feedparser.parse(et_rss)
            for entry in feed.entries[:5]:
                articles.append({
                    "title":       entry.get("title", ""),
                    "description": entry.get("summary", ""),
                    "source":      "Economic Times",
                    "url":         entry.get("link", ""),
                    "published":   entry.get("published", "")[:10],
                })
        except Exception as e:
            log.warning("ET RSS failed: %s", e)

    return articles[:5]


# ═════════════════════════════════════════════════════════════════════════════
# LLM — Groq (primary) / Gemini (fallback)
# ═════════════════════════════════════════════════════════════════════════════

BRIEF_SYSTEM = """You are FinVise AI, an expert Indian stock market commentator.
Your job is to write a 90-second VIDEO SCRIPT for retail/beginner investors.
Respond ONLY with a valid JSON object — no markdown fences, no extra text.

JSON schema:
{
  "hook":            "<10-second opening — punchy, attention-grabbing>",
  "stock_snapshot":  "<20-second plain-English price movement + 52-week context>",
  "whats_happening": "<30-second explanation of 2-3 key news events, simply explained>",
  "beginner_takeaway": "<20-second what this means for a first-time investor, zero jargon>",
  "call_to_action":  "<10-second neutral educational closing line>"
}

Rules:
- Write in SPOKEN English — contractions, short sentences, natural rhythm.
- No technical jargon without immediate plain-English explanation.
- Each field is exactly the script for that segment, ready to be read aloud.
- Be factually accurate to the data provided.
- Tone: friendly, clear, confident — like a smart friend explaining a stock.
"""

def build_user_prompt(stock: dict, news: list[dict]) -> str:
    news_block = "\n".join(
        f"- [{a['source']}] {a['title']}: {a['description'][:120]}"
        for a in news[:4]
    )
    return f"""
Stock: {stock['company_name']} ({stock['ticker']})
Sector: {stock['sector']}
Date: {stock['as_of']}

PRICE DATA:
  Current Price : ₹{stock['price']}
  Open          : ₹{stock['open']}
  High          : ₹{stock['high']}
  Low           : ₹{stock['low']}
  Prev Close    : ₹{stock['prev_close']}
  Change        : {stock['change_pct']:+.2f}%
  Volume        : {stock['volume']:,}
  52-Week High  : ₹{stock['week_52_high']}
  52-Week Low   : ₹{stock['week_52_low']}

RECENT NEWS:
{news_block if news_block else "No recent news available."}

Write the 90-second video brief JSON now.
"""


def call_groq(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }
    body = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": BRIEF_SYSTEM},
            {"role": "user",   "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens":  900,
    }
    r = httpx.post("https://api.groq.com/openai/v1/chat/completions",
                   json=body, headers=headers, timeout=30)
    r.raise_for_status()
    text = r.json()["choices"][0]["message"]["content"]
    return json.loads(text)


def call_gemini(prompt: str) -> dict:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    )
    body = {
        "contents": [{"parts": [{"text": BRIEF_SYSTEM + "\n\n" + prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 900},
    }
    r = httpx.post(url, json=body, timeout=30)
    r.raise_for_status()
    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    # strip possible markdown fences
    text = re.sub(r"```(?:json)?|```", "", text).strip()
    return json.loads(text)


def generate_brief(stock: dict, news: list[dict]) -> dict:
    prompt = build_user_prompt(stock, news)

    # Try Groq first, then Gemini, then deterministic fallback
    for attempt, fn in enumerate([call_groq, call_gemini]):
        key = GROQ_API_KEY if attempt == 0 else GEMINI_API_KEY
        if not key:
            continue
        try:
            return fn(prompt)
        except Exception as e:
            log.warning("LLM attempt %d failed: %s", attempt + 1, e)

    # ── Deterministic fallback (no LLM key) ───────────────────────────────────
    direction = "up" if stock["change_pct"] >= 0 else "down"
    news_titles = "; ".join(a["title"] for a in news[:2]) if news else "no major news"
    return {
        "hook": (
            f"Is {stock['company_name']} a buy right now? "
            f"Today it moved {direction} {abs(stock['change_pct'])}%. Let's break it down!"
        ),
        "stock_snapshot": (
            f"{stock['company_name']} is trading at ₹{stock['price']}, "
            f"that's {abs(stock['change_pct'])}% {'higher' if direction=='up' else 'lower'} than yesterday. "
            f"Over the past year it has ranged between ₹{stock['week_52_low']} and ₹{stock['week_52_high']}."
        ),
        "whats_happening": (
            f"Here's what's in the news: {news_titles}. "
            "These events can create short-term price movements — but always look at the bigger picture."
        ),
        "beginner_takeaway": (
            "For a first-time investor, one day's move doesn't tell the whole story. "
            "Look at the company's fundamentals, sector trends, and your own investment timeline before deciding."
        ),
        "call_to_action": (
            "Like and subscribe for daily stock briefs. Remember — invest with knowledge, not just hype!"
        ),
    }


# ═════════════════════════════════════════════════════════════════════════════
# VIDEO GENERATION (gTTS + Pillow + MoviePy)
# ═════════════════════════════════════════════════════════════════════════════

SECTION_META = [
    ("hook",              "HOOK",              "0 – 10 sec",  "#FF6B35"),
    ("stock_snapshot",    "STOCK SNAPSHOT",    "10 – 30 sec", "#4ECDC4"),
    ("whats_happening",   "WHAT'S HAPPENING",  "30 – 60 sec", "#45B7D1"),
    ("beginner_takeaway", "BEGINNER TAKEAWAY", "60 – 80 sec", "#96CEB4"),
    ("call_to_action",    "CALL TO ACTION",    "80 – 90 sec", "#FFEAA7"),
]

def generate_video(brief: dict, stock: dict, job_id: str) -> str:
    """
    Pipeline:
      1. Generate TTS audio per section (gTTS)
      2. Create a slide image per section (Pillow)
      3. Combine audio+image → video clip (MoviePy)
      4. Concatenate all clips → final MP4
    """
    try:
        from gtts import gTTS
        from moviepy.editor import (
            ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
        )
        from PIL import Image, ImageDraw, ImageFont
        import numpy as np

        tmp = Path(tempfile.mkdtemp())
        clips = []

        W, H = 1280, 720

        def wrap(text: str, width: int = 55) -> list[str]:
            return textwrap.wrap(text, width=width)

        def make_slide(section_key, section_title, time_label, accent, text) -> np.ndarray:
            img = Image.new("RGB", (W, H), color="#0D1117")
            draw = ImageDraw.Draw(img)

            # Background gradient strip
            for y in range(H):
                alpha = int(30 * (1 - y / H))
                draw.line([(0, y), (W, y)], fill=(13, 17, 23))

            # Accent bar (left)
            draw.rectangle([(0, 0), (8, H)], fill=accent)

            # Top header band
            draw.rectangle([(0, 0), (W, 90)], fill="#161B22")
            draw.rectangle([(0, 88), (W, 90)], fill=accent)

            # Logo text
            try:
                font_logo = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
                font_head = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
                font_time = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
                font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
                font_tick = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
                font_price= ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
            except Exception:
                font_logo = font_head = font_time = font_body = font_tick = font_price = ImageFont.load_default()

            draw.text((20, 28), "FinVise AI", fill=accent, font=font_logo)
            draw.text((W - 200, 28), time_label, fill="#8B949E", font=font_time)
            draw.text((W // 2 - 120, 28), section_title, fill="white", font=font_head)

            # Company + price block (top-right)
            company = stock["company_name"][:20]
            price_str = f"₹{stock['price']}"
            pct_str   = f"{stock['change_pct']:+.2f}%"
            pct_color = "#3FB950" if stock["change_pct"] >= 0 else "#F85149"

            # Content
            lines = wrap(text, 50)
            y_start = 150
            for i, line in enumerate(lines[:8]):
                draw.text((60, y_start + i * 52), line, fill="#E6EDF3", font=font_body)

            # Bottom info bar
            draw.rectangle([(0, H - 70), (W, H)], fill="#161B22")
            draw.text((20, H - 50), company, fill="white", font=font_head)
            draw.text((280, H - 55), price_str, fill="white", font=font_tick)
            draw.text((480, H - 50), pct_str, fill=pct_color, font=font_head)
            draw.text((W - 300, H - 45), f"NSE: {stock['ticker'].replace('.NS','')}", fill="#8B949E", font=font_time)
            draw.text((W - 150, H - 45), stock["as_of"], fill="#8B949E", font=font_time)

            return np.array(img)

        for section_key, section_title, time_label, accent in SECTION_META:
            text = brief.get(section_key, "")
            if not text:
                continue

            # TTS
            audio_path = str(tmp / f"{section_key}.mp3")
            try:
                tts = gTTS(text=text, lang="en", tld="co.in", slow=False)
                tts.save(audio_path)
                audio_clip = AudioFileClip(audio_path)
                duration   = audio_clip.duration
            except Exception as e:
                log.warning("TTS failed for %s: %s", section_key, e)
                duration   = max(5, len(text) // 15)
                audio_clip = None

            # Slide image
            slide_arr  = make_slide(section_key, section_title, time_label, accent, text)
            img_clip   = ImageClip(slide_arr).set_duration(duration)

            if audio_clip:
                img_clip = img_clip.set_audio(audio_clip)

            clips.append(img_clip)

        if not clips:
            raise ValueError("No clips generated")

        final        = concatenate_videoclips(clips, method="compose")
        out_path     = str(VIDEO_DIR / f"{job_id}.mp4")
        final.write_videofile(
            out_path,
            fps=24,
            codec="libx264",
            audio_codec="aac",
            logger=None,
        )
        return out_path

    except Exception as e:
        log.error("Video generation failed: %s", e)
        raise


def run_video_job(job_id: str, brief: dict, stock: dict):
    jobs[job_id]["status"] = "processing"
    try:
        path = generate_video(brief, stock, job_id)
        jobs[job_id]["status"]    = "done"
        jobs[job_id]["video_url"] = f"/videos/{job_id}.mp4"
        log.info("Video ready: %s", path)
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(e)


# ═════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "ok", "service": "FinVise AI Backend"}


@app.post("/api/analyse")
async def analyse(req: StockRequest, background_tasks: BackgroundTasks):
    ticker = normalise_ticker(req.ticker)

    # 1. Stock data
    stock = fetch_stock_data(ticker)

    # 2. News
    bare  = ticker.split(".")[0]
    news  = fetch_news(stock["company_name"], bare)

    # 3. LLM brief
    brief = generate_brief(stock, news)

    # 4. Video (async background job)
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending", "video_url": None, "error": None}

    if req.generate_video:
        background_tasks.add_task(run_video_job, job_id, brief, stock)

    return {
        "job_id":  job_id,
        "stock":   stock,
        "news":    news,
        "brief":   brief,
    }


@app.get("/api/video/{job_id}", response_model=VideoStatusResponse)
def video_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return VideoStatusResponse(job_id=job_id, **job)


@app.get("/api/video/{job_id}/download")
def download_video(job_id: str):
    path = VIDEO_DIR / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Video not ready")
    return FileResponse(str(path), media_type="video/mp4",
                        filename=f"finvise_{job_id[:8]}.mp4")
