
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

// Authentication endpoints
app.use('/auth', authRoutes);

// Handle malformed JSON and unexpected errors safely
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Return 400 for malformed JSON request bodies
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid JSON request body',
      },
    });
  }

  // Do not expose internal database or bcrypt error details
  console.error('Request failed with an internal error.');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
