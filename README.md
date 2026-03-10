# 🐺 DHEEB Trading System V3

**Professional ICT/SMC/MMXM Automated Trading System**

DHEEB V3 is a state-of-the-art algorithmic trading system designed specifically for NQ/MNQ futures. It implements advanced Inner Circle Trader (ICT) and Smart Money Concepts (SMC) with a multi-agent architecture.

## 🌟 Key Features (V3 Upgrades)

1. **MMXM Core Engine**: Full top-down analysis (Weekly -> Daily -> 4H -> 15M).
2. **DHEEB Filter V3 (Machine Learning)**: Uses Random Forest to predict setup success probability based on historical data.
3. **Dynamic Risk Agent**: ATR-based dynamic position sizing and strict psychological gates.
4. **Sentiment & News Agent**: Integrates FinBERT NLP to analyze Twitter/X sentiment from trusted ICT traders.
5. **Backtesting Module**: Built-in Backtrader integration for rigorous historical testing.
6. **Professional Dashboard**: Real-time React/HTML dashboard for monitoring equity curves and agent status.
7. **Telegram/WhatsApp Webhooks**: Instant, beautifully formatted trade alerts.

## 📂 Project Structure

```text
dheeb-v3/
├── app.js                      # Main entry point and orchestrator
├── core/
│   ├── ict-engine.js           # MMXM, FVG, OB, Liquidity logic
│   ├── dheeb-filter-v3.py      # ML Random Forest classifier
│   └── backtester.py           # Backtrader historical testing
├── agents/
│   ├── risk-agent.js           # Dynamic ATR sizing & limits
│   ├── sentiment-agent.py      # FinBERT NLP Twitter analysis
│   └── notifier.js             # Telegram/WhatsApp alerts
└── dashboard/
    └── index.html              # Professional UI Dashboard
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- `pip install pandas numpy scikit-learn backtrader transformers torch`

### Running the System

1. **Start the Main Bot:**
   ```bash
   node app.js
   ```

2. **Train the ML Filter:**
   ```bash
   python3 core/dheeb-filter-v3.py
   ```

3. **Run a Backtest:**
   ```bash
   python3 core/backtester.py
   ```

4. **View the Dashboard:**
   Open `dashboard/index.html` in any modern web browser.

## 🛡️ Risk Management Rules Enforced
- Max 2 trades per day.
- Max 2 consecutive losses (Circuit Breaker).
- Max daily loss limit: $600.
- Minimum RRR: 1:2.5.
- No trading on Wednesdays and Fridays.

---
*Developed by @FAHIRES | Execution Enforcer - NO EXCUSES*
