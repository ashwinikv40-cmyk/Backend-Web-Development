/**
 * requestId middleware  [mount GLOBALLY in app.js]
 *
 * TODO: export a middleware function (req, res, next) that:
 *   - generates a UUID with crypto.randomUUID()
 *   - attaches it to req.id            (so later middleware/handlers can read it)
 *   - sets it as the "X-Request-Id" response header
 *   - calls next() so the request continues down the pipeline
 */

const crypto = require("crypto");

function requestId(req, res, next) {
  const id = crypto.randomUUID();

  req.id = id;

  res.setHeader("X-Request-Id", id);

  next();
}

module.exports = requestId;