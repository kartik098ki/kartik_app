import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  searchTrainBetweenStations,
  liveAtStation
} from 'railkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize RailKit with the user's active API key
configure('irctc_a0477021c3cdc7d547c18c196b9f39b871c9f02621e2bd86');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory where assets and frontend files reside
app.use(express.static(path.join(__dirname, '..')));

// Serve all Clerk JS SDK static files from dist folder (ensures dynamic chunks load successfully)
app.use(express.static(path.join(__dirname, '..', 'node_modules', '@clerk', 'clerk-js', 'dist')));

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────

// GET /api/pnr/:pnrNumber — Check PNR status
app.get('/api/pnr/:pnrNumber', async (req, res) => {
  try {
    const { pnrNumber } = req.params;
    console.log(`Checking PNR Status for PNR: ${pnrNumber}`);
    const data = await checkPNRStatus(pnrNumber);
    res.json({ success: true, data });
  } catch (error) {
    console.error('PNR Status Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch PNR status',
    });
  }
});

// GET /api/train-info/:trainNumber — Get train information
app.get('/api/train-info/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    console.log(`Checking Train Info for: ${trainNumber}`);
    const data = await getTrainInfo(trainNumber);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Train Info Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch train information',
    });
  }
});

// GET /api/track-train/:trainNumber/:date — Track a running train
app.get('/api/track-train/:trainNumber/:date', async (req, res) => {
  try {
    const { trainNumber, date } = req.params;
    console.log(`Tracking Train: ${trainNumber} for Date: ${date}`);
    
    // Try the provided date first
    let data = await trackTrain(trainNumber, date);
    
    // If it fails, try yesterday (many trains start previous day and arrive today)
    if (!data.success) {
      const [d, m, y] = date.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      dateObj.setDate(dateObj.getDate() - 1);
      const yDate = `${String(dateObj.getDate()).padStart(2,'0')}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${dateObj.getFullYear()}`;
      console.log(`  Today failed, trying yesterday: ${yDate}`);
      data = await trackTrain(trainNumber, yDate);
    }
    
    // If still fails, try without date (SDK default)
    if (!data.success) {
      console.log(`  Yesterday also failed, trying without date...`);
      data = await trackTrain(trainNumber);
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Track Train Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track train',
    });
  }
});

// GET /api/search-trains/:from/:to — Search trains between stations
app.get('/api/search-trains/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    console.log(`Searching Trains from ${from} to ${to}`);
    const data = await searchTrainBetweenStations(from, to);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Search Trains Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search trains between stations',
    });
  }
});

// GET /api/live-station/:stnCode — Get live station data
app.get('/api/live-station/:stnCode', async (req, res) => {
  try {
    const { stnCode } = req.params;
    console.log(`Checking Live Station status for: ${stnCode}`);
    const data = await liveAtStation(stnCode);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Live Station Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live station data',
    });
  }
});

// ──────────────────────────────────────────────
// Fallback — serve index.html for SPA routing
// ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
// Start server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚆 RailQuick server running at http://localhost:${PORT}`);
  });
}

export default app;
