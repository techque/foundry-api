const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'foundry-api' });
});

// Auth Routes will be mounted here
// const authRoutes = require('./modules/auth/routes/auth.routes');
// app.use('/auth', authRoutes);

module.exports = app;
