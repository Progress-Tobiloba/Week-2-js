const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure secure browser session state memory
app.use(session({
    secret: 'progress_hidden_vault_key_9981',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour
}));

// Hardcoded Master Credentials (Securely Hashed)
const MASTER_USER = "Progress";
const MASTER_HASH = "$2a$10$7Z2vA72Wd6mGvqgXgqO8Eu11v78bK1wY2mN4M3XbO9P8Q7R6S5T1u";

// Authentication Gatekeeper Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }
    // If not authenticated, instantly block access or redirect
    res.status(401).sendFile(path.join(__dirname, 'public', 'login.html'));
};

// 1. LOGIN CONTROLLER ENDPOINT
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (username !== MASTER_USER) {
        return res.status(401).send("Unauthorized Access Protocol.");
    }

    try {
        const match = await bcrypt.compare(password, MASTER_HASH);
        if (match) {
            req.session.authenticated = true;
            req.session.user = username;
            return res.send("Success");
        } else {
            return res.status(401).send("Invalid credentials.");
        }
    } catch (error) {
        return res.status(500).send("Authentication server error.");
    }
});

// 2. LOGOUT ENDPOINT
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.send("Logged out");
});

// Serve the login screen publicly
app.get('/', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protect the entire private dashboard asset layer
app.get('/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Publicly expose static assets safely except the actual dashboard layout
app.use(express.static('public', { index: false }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Secure Private Vault online on port ${PORT}`);
});
