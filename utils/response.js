/**
 * Standardised API response helpers.
 * Usage: const { ok, created, fail } = require('../utils/response');
 */

function ok(res, data, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

function created(res, data, message = 'Created successfully') {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

function fail(res, message = 'Internal server error', status = 500) {
  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = { ok, created, fail };
