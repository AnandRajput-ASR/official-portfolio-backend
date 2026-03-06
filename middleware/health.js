const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    node: process.version,
  });
};

module.exports = healthHandler;
