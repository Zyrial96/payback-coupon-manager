require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Bot Configuration
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const COUPONS_FILE = path.join(__dirname, 'coupons.json');
const PROCESSED_MESSAGES_FILE = path.join(__dirname, 'processed_messages.json');

// Coupon patterns to detect
const COUPON_PATTERNS = {
  payback: /(?:payback|pb)[\s:-]*(\d{10,13})/i,
  dm: /(?:dm|drogerie)[\s:-]*(\d{10,13})/i,
  rossmann: /(?:rossmann|rm)[\s:-]*(\d{10,13})/i,
  barcode: /\b\d{8,13}\b/g,
  qrCode: /QR[\s:-]*Code/i,
};

// Load or initialize coupons
async function loadCoupons() {
  try {
    const data = await fs.readFile(COUPONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveCoupons(coupons) {
  await fs.writeFile(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

async function loadProcessedMessages() {
  try {
    const data = await fs.readFile(PROCESSED_MESSAGES_FILE, 'utf8');
    return new Set(JSON.parse(data));
  } catch (error) {
    return new Set();
  }
}

async function saveProcessedMessages(processed) {
  await fs.writeFile(PROCESSED_MESSAGES_FILE, JSON.stringify([...processed]));
}

// Parse coupon from message
function parseCoupon(text, caption) {
  const content = text || caption || '';
  const detectedCoupons = [];

  // Check for Payback codes
  const paybackMatch = content.match(COUPON_PATTERNS.payback);
  if (paybackMatch) {
    detectedCoupons.push({
      type: 'payback',
      barcode: paybackMatch[1],
      title: 'Payback Coupon',
      description: extractDescription(content),
    });
  }

  // Check for DM codes
  const dmMatch = content.match(COUPON_PATTERNS.dm);
  if (dmMatch) {
    detectedCoupons.push({
      type: 'dm',
      barcode: dmMatch[1],
      title: 'DM Coupon',
      description: extractDescription(content),
    });
  }

  // Check for Rossmann codes
  const rossmannMatch = content.match(COUPON_PATTERNS.rossmann);
  if (rossmannMatch) {
    detectedCoupons.push({
      type: 'rossmann',
      barcode: rossmannMatch[1],
      title: 'Rossmann Coupon',
      description: extractDescription(content),
    });
  }

  // Generic barcode detection
  const barcodeMatches = content.match(COUPON_PATTERNS.barcode);
  if (barcodeMatches && detectedCoupons.length === 0) {
    // Take the first valid barcode that's not already matched
    for (const barcode of barcodeMatches) {
      if (!detectedCoupons.some(c => c.barcode === barcode)) {
        detectedCoupons.push({
          type: 'other',
          barcode: barcode,
          title: 'Gefundener Coupon',
          description: extractDescription(content),
        });
        break;
      }
    }
  }

  return detectedCoupons;
}

function extractDescription(text) {
  // Extract description lines (usually after the code or in the message)
  const lines = text.split('\n').filter(line => line.trim());
  
  // Look for keywords that indicate value/discount
  const valueKeywords = ['€', 'Euro', '%', 'fach', 'x Punkte', 'Rabatt', 'sparen'];
  const descriptionLine = lines.find(line => 
    valueKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  return descriptionLine || lines.slice(0, 2).join(' ');
}

function generateValidUntil() {
  // Default validity: 30 days from now
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

// Bot commands
bot.command('start', (ctx) => {
  ctx.reply(`
🎫 **Payback Coupon Bot**

Ich durchsuche automatisch Coupons in dieser Gruppe und speichere sie.

**Befehle:**
/help - Zeigt diese Hilfe
/status - Status des Bots
/latest - Zeigt die neuesten Coupons
/stats - Statistik

**Automatische Erkennung:**
• Payback Codes
• DM Coupons  
• Rossmann Coupons
• Barcodes (8-13 Ziffern)

Die Coupons werden in deine App synchronisiert!
  `, { parse_mode: 'Markdown' });
});

bot.command('help', (ctx) => {
  ctx.reply(`
📖 **Hilfe**

Der Bot erkennt automatisch Coupons in Nachrichten.

**Wie es funktioniert:**
1. Jemand postet einen Coupon in der Gruppe
2. Ich analysiere die Nachricht
3. Speichere den Coupon
4. Du kannst ihn in der App importieren

**Unterstützte Formate:**
- Payback: "PB: 1234567890"
- DM: "DM Coupon: 123456789"
- Rossmann: "RM: 123456789"
- Allgemein: 8-13 stellige Zahlen
  `, { parse_mode: 'Markdown' });
});

bot.command('status', async (ctx) => {
  const coupons = await loadCoupons();
  ctx.reply(`
📊 **Bot Status**

✅ Bot ist aktiv
📁 ${coupons.length} Coupons gespeichert
🔄 Auto-Sync: Aktiviert
⏰ Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')}
  `, { parse_mode: 'Markdown' });
});

bot.command('latest', async (ctx) => {
  const coupons = await loadCoupons();
  const latest = coupons.slice(-5).reverse();
  
  if (latest.length === 0) {
    ctx.reply('❌ Noch keine Coupons gespeichert.');
    return;
  }

  let message = '🎫 **Neueste Coupons:**\n\n';
  latest.forEach((coupon, index) => {
    message += `${index + 1}. **${coupon.title}**\n`;
    message += `   Typ: ${coupon.type}\n`;
    message += `   Code: \`${coupon.barcode}\`\n\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.command('stats', async (ctx) => {
  const coupons = await loadCoupons();
  const typeCount = coupons.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  let message = '📈 **Statistik:**\n\n';
  message += `Gesamt: ${coupons.length} Coupons\n\n`;
  message += 'Nach Typ:\n';
  
  for (const [type, count] of Object.entries(typeCount)) {
    message += `  • ${type}: ${count}\n`;
  }

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Handle messages in groups
bot.on(['text', 'photo', 'document'], async (ctx) => {
  // Only process group messages
  if (ctx.chat.type === 'private') return;

  const messageId = ctx.message.message_id;
  const processed = await loadProcessedMessages();
  
  if (processed.has(messageId)) return;
  processed.add(messageId);
  await saveProcessedMessages(processed);

  const text = ctx.message.text || ctx.message.caption || '';
  
  // Skip if no text
  if (!text.trim()) return;

  // Parse coupons
  const detectedCoupons = parseCoupon(text, text);
  
  if (detectedCoupons.length > 0) {
    const existingCoupons = await loadCoupons();
    const newCoupons = [];

    for (const coupon of detectedCoupons) {
      // Check if coupon already exists
      const exists = existingCoupons.some(c => c.barcode === coupon.barcode);
      if (!exists) {
        const newCoupon = {
          id: `telegram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: coupon.title,
          description: coupon.description,
          barcode: coupon.barcode,
          barcodeType: 'CODE128',
          type: coupon.type,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: generateValidUntil(),
          used: false,
          createdAt: new Date().toISOString(),
          source: 'telegram',
          messageId: messageId,
        };
        
        newCoupons.push(newCoupon);
        existingCoupons.push(newCoupon);
      }
    }

    if (newCoupons.length > 0) {
      await saveCoupons(existingCoupons);
      
      // Notify group
      let response = `✅ **${newCoupons.length} Coupon(s) erkannt und gespeichert!**\n\n`;
      newCoupons.forEach((coupon, index) => {
        response += `${index + 1}. ${coupon.title}\n`;
        response += `   Code: \`${coupon.barcode}\`\n`;
        if (coupon.description) {
          response += `   Info: ${coupon.description.substring(0, 50)}...\n`;
        }
        response += '\n';
      });
      response += '📱 In deiner App verfügbar!';
      
      ctx.reply(response, { parse_mode: 'Markdown' });
      
      // Try to notify webhook if configured
      if (process.env.WEBHOOK_URL) {
        try {
          await axios.post(process.env.WEBHOOK_URL, {
            event: 'new_coupons',
            coupons: newCoupons,
          });
        } catch (error) {
          console.log('Webhook notification failed:', error.message);
        }
      }
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Ein Fehler ist aufgetreten. Bitte später erneut versuchen.').catch(console.error);
});

// Start bot
console.log('🤖 Starting Telegram Bot...');
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ Bot is running!');