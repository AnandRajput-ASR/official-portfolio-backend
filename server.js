const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n🚀  Portfolio API  →  http://localhost:${PORT}`);
    console.log(`    Health         →  http://localhost:${PORT}/api/health`);
    console.log(`    Environment    →  ${process.env.NODE_ENV || 'development'}`);
});
