"""
🐺 DHEEB TRADING SYSTEM V3
Sentiment & News Agent
Analyzes Twitter/X sentiment using NLP and monitors economic news.
"""

import os
from transformers import pipeline

class SentimentAgent:
    def __init__(self):
        # Using FinBERT for financial sentiment analysis
        print("Initializing FinBERT Sentiment Model...")
        try:
            self.analyzer = pipeline(
                "sentiment-analysis",
                model="ProsusAI/finbert",
                tokenizer="ProsusAI/finbert"
            )
        except Exception as e:
            print(f"Warning: Could not load FinBERT model. {e}")
            self.analyzer = None

        self.trusted_accounts = [
            "@FAHIRES",
            "@Liq_Sniper",
            "@TraderDiegoX",
            "@ICT_Strategy"
        ]

    def analyze_tweets(self, tweets: list) -> dict:
        """
        Analyzes a list of tweets and returns an aggregated sentiment score.
        """
        if not tweets or not self.analyzer:
            return {'bias': 'NEUTRAL', 'confidence': 0.0}

        try:
            results = self.analyzer(tweets)
            
            bullish_score = sum(r['score'] for r in results if r['label'] == 'positive')
            bearish_score = sum(r['score'] for r in results if r['label'] == 'negative')
            
            total = bullish_score + bearish_score
            if total == 0:
                return {'bias': 'NEUTRAL', 'confidence': 0.0}

            if bullish_score > bearish_score * 1.3:
                return {'bias': 'BULLISH', 'confidence': round(bullish_score / total, 2)}
            elif bearish_score > bullish_score * 1.3:
                return {'bias': 'BEARISH', 'confidence': round(bearish_score / total, 2)}
            else:
                return {'bias': 'NEUTRAL', 'confidence': 0.5}
        except Exception as e:
            print(f"Error analyzing tweets: {e}")
            return {'bias': 'NEUTRAL', 'confidence': 0.0}

    def adjust_signal(self, trading_signal: dict, sentiment: dict) -> dict:
        """
        Adjusts the trading signal based on market sentiment.
        """
        signal_direction = trading_signal.get('direction', 'NEUTRAL')
        sentiment_bias = sentiment.get('bias', 'NEUTRAL')
        confidence = sentiment.get('confidence', 0.0)

        adjusted_signal = trading_signal.copy()

        # Boost signal if sentiment aligns
        if signal_direction == 'BUY' and sentiment_bias == 'BULLISH' and confidence > 0.7:
            adjusted_signal['sentiment_boost'] = True
            adjusted_signal['adjusted_risk'] = trading_signal.get('risk', 1.0) * 1.2
            
        # Reduce risk if sentiment contradicts
        elif signal_direction == 'BUY' and sentiment_bias == 'BEARISH' and confidence > 0.7:
            adjusted_signal['sentiment_warning'] = True
            adjusted_signal['adjusted_risk'] = trading_signal.get('risk', 1.0) * 0.5

        return adjusted_signal

class NewsAgent:
    def __init__(self):
        self.high_impact_keywords = ['FOMC', 'NFP', 'CPI', 'OPEC']
        self.blackout_minutes = 30

    def check_news_blackout(self, upcoming_events: list) -> dict:
        """
        Checks if trading should be paused due to upcoming high-impact news.
        """
        # Simplified logic for demonstration
        for event in upcoming_events:
            if any(kw in event['title'] for kw in self.high_impact_keywords):
                if event['minutes_to_event'] <= self.blackout_minutes:
                    return {
                        'allowed': False, 
                        'reason': f"News Blackout: {event['title']} in {event['minutes_to_event']} mins"
                    }
        return {'allowed': True, 'reason': 'Clear'}

if __name__ == "__main__":
    print("Sentiment & News Agents Ready.")
