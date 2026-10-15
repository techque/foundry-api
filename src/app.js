const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'foundry-api' });
});

const authRoutes = require('./modules/auth/routes/auth.routes');
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.error('Unhandled request error:', error);
  return res.status(500).json({
    error: 'An unexpected error occurred on the server',
  });
});

module.exports = app;
