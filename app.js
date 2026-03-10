/**
 * 🐺 DHEEB TRADING SYSTEM V3
 * Main Entry Point
 * Integrates all agents and core engines.
 */

const ICTEngine = require('./core/ict-engine');
const RiskAgent = require('./agents/risk-agent');
const { NotifierAgent } = require('./agents/notifier');

// Configuration
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
    minDisplacement: 10 // Points
  },
  telegram: {
    telegramToken: process.env.TELEGRAM_TOKEN || 'YOUR_TOKEN_HERE',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID'
  }
};

class DheebSystem {
  constructor() {
    console.log('🐺 Initializing DHEEB Trading System V3...');
    
    this.ictEngine = new ICTEngine(config.ict);
    this.riskAgent = new RiskAgent(config.account);
    this.notifier = new NotifierAgent(config.telegram);
    
    // Note: Python ML Filter and Sentiment Agent are called via child_process in production
    // For this JS integration, we simulate their responses
  }

  async evaluateMarket(marketData) {
    console.log('\n[1] Running MMXM Analysis...');
    const mmxmResult = this.ictEngine.analyzeMMXM(marketData);
    
    if (!mmxmResult.isAligned) {
      console.log('❌ Timeframes not aligned. Skipping.');
      return;
    }

    console.log('[2] Checking Kill Zones...');
    const killZone = this.ictEngine.isKillZoneActive(new Date());
    if (!killZone.active) {
      console.log('❌ Outside Kill Zones. Skipping.');
      return;
    }

    console.log('[3] Running DHEEB Filter V3 (ML)...');
    // Simulated ML Response
    const mlScore = 78; 
    if (mlScore < 65) {
      console.log(`❌ ML Score too low (${mlScore}%). Skipping.`);
      return;
    }

    console.log('[4] Validating Risk & Psychology...');
    const riskValidation = this.riskAgent.validateTradeLimits(500); // Simulated $500 risk
    if (!riskValidation.allowed) {
      console.log(`❌ Risk Blocked: ${riskValidation.reason}`);
      return;
    }

    const position = this.riskAgent.calculateDynamicRisk(
      config.account.balance, 
      config.account.riskPercent, 
      15 // Simulated ATR
    );

    console.log('✅ Setup Approved! Generating Signal...');
    
    const signal = {
      direction: mmxmResult.bias,
      instrument: 'NQ',
      entry: marketData.m15.currentPrice,
      stopLoss: marketData.m15.currentPrice - position.stopLossPoints,
      tp1: marketData.m15.currentPrice + (position.stopLossPoints * 1.5),
      tp2: marketData.m15.currentPrice + position.takeProfitPoints,
      rrr: position.rrr,
      riskAmount: position.riskAmount,
      riskPercent: config.account.riskPercent,
      contracts: position.positionSize,
      killZone: killZone.zone,
      setupType: 'MMXM + FVG',
      mlScore: mlScore,
      quality: 'A+'
    };

    console.log(signal);
    
    // Send Telegram Alert
    try {
      await this.notifier.notifySignal(signal);
      console.log('📱 Telegram Alert Sent!');
    } catch (e) {
      console.log('⚠️ Could not send Telegram alert (Token not configured).');
    }
  }
}

// --- Simulation ---
if (require.main === module) {
  const system = new DheebSystem();
  
  // Mock Market Data
  const mockData = {
    weekly: { trend: 'BULLISH' },
    daily: { trend: 'BULLISH' },
    h4: { trend: 'BULLISH', chochDetected: true },
    m15: { trend: 'BULLISH', fvgCount: 1, currentPrice: 17500 }
  };

  system.evaluateMarket(mockData);
}

module.exports = DheebSystem;
