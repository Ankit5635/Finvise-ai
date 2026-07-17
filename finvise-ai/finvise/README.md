<div align="center">

# ⚡ FinVise AI ⚡

### 🇮🇳 AI-Powered Indian Stock Market Intelligence Platform

#### *Analyze Stocks • Understand News • Generate AI Video Briefs*

<p align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi"/>
<img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python"/>
<img src="https://img.shields.io/badge/Groq-Llama3-black?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Gemini-AI-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge"/>
<img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge"/>

</p>

### 🚀 Real-Time Indian Stock Analysis with AI-generated 90-Second Video Reports

**📊 Stock Data • 📰 Latest News • 🤖 AI Insights • 🎥 Auto Video Generation**

---

🌐 **Live Demo:** https://your-finvise.vercel.app

📺 **Video Demo:** Coming Soon

⭐ **Don't forget to Star this Repository!**

</div>

🌟 Why FinVise AI?

Traditional stock analysis platforms overwhelm users with technical charts and financial jargon.

FinVise AI simplifies investing by combining Artificial Intelligence, real-time market data, and automated video generation into a single platform.

Instead of spending hours reading financial news, users receive a concise 90-second AI-generated stock briefing that explains:

📈 Current stock performance
📰 Important market news
💡 Beginner-friendly investment insights
🎬 Downloadable AI-generated video summary

The platform is designed especially for new investors interested in the Indian Stock Market (NSE & BSE).

🚀 Key Features
📈 Live Stock Market Data
Real-time NSE & BSE stock prices
OHLC data
52 Week High/Low
Market Capitalization
P/E Ratio
Dividend Yield
Trading Volume
Previous Close
Daily Price Change
📰 AI-Powered News Aggregation

Instead of relying on one source, FinVise intelligently fetches news using a cascading fallback mechanism.

Priority:

NewsAPI
      ↓
Google News RSS
      ↓
Economic Times RSS

This ensures that the application almost always provides relevant news even when one service is unavailable.

🤖 AI Market Brief Generation

FinVise uses Large Language Models to transform raw market data into simple English.

The AI explains:

Market movement
Recent events
Positive signals
Risks
Beginner-friendly explanation
Educational disclaimer

Models supported:

Llama 3 (Groq)
Gemini 1.5 Flash
Deterministic fallback engine
🎬 AI Video Generation

One click automatically creates a professional MP4 video.

Pipeline:

AI Script
      ↓
Google Text-to-Speech
      ↓
Voice Narration
      ↓
Image Slides
      ↓
MoviePy Rendering
      ↓
MP4 Video

Generated video contains

Voice narration
Dynamic slides
Stock information
AI explanation
Download button
📊 Dashboard Modules
🏠 Home Dashboard

Displays

Live Stock Price
Daily Change
Market Cap
52 Week Range
Volume
P/E Ratio
📰 News Section

Displays

Latest Headlines
Source
Published Date
News Summary
Direct Article Link
🤖 AI Analysis

Includes

Hook
Stock Snapshot
Market News
Investment Insight
Educational Conclusion
🎥 Video Generator

Allows users to

Generate Video
Monitor Progress
Download MP4
Replay Video
📐 System Design
                    User
                     │
                     ▼
          React Frontend (Vercel)
                     │
                     ▼
         FastAPI REST API (Render)
                     │
      ┌──────────────┼─────────────┐
      ▼              ▼             ▼
 yFinance        News Sources     AI Models
      │              │             │
      └──────────────┼─────────────┘
                     ▼
           AI Brief Generator
                     │
          Background Task Queue
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      gTTS        Pillow      MoviePy
        │            │            │
        └────────────┼────────────┘
                     ▼
              MP4 Video Output
⚡ Performance Features
Asynchronous FastAPI Backend
Background Video Generation
Automatic API Failover
Lightweight React Frontend
No Paid APIs Required
Free Tier Deployment
Modular Architecture
Scalable REST APIs
🔐 Error Handling

FinVise gracefully handles failures.

Error	Solution
Invalid Stock	User-friendly error
News API Failure	RSS fallback
AI Failure	Gemini fallback
Gemini Failure	Static Template
Video Failure	AI Brief still displayed
Network Timeout	Retry mechanism
📈 Future Enhancements
📊 Technical Indicators
RSI
MACD
EMA
SMA
Bollinger Bands
🤖 Advanced AI
Portfolio Analysis
Buy/Sell Signals
Risk Prediction
Sentiment Analysis
Earnings Analysis
📱 User Features
Login
Portfolio
Watchlist
Notifications
Email Alerts
🌍 Deployment
Docker
Kubernetes
AWS
Azure
CI/CD Pipeline
GitHub Actions
📡 API Integrations
Alpha Vantage
Twelve Data
Finnhub
Polygon.io
NSE Official APIs
📊 Project Statistics
Metric	Details
Frontend	React 18
Backend	FastAPI
Programming Language	Python
AI Models	Groq + Gemini
Video Engine	MoviePy
Voice Engine	gTTS
Charts	Recharts
Deployment	Vercel + Render
Database	Optional
APIs Used	5+
🎯 Learning Outcomes

This project demonstrates practical experience with:

Full Stack Development
REST API Development
Artificial Intelligence
Large Language Models
Computer Automation
Video Processing
Cloud Deployment
Docker
Async Programming
API Integration
Error Handling
React Development
FastAPI Development
Production Architecture
💼 Resume Highlights

This project showcases expertise in:

✅ Artificial Intelligence
✅ Machine Learning Integration
✅ Full Stack Development
✅ React.js
✅ FastAPI
✅ REST APIs
✅ Cloud Deployment
✅ Docker
✅ Video Automation
✅ API Integration
✅ Data Visualization
✅ Software Architecture
🌍 Real-World Applications
Stock Market Education
Financial News Automation
AI Content Generation
Investment Research
FinTech Platforms
Robo Advisors
Portfolio Analysis
Wealth Management
Financial Journalism
AI Video Generation
📞 Contact
👨‍💻 Author

Ankit Bachchhav 😈

🎓 Computer Science Graduate

💻 AI/ML Engineer | Python Developer | Full Stack Developer

💼 LinkedIn: https://www.linkedin.com/in/ankitbachchhav2003

🐙 GitHub: https://github.com/Ankit5635

⭐ Support the Project

If you found FinVise AI useful, please consider giving it a ⭐ Star on GitHub.

It helps others discover the project and supports future development.
