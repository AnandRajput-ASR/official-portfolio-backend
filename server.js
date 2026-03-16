const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀  Portfolio API  →  http://localhost:${PORT}`);
  console.log(`    Health         →  http://localhost:${PORT}/api/health`);
  console.log(`    Environment    →  ${process.env.NODE_ENV || 'development'}`);
  const emailOk = process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'xxxx-xxxx-xxxx-xxxx';
  console.log(
    `    Email alerts   →  ${emailOk ? '✅ Enabled (' + process.env.GMAIL_USER + ')' : '⚠️  Disabled (add GMAIL_APP_PASSWORD to .env)'}`
  );
  console.log(`    Admin slug     →  ${process.env.ADMIN_SECRET_SLUG ? '✅ Configured' : '⚠️  Using default'}\n`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  server.close(() => {
    console.log('[SERVER] Closed.');
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Catch unhandled errors so the process doesn't crash silently ─────────────
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  shutdown('UNCAUGHT EXCEPTION');
});
