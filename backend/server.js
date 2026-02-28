const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

console.log('--- Startup Diagnostics ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('---------------------------');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB().catch(err => {
    console.error('❌ MongoDB Connection Failure during startup:', err.message);
});

// Routes
try {
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/books', require('./routes/bookRoutes'));
    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
}

// Health check
app.get('/', (req, res) => {
    res.json({
        message: '📚 Library Management API is running!',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Error handling and listen logic... (omitted for brevity, keeping original structure below)
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);
    res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;
