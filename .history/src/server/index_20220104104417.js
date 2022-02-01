const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));