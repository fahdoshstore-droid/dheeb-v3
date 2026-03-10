/**
 * 🐺 DHEEB TRADING SYSTEM V3
 * Notifier Agent — Telegram + WhatsApp
 * Sends real-time trade alerts and system status updates.
 */

const https = require('https');

class TelegramNotifier {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(text, parseMode = 'Markdown') {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        chat_id: this.chatId,
        text,
        parse_mode: parseMode
      });

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  formatTradeSignal(signal) {
    const emoji = signal.direction === 'BUY' ? '🟢' : '🔴';
    const arrow = signal.direction === 'BUY' ? '📈' : '📉';

    return `
🐺 *DHEEB SIGNAL — ${signal.quality || 'A+'}*
${emoji} *${signal.direction} ${signal.instrument}*

${arrow} *Entry:* \`${signal.entry}\`
🛑 *Stop Loss:* \`${signal.stopLoss}\`
🎯 *Take Profit 1:* \`${signal.tp1}\`
🎯 *Take Profit 2:* \`${signal.tp2}\`

📊 *RRR:* 1:${signal.rrr}
💰 *Risk:* $${signal.riskAmount} (${signal.riskPercent}%)
📦 *Contracts:* ${signal.contracts}

⏰ *Kill Zone:* ${signal.killZone}
🔍 *Setup:* ${signal.setupType}
🤖 *ML Score:* ${signal.mlScore}%

_${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}_
    `.trim();
  }

  formatAlert(type, message) {
    const icons = {
      WARNING: '⚠️',
      ERROR: '🚨',
      INFO: 'ℹ️',
      SUCCESS: '✅',
      BLOCKED: '🚫'
    };
    const icon = icons[type] || '📢';
    return `${icon} *DHEEB ALERT*\n\n${message}`;
  }

  async sendTradeSignal(signal) {
    const text = this.formatTradeSignal(signal);
    return this.sendMessage(text);
  }

  async sendAlert(type, message) {
    const text = this.formatAlert(type, message);
    return this.sendMessage(text);
  }

  async sendDailySummary(stats) {
    const winRate = stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(1) : 0;
    const pnlColor = stats.pnl >= 0 ? '🟢' : '🔴';

    const text = `
🐺 *DHEEB — ملخص اليوم*

📅 *التاريخ:* ${new Date().toLocaleDateString('ar-SA')}
📊 *الصفقات:* ${stats.trades} صفقة
✅ *الرابحة:* ${stats.wins}
❌ *الخاسرة:* ${stats.losses}
📈 *Win Rate:* ${winRate}%
${pnlColor} *الربح/الخسارة:* $${stats.pnl > 0 ? '+' : ''}${stats.pnl}

🔒 *الحالة:* ${stats.circuitBreaker ? 'CIRCUIT BREAKER 🚨' : 'NORMAL ✅'}
    `.trim();

    return this.sendMessage(text);
  }
}

class NotifierAgent {
  constructor(config) {
    this.telegram = new TelegramNotifier(
      config.telegramToken,
      config.telegramChatId
    );
  }

  async notifySignal(signal) {
    await this.telegram.sendTradeSignal(signal);
  }

  async notifyAlert(type, message) {
    await this.telegram.sendAlert(type, message);
  }

  async notifyDailySummary(stats) {
    await this.telegram.sendDailySummary(stats);
  }
}

module.exports = { NotifierAgent, TelegramNotifier };
