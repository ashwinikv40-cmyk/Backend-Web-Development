
const express = require('express');
const postController = require('./controllers/postController');

const app = express();

app.use(express.json());

app.get('/posts', postController.list);
app.get('/posts/:id', postController.get);
app.post('/posts', postController.create);
app.patch('/posts/:id', postController.update);
app.delete('/posts/:id', postController.remove);

// Centralized error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Preserve known application errors, such as validation errors.
  if (error.statusCode && error.statusCode < 500) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Duplicate record or relationship errors.
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with these details already exists',
    });
  }

  if (error.code === 'P2003') {
    return res.status(400).json({
      error: 'Related record does not exist or the operation violates a relationship constraint',
    });
  }

  // Do not expose internal database details.
  return res.status(500).json({
    error: 'Internal server error',
  });
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log('API listening');
  });
}

module.exports = app;
