/**
 * 🐺 DHEEB TRADING SYSTEM V3
 * Advanced Risk Agent
 * Implements Dynamic Position Sizing (ATR-based) and strict psychology rules
 */

class RiskAgent {
  constructor(config) {
    this.config = config;
    this.dailyStats = {
      date: new Date().toISOString().split('T')[0],
      tradesTaken: 0,
      totalLoss: 0,
      consecutiveLosses: 0
    };
  }

  /**
   * Calculates dynamic position size based on ATR volatility
   * @param {number} accountBalance - Current account balance
   * @param {number} riskPercent - Percentage of account to risk (e.g., 1.0)
   * @param {number} atrValue - Current ATR value in points
   * @param {number} atrMultiplier - Multiplier for Stop Loss (default 1.5)
   * @returns {Object} Position sizing details
   */
  calculateDynamicRisk(accountBalance, riskPercent, atrValue, atrMultiplier = 1.5) {
    // 1. Calculate Risk Amount in Dollars
    const riskAmount = accountBalance * (riskPercent / 100);
    
    // 2. Calculate Stop Loss in Points based on ATR
    const stopLossPoints = atrValue * atrMultiplier;
    
    // 3. Calculate Position Size (Contracts/Lots)
    // Assuming 1 point = $1 for simplicity in this generic calculation
    // In reality, this should be multiplied by the instrument's tick value
    const positionSize = riskAmount / stopLossPoints;

    // 4. Safety Check: Max Exposure Limit (e.g., 2% max)
    const maxPositionSize = accountBalance * 0.02;
    const finalSize = Math.min(positionSize, maxPositionSize);

    // 5. Calculate Take Profit based on Min RRR
    const takeProfitPoints = stopLossPoints * this.config.minRRR;

    return {
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      stopLossPoints: parseFloat(stopLossPoints.toFixed(2)),
      positionSize: parseFloat(finalSize.toFixed(4)),
      takeProfitPoints: parseFloat(takeProfitPoints.toFixed(2)),
      rrr: this.config.minRRR
    };
  }

  /**
   * Validates if a trade can be taken based on daily limits
   */
  validateTradeLimits(proposedRiskAmount) {
    this._resetDailyStatsIfNeeded();

    if (this.dailyStats.tradesTaken >= this.config.maxTradesPerDay) {
      return { allowed: false, reason: 'MAX_DAILY_TRADES_REACHED' };
    }

    if (this.dailyStats.consecutiveLosses >= this.config.consecutiveLossLimit) {
      return { allowed: false, reason: 'CONSECUTIVE_LOSS_LIMIT_REACHED' };
    }

    if (this.dailyStats.totalLoss + proposedRiskAmount > this.config.dailyLossLimit) {
      return { allowed: false, reason: 'DAILY_LOSS_LIMIT_EXCEEDED' };
    }

    return { allowed: true, reason: 'OK' };
  }

  /**
   * Psychology Gate: Evaluates trader's mental state
   */
  evaluatePsychology(stateScore, isDetached, isChasing) {
    if (stateScore < 7) {
      return { passed: false, reason: 'MENTAL_STATE_TOO_LOW' };
    }
    if (!isDetached) {
      return { passed: false, reason: 'NOT_EMOTIONALLY_DETACHED' };
    }
    if (isChasing) {
      return { passed: false, reason: 'REVENGE_TRADING_DETECTED' };
    }
    return { passed: true, reason: 'PSYCHOLOGY_CLEAR' };
  }

  /**
   * Records a completed trade to update daily stats
   */
  recordTradeResult(result, pnlAmount) {
    this._resetDailyStatsIfNeeded();
    
    this.dailyStats.tradesTaken++;
    
    if (result === 'LOSS') {
      this.dailyStats.totalLoss += Math.abs(pnlAmount);
      this.dailyStats.consecutiveLosses++;
    } else if (result === 'WIN') {
      this.dailyStats.consecutiveLosses = 0;
    }
  }

  // --- Private Helpers ---

  _resetDailyStatsIfNeeded() {
    const today = new Date().toISOString().split('T')[0];
    if (this.dailyStats.date !== today) {
      this.dailyStats = {
        date: today,
        tradesTaken: 0,
        totalLoss: 0,
        consecutiveLosses: 0
      };
    }
  }
}

module.exports = RiskAgent;
