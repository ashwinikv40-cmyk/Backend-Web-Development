
const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

function handleError(error, res, next) {
  if (error.status && error.code) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  return next(error);
}

router.post('/register', async (req, res, next) => {
  try {
    const user = await authService.register(req.body || {});

    return res.status(201).json(user);
  } catch (error) {
    return handleError(error, res, next);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await authService.login(req.body || {});

    return res.status(200).json(user);
  } catch (error) {
    return handleError(error, res, next);
  }
});

module.exports = router;
