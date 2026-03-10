"""
🐺 DHEEB TRADING SYSTEM V3
Backtesting Module
Uses Backtrader to test the ICT/SMC strategy on historical data.
"""

import backtrader as bt
import pandas as pd
from datetime import datetime

class DheebICTStrategy(bt.Strategy):
    """
    DHEEB Strategy implementing ICT/SMC concepts:
    - Order Blocks
    - Fair Value Gaps
    - Liquidity Sweeps
    - Kill Zones
    """
    params = (
        ('risk_percent', 1.0),
        ('min_rrr', 2.5),
        ('max_trades_day', 2),
        ('atr_period', 14),
        ('atr_multiplier', 1.5)
    )

    def __init__(self):
        self.daily_trades = 0
        self.last_trade_date = None
        self.order = None
        
        # Indicators
        self.atr = bt.indicators.ATR(self.data, period=self.params.atr_period)
        self.highest = bt.indicators.Highest(self.data.high, period=20)
        self.lowest = bt.indicators.Lowest(self.data.low, period=20)

    def is_kill_zone(self):
        """Check if current time is within London or NY Kill Zones (UTC)"""
        time = self.data.datetime.time()
        hour = time.hour
        # London: 07:00-10:00 UTC | NY Open: 13:00-16:00 UTC
        return (7 <= hour <= 10) or (13 <= hour <= 16)

    def detect_fvg(self):
        """Detect Bullish Fair Value Gap"""
        if len(self.data) < 3:
            return False
        c1_high = self.data.high[-2]
        c3_low = self.data.low[0]
        return c3_low > c1_high

    def detect_liquidity_sweep(self):
        """Detect Sell Side Liquidity Sweep"""
        if len(self.data) < 20:
            return False
        recent_low = self.lowest[-1]
        # Swept below recent low but closed above it
        return self.data.low[0] < recent_low and self.data.close[0] > recent_low

    def next(self):
        # Reset daily counters
        current_date = self.data.datetime.date()
        if current_date != self.last_trade_date:
            self.daily_trades = 0
            self.last_trade_date = current_date

        # Check entry conditions
        if not self.position and self.daily_trades < self.params.max_trades_day:
            if self.is_kill_zone() and self.detect_fvg() and self.detect_liquidity_sweep():
                
                # Calculate Risk and Position Size
                account_value = self.broker.getvalue()
                risk_amount = account_value * (self.params.risk_percent / 100)
                
                stop_loss_dist = self.atr[0] * self.params.atr_multiplier
                entry_price = self.data.close[0]
                
                # Assuming 1 point = $1 for simplicity in backtest
                size = risk_amount / stop_loss_dist
                
                # Calculate TP based on Min RRR
                take_profit_dist = stop_loss_dist * self.params.min_rrr
                
                # Execute Order
                self.buy(size=size)
                self.sell(size=size, exectype=bt.Order.Stop, price=entry_price - stop_loss_dist)
                self.sell(size=size, exectype=bt.Order.Limit, price=entry_price + take_profit_dist)
                
                self.daily_trades += 1

    def notify_trade(self, trade):
        if trade.isclosed:
            print(f"Trade Closed: PnL: ${trade.pnl:.2f} | Net: ${trade.pnlcomm:.2f}")

def run_backtest(data_path):
    """Run the backtest with provided CSV data"""
    cerebro = bt.Cerebro()
    cerebro.addstrategy(DheebICTStrategy)

    # Load Data
    try:
        df = pd.read_csv(data_path, parse_dates=True, index_col='datetime')
        data = bt.feeds.PandasData(dataname=df)
        cerebro.adddata(data)
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

    # Broker Settings
    cerebro.broker.setcash(50000.0)
    cerebro.broker.setcommission(commission=0.001)

    # Analyzers
    cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
    cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
    cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')

    print(f"Starting Portfolio Value: ${cerebro.broker.getvalue():,.2f}")
    
    results = cerebro.run()
    strat = results[0]

    print(f"\n=== Backtest Results ===")
    print(f"Final Portfolio Value: ${cerebro.broker.getvalue():,.2f}")
    
    sharpe = strat.analyzers.sharpe.get_analysis()
    print(f"Sharpe Ratio: {sharpe.get('sharperatio', 0):.2f}")
    
    drawdown = strat.analyzers.drawdown.get_analysis()
    print(f"Max Drawdown: {drawdown.get('max', {}).get('drawdown', 0):.2f}%")
    
    trades = strat.analyzers.trades.get_analysis()
    total_trades = trades.get('total', {}).get('total', 0)
    won_trades = trades.get('won', {}).get('total', 0)
    win_rate = (won_trades / total_trades * 100) if total_trades > 0 else 0
    print(f"Win Rate: {win_rate:.1f}% ({won_trades}/{total_trades})")

    return strat

if __name__ == '__main__':
    print("DHEEB Backtester Initialized.")
    
