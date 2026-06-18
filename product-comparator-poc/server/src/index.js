const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');
const barcodeRouter = require('./routes/barcode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/analyze', analyzeRouter);
app.use('/api/barcode', barcodeRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    demoMode: process.env.DEMO_MODE !== 'false',
    hasOpenAiKey: !!process.env.OPENAI_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Server draait op http://localhost:${PORT}`);
  console.log(`📦  DEMO_MODE: ${process.env.DEMO_MODE !== 'false' ? 'AAN (mockdata)' : 'UIT (OpenAI)'}\n`);
});
