
'use strict';

const crypto = require('crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  // 1. Verify HMAC-SHA256 signature
  const signature = req.headers['x-webhook-signature'];

  if (!signature || !signature.startsWith('sha256=')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const received = signature.slice(7);

  if (!/^[0-9a-fA-F]{64}$/.test(received)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');

  if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Parse the body
  const event = JSON.parse(req.body);

  // 3. Check for duplicate events
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Mark event as processed
  _processedIds.add(event.id);

  // 5. Acknowledge immediately
  res.status(200).json({ status: 'received' });

  // 6. Process event in the background
  setImmediate(() => {
    handleEvent(event);
  });
}

module.exports = { handleWebhook, _processedIds };
