
'use strict';

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  // 1. Check for Idempotency-Key
  const key = req.headers['idempotency-key'];

  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  // 2. Return stored response if key already exists
  if (idempotency.has(key)) {
    const storedResponse = idempotency.get(key);

    return res.status(storedResponse.status).json(storedResponse.body);
  }

  // 3. Create exactly one new charge
  const amount = req.body && req.body.amount;

  const charge = {
    id: nextChargeId(),
    amount,
    status: 'charged'
  };

  charges.push(charge);

  // Store the complete response
  const response = {
    id: charge.id,
    amount: charge.amount,
    status: charge.status
  };

  idempotency.set(key, {
    status: 201,
    body: response
  });

  return res.status(201).json(response);
});

module.exports = router;
