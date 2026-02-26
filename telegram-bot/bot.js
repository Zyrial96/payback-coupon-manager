require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

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

const IMAGES_DIR = path.join(__dirname, 'images');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

function detectStore(text) {
  const lowerText = text.toLowerCase();
  const keywords = {
    payback: ['payback', 'pb', 'pay back'],
    dm: ['dm', 'drogerie'],
    rossmann: ['rossmann', 'rossi'],
    rewe: ['rewe'],
    penny: ['penny'],
    lidl: ['lidl'],
    aldi: ['aldi'],
    kaufland: ['kaufland'],
    mueller: ['müller', 'mueller'],
  };
  
  for (const [store, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lowerText.includes(kw))) {
      return store;
    }
  }
  return 'other';
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', reject);
  });
}

async function processPhotoMessage(ctx) {
  const messageId = ctx.message.message_id;
  const photo = ctx.message.photo;
  const document = ctx.message.document;
  
  if (!photo && !document) return [];
  
  try {
    let fileId, mimeType;
    
    if (photo) {
      fileId = photo[photo.length - 1].file_id;
      mimeType = 'image/jpeg';
    } else {
      fileId = document.file_id;
      mimeType = document.mime_type;
    }
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      return [];
    }
    
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    
    await ensureDir(IMAGES_DIR);
    const imagePath = path.join(IMAGES_DIR, `${messageId}_${Date.now()}.jpg`);
    
    await downloadImage(fileUrl, imagePath);
    console.log(`Downloaded image to ${imagePath}`);
    
    // Try OCR-based barcode detection
    const barcodes = await scanBarcodeFromImage(imagePath);
    
    const text = ctx.message.caption || ctx.message.text || '';
    const store = detectStore(text);
    
    const coupons = [];
    for (const barcode of barcodes) {
      coupons.push({
        store: store,
        barcode: barcode,
        title: `${store.toUpperCase()} Coupon (Bild)`,
        description: text || 'Aus Bild gescannt',
        validUntil: generateValidUntil(),
      });
    }
    
    return coupons;
  } catch (error) {
    console.error('Error processing photo:', error);
    return [];
  }
}

async function scanBarcodeFromImage(imagePath) {
  const barcodes = [];
  
  try {
    // Try tesseract.js for OCR
    const { createWorker } = require('tesseract.js');
    const sharp = require('sharp');
    
    const processedBuffer = await sharp(imagePath)
      .greyscale()
      .normalize()
      .threshold(128)
      .toBuffer();
    
    const worker = await createWorker('deu+eng');
    const { data: { text } } = await worker.recognize(processedBuffer);
    await worker.terminate();
    
    console.log('OCR Text found:', text);
    
    // Find numbers (barcodes)
    const numberMatches = text.match(/\b\d{8,13}\b/g);
    if (numberMatches) {
      for (const num of numberMatches) {
        if (!barcodes.includes(num)) {
          barcodes.push(num);
        }
      }
    }
    
    // Look for Payback codes
    const paybackMatch = text.match(/PB[\s:]*(\d+)/i);
    if (paybackMatch && !barcodes.includes(paybackMatch[1])) {
      barcodes.push(paybackMatch[1]);
    }
    
  } catch (error) {
    console.log('OCR error:', error.message);
  }
  
  return [...new Set(barcodes)];
}

// Bot commands
bot.command('start', (ctx) => {
  ctx.reply(`
🎫 **Payback Coupon Bot**

Ich scanne Barcodes aus Bildern, die du mir sendest!

**So funktioniert es:**
1. Leitet mir ein Coupon-Bild aus der Gruppe weiter
2. Oder sendet mir direkt ein Bild mit Barcode
3. Ich scanne den Code und speichere den Coupon

**Befehle:**
/help - Hilfe anzeigen
/status - Bot-Status
/latest - Neueste Coupons
/scan - Bild scannen
/stats - Statistik
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

// Handle messages - works in private chat AND groups
bot.on(['text', 'photo', 'document'], async (ctx) => {
  // Process text coupons (mainly for groups)
  const text = ctx.message.text || ctx.message.caption || '';
  
  if (text.trim()) {
    const detectedCoupons = parseCoupon(text, text);
    
    if (detectedCoupons.length > 0) {
      const existingCoupons = await loadCoupons();
      const newCoupons = [];

      for (const coupon of detectedCoupons) {
        const exists = existingCoupons.some(c => c.barcode === coupon.barcode);
        if (!exists) {
          const newCoupon = {
            id: `telegram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: coupon.title,
            description: coupon.description,
            barcode: coupon.barcode,
            barcodeType: 'CODE128',
            store: coupon.store,
            discountType: 'percent',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: generateValidUntil(),
            used: false,
            createdAt: new Date().toISOString(),
            source: 'telegram',
            messageId: ctx.message.message_id,
          };
          
          newCoupons.push(newCoupon);
          existingCoupons.push(newCoupon);
        }
      }

      if (newCoupons.length > 0) {
        await saveCoupons(existingCoupons);
        
        let response = `✅ **${newCoupons.length} Coupon(s) erkannt!**\n\n`;
        newCoupons.forEach((coupon, index) => {
          response += `${index + 1}. ${coupon.title}\n`;
          response += `   Code: \`${coupon.barcode}\`\n\n`;
        });
        
        ctx.reply(response, { parse_mode: 'Markdown' });
        
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
  }

  // Process images - works in private chat AND groups
  if (ctx.message.photo || (ctx.message.document && ctx.message.document.mime_type?.startsWith('image/'))) {
    const chatId = ctx.from.id;
    
    ctx.reply('🖼️ Bild wird gescannt...').catch(console.error);
    
    const coupons = await processPhotoMessage(ctx);
    
    if (coupons.length > 0) {
      const existingCoupons = await loadCoupons();
      const newCoupons = [];

      for (const coupon of coupons) {
        const exists = existingCoupons.some(c => c.barcode === coupon.barcode);
        if (!exists) {
          const newCoupon = {
            id: `telegram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: coupon.title,
            description: coupon.description || '',
            barcode: coupon.barcode,
            barcodeType: coupon.barcode.length <= 8 ? 'EAN8' : 'EAN13',
            store: coupon.store,
            discountType: 'percent',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: coupon.validUntil || generateValidUntil(),
            used: false,
            createdAt: new Date().toISOString(),
            source: 'telegram',
            messageId: ctx.message.message_id,
          };
          
          newCoupons.push(newCoupon);
          existingCoupons.push(newCoupon);
        }
      }

      if (newCoupons.length > 0) {
        await saveCoupons(existingCoupons);
        
        let response = `✅ **${newCoupons.length} Coupon(s) aus Bild gefunden!**\n\n`;
        newCoupons.forEach((coupon, index) => {
          response += `${index + 1}. ${coupon.title}\n`;
          response += `   Code: \`${coupon.barcode}\`\n`;
          response += `   Store: ${coupon.store}\n\n`;
        });
        
        ctx.reply(response, { parse_mode: 'Markdown' });
        
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
      } else {
        ctx.reply('⚠️ Keine neuen Coupons gefunden. Diese Barcodes existieren bereits.');
      }
    } else {
      ctx.reply('❌ Keine Barcodes im Bild gefunden. Versuche ein schärferes Bild.');
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