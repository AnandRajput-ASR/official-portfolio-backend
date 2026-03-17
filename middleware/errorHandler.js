const { SERVER_ERROR } = require('../utils/constant');

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || SERVER_ERROR;

  console.error('[ERROR]', {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
};

module.exports = { errorHandler, notFoundHandler };
