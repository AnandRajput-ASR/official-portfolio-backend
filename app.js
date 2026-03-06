require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthHandler = require('./middleware/health');

const app = express();

app.use(cors({
    origin: ['http://localhost:4200'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});


app.use('/api/auth', authRoutes);

app.get('/api/health', healthHandler);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
