const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀  Portfolio API  →  http://localhost:${PORT}`);
  console.log(`    Health         →  http://localhost:${PORT}/api/health`);
  console.log(`    Environment    →  ${process.env.NODE_ENV || 'development'}`);
  const emailOk = process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'xxxx-xxxx-xxxx-xxxx';
  console.log(
    `    Email alerts   →  ${emailOk ? '✅ Enabled (' + process.env.GMAIL_USER + ')' : '⚠️  Disabled (add GMAIL_APP_PASSWORD to .env)'}`
  );
  console.log(`    Admin slug     →  /${process.env.ADMIN_SECRET_SLUG || 'secure-portal-ar2026'}\n`);
});
