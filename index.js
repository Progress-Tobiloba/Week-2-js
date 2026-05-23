require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. JSON Parsing Middleware
app.use(express.json());

// BONUS: Custom Middleware to Log Requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// 2. Serve Static HTML Page at /
app.use(express.static('public'));

// GET /api -> Fallback endpoint
app.get('/api', (req, res) => {
    res.send("My Week 2 API!");
});

// POST /user -> Accepts {name, email}; responds "Hello, [name]!"
app.post('/user', (req, res) => {
    const { name, email } = req.body;

    // Error handling: 400 for missing data
    if (!name || !email) {
        return res.status(400).json({ error: "Missing required data: name and email are required." });
    }

    res.send(`Hello, ${name}!`);
});

// GET /user/:id -> "User [id] profile."
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`User ${userId} profile.`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});

