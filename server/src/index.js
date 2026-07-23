const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const scenarioRoutes = require('./routes/scenarios');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const roadmapRoutes = require('./routes/roadmap');
const errorHandler = require('./errorHandler');
const logger = require('./logger');
require('dotenv').config();

// Global uncaught exception and unhandled rejection process listeners
process.on('unhandledRejection', (reason) => {
  logger.log(`Unhandled Rejection: ${reason && reason.stack ? reason.stack : reason}`);
});

process.on('uncaughtException', (err) => {
  logger.log(`Uncaught Exception: ${err && err.stack ? err.stack : err.message}`);
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, product: 'PyBe' }));

// Route to inspect backend logs
app.get('/api/logs', (_req, res) => {
  try {
    if (!fs.existsSync(logger.logFilePath)) {
      return res.json({ logs: 'No app.log file created yet.', logCount: 0 });
    }
    const content = fs.readFileSync(logger.logFilePath, 'utf8');
    const matches = content.match(/\[\d{4}-\d{2}-\d{2}T[^\]]+\]/g);
    res.json({
      logs: content || 'app.log is empty.',
      logCount: matches ? matches.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to clear backend logs
app.delete('/api/logs', (_req, res) => {
  try {
    fs.writeFileSync(logger.logFilePath, '', 'utf8');
    res.json({ message: 'Logs cleared successfully.', logCount: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Endpoint to trigger simulated errors for testing backend logger
app.get('/api/trigger-error', (_req, _res, next) => {
  next(new Error(`Simulated test error triggered at ${new Date().toISOString()}`));
});

app.use('/api/scenarios', scenarioRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Register custom Error Handling middleware
app.use(errorHandler);

app.listen(port, () => console.log(`PyBe API running on http://localhost:${port}`));

