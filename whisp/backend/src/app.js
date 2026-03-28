const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { registerRoutes } = require('./http/routes');

function createApp(reportsStore) {
  const app = express();
  app.set('jwtSecret', process.env.JWT_SECRET || 'whisp-secret-key-change-in-production');

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  registerRoutes(app, reportsStore);
  return app;
}

module.exports = { createApp };
