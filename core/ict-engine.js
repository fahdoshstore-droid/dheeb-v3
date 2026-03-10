/**
 * 🐺 DHEEB TRADING SYSTEM V3
 * Core ICT/SMC Engine
 * Implements MMXM, Order Blocks, FVG, Liquidity Sweeps, and Kill Zones
 */

class ICTEngine {
  constructor(config) {
    this.config = config;
  }

  /**
   * MMXM Top-Down Analysis
   * Validates alignment across Weekly, Daily, 4H, and 15M timeframes
   */
  analyzeMMXM(marketData) {
    const { weekly, daily, h4, m15 } = marketData;
    
    // 1. HTF Bias (Weekly/Daily)
    const htfBias = this._determineBias(weekly.trend, daily.trend);
    
    // 2. MTF Structure (4H)
    const mtfStructure = this._analyzeStructure(h4);
    
    // 3. LTF Entry (15M/5M)
    const ltfSetup = this._findEntrySetup(m15, htfBias);

    const isAligned = htfBias.direction === mtfStructure.direction && 
                      htfBias.direction === ltfSetup.direction;

    return {
      isAligned,
      bias: htfBias.direction,
      confidence: this._calculateMMXMConfidence(htfBias, mtfStructure, ltfSetup),
      details: { htfBias, mtfStructure, ltfSetup }
    };
  }

  /**
   * Detects Fair Value Gaps (FVG)
   */
  detectFVG(candles) {
    const fvgs = [];
    for (let i = 2; i < candles.length; i++) {
      const c1 = candles[i - 2];
      const c2 = candles[i - 1];
      const c3 = candles[i];

      // Bullish FVG: C1 High < C3 Low
      if (c1.high < c3.low) {
        fvgs.push({
          type: 'BULLISH',
          top: c3.low,
          bottom: c1.high,
          size: c3.low - c1.high,
          time: c2.time
        });
      }
      
      // Bearish FVG: C1 Low > C3 High
      if (c1.low > c3.high) {
        fvgs.push({
          type: 'BEARISH',
          top: c1.low,
          bottom: c3.high,
          size: c1.low - c3.high,
          time: c2.time
        });
      }
    }
    return fvgs;
  }

  /**
   * Detects Order Blocks (OB)
   */
  detectOrderBlocks(candles, trend) {
    const obs = [];
    // Logic: Find the last opposite candle before a strong displacement
    for (let i = 1; i < candles.length - 1; i++) {
      const current = candles[i];
      const next = candles[i + 1];
      
      const isDisplacement = Math.abs(next.close - next.open) > this.config.minDisplacement;

      if (trend === 'BULLISH' && current.close < current.open && isDisplacement && next.close > next.open) {
        obs.push({ type: 'BULLISH_OB', high: current.high, low: current.low, time: current.time });
      } else if (trend === 'BEARISH' && current.close > current.open && isDisplacement && next.close < next.open) {
        obs.push({ type: 'BEARISH_OB', high: current.high, low: current.low, time: current.time });
      }
    }
    return obs;
  }

  /**
   * Detects Liquidity Sweeps (BSL/SSL)
   */
  detectLiquiditySweep(currentPrice, keyLevels) {
    const sweeps = [];
    
    // Buy Side Liquidity (BSL) Sweep
    if (currentPrice.high > keyLevels.pdh && currentPrice.close < keyLevels.pdh) {
      sweeps.push({ type: 'BSL_SWEEP', level: keyLevels.pdh, strength: 'HIGH' });
    }
    
    // Sell Side Liquidity (SSL) Sweep
    if (currentPrice.low < keyLevels.pdl && currentPrice.close > keyLevels.pdl) {
      sweeps.push({ type: 'SSL_SWEEP', level: keyLevels.pdl, strength: 'HIGH' });
    }
    
    return sweeps;
  }

  /**
   * Validates if current time is within a Kill Zone
   */
  isKillZoneActive(currentTimeUTC) {
    const hour = currentTimeUTC.getUTCHours();
    const minute = currentTimeUTC.getUTCMinutes();
    const timeFloat = hour + (minute / 60);

    const zones = [
      { name: 'LONDON', start: 7.0, end: 10.0 },
      { name: 'NY_AM', start: 13.0, end: 16.0 },
      { name: 'NY_PM', start: 18.0, end: 20.0 }
    ];

    for (const zone of zones) {
      if (timeFloat >= zone.start && timeFloat <= zone.end) {
        return { active: true, zone: zone.name };
      }
    }
    return { active: false, zone: null };
  }

  // --- Private Helpers ---

  _determineBias(weeklyTrend, dailyTrend) {
    if (weeklyTrend === dailyTrend) return { direction: weeklyTrend, strength: 'STRONG' };
    return { direction: dailyTrend, strength: 'WEAK' }; // Daily overrides Weekly for short-term
  }

  _analyzeStructure(h4Data) {
    // Simplified structure analysis
    return { direction: h4Data.trend, hasCHOCH: h4Data.chochDetected };
  }

  _findEntrySetup(m15Data, bias) {
    return { direction: m15Data.trend, hasFVG: m15Data.fvgCount > 0 };
  }

  _calculateMMXMConfidence(bias, structure, setup) {
    let score = 0;
    if (bias.strength === 'STRONG') score += 40;
    if (structure.hasCHOCH) score += 30;
    if (setup.hasFVG) score += 30;
    return score;
  }
}

module.exports = ICTEngine;
