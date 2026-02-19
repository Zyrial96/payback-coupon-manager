require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const COUPONS_FILE = path.join(__dirname, 'coupons.json');

// Middleware
app.use(cors());
app.use(express.json());

// API Key middleware
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Load coupons helper
async function loadCoupons() {
  try {
    const data = await fs.readFile(COUPONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all coupons (protected)
app.get('/api/coupons', apiKeyMiddleware, async (req, res) => {
  try {
    const coupons = await loadCoupons();
    res.json({
      success: true,
      count: coupons.length,
      coupons: coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest coupons
app.get('/api/coupons/latest', apiKeyMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const coupons = await loadCoupons();
    const latest = coupons
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    res.json({
      success: true,
      count: latest.length,
      coupons: latest,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get coupons by type
app.get('/api/coupons/type/:type', apiKeyMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const coupons = await loadCoupons();
    const filtered = coupons.filter(c => c.type === type);
    
    res.json({
      success: true,
      count: filtered.length,
      coupons: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stats
app.get('/api/stats', apiKeyMiddleware, async (req, res) => {
  try {
    const coupons = await loadCoupons();
    const typeCount = coupons.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      stats: {
        total: coupons.length,
        byType: typeCount,
        lastUpdated: coupons.length > 0 
          ? coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook for new coupons (called by bot)
app.post('/webhook/new-coupons', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // This could trigger push notifications to the web app
  // or update a real-time socket connection
  
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;