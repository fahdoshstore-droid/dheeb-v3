# 🐺 DHEEB Trading System V3

<p align="center">
  <img src="https://img.shields.io/badge/Version-V3.0-blue?style=for-the-badge&logo=versioncontrol&logoColor=white">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Platform-Node.js-339933?style=for-the-badge&logo=node.js">
  <img src="https://img.shields.io/badge/AI-Python-yellow?style=for-the-badge&logo=python">
</p>

---

## 🎯 What is DHEEB V3?

**Professional ICT/SMC/MMXM Automated Trading System** designed for NQ/MNQ futures markets. Built with multi-agent architecture, machine learning, and institutional-grade risk management.

> *"Trade the plan, not the emotions."* — DHEEB

---

## 🌟 Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **MMXM Core Engine** | Full top-down analysis (Weekly → Daily → 4H → 15M) |
| 🤖 **ML Filter (Random Forest)** | Predicts setup success probability based on historical data |
| 📊 **Dynamic Risk Agent** | ATR-based position sizing + psychological gates |
| 📰 **Sentiment Agent** | FinBERT NLP analyzes Twitter/X from trusted ICT traders |
| 🔬 **Backtesting Module** | Built-in Backtrader for rigorous historical testing |
| 📈 **Professional Dashboard** | Real-time React/HTML monitoring |
| 📱 **Instant Alerts** | Telegram/WhatsApp webhooks |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  DHEEB V3 MAIN                      │
│                   (Orchestrator)                    │
└─────────────────────┬───────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────┐    ┌──────────┐    ┌────────────┐
│   ICT   │    │   Risk   │    │  Sentiment │
│  Engine │    │   Agent  │    │   Agent    │
└────┬────┘    └────┬─────┘    └─────┬──────┘
     │              │                 │
     └──────────────┼─────────────────┘
                    ▼
            ┌────────────┐
            │  Notifier  │
            │ (Telegram/ │
            │  WhatsApp) │
            └────────────┘
```

---

## 📂 Project Structure

```
dheeb-v3/
├── app.js                      # Main entry point
├── core/
│   ├── ict-engine.js          # MMXM, FVG, OB, Liquidity
│   ├── dheeb-filter-v3.py     # ML Random Forest classifier
│   └── backtester.py          # Backtrader testing
├── agents/
│   ├── risk-agent.js          # Dynamic ATR sizing
│   ├── sentiment-agent.py      # FinBERT NLP
│   └── notifier.js            # Telegram/WhatsApp alerts
└── dashboard/
    └── index.html             # Professional UI
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js
node -v  # v18+

# Python
python3 -v  # 3.10+

# Install Python packages
pip install pandas numpy scikit-learn backtrader transformers torch
```

### Installation

```bash
# Clone the repository
git clone https://github.com/fahdoshstore-droid/dheeb-v3.git
cd dheeb-v3

# Install Node dependencies (if any)
npm install
```

### Running

```bash
# Start the trading system
node app.js

# Train ML filter (optional)
python3 core/dheeb-filter-v3.py

# Run backtest
python3 core/backtester.py
```

### View Dashboard

Open `dashboard/index.html` in any browser.

---

## 🛡️ Risk Management Rules

| Rule | Value |
|------|-------|
| Max Trades/Day | 2 |
| Max Consecutive Losses | 2 (Circuit Breaker) |
| Daily Loss Limit | $600 |
| Min RRR | 1:2.5 |
| No Trading | Wednesdays & Fridays |
| Max Risk/Trade | 1% ($500) |

---

## 📊 Supported Markets

- **NQ** - Nasdaq Futures
- **MNQ** - Nasdaq Micro Futures

---

## 🔧 Configuration

Edit `app.js` to configure:

```javascript
const config = {
  account: {
    balance: 50000,
    riskPercent: 1.0,
    maxTradesPerDay: 2,
    consecutiveLossLimit: 2,
    dailyLossLimit: 600,
    minRRR: 2.5
  },
  ict: {
    minDisplacement: 10
  }
};
```

---

## 📜 License

MIT License - Feel free to use and modify!

---

## 👤 Author

**@FAHIRES** | *Execution Enforcer - NO EXCUSES*

---

<p align="center">
  <strong>🐺 Trade Smart. Trade Disciplined. 🐺</strong>
</p>
