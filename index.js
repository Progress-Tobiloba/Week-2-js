const express = require('express');
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

// Hardcoded Master Credentials
const MASTER_USER = "Progress";
const MASTER_PASS = "Tobi@1974";

// Authentication Gatekeeper Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).sendFile(path.join(__dirname, 'public', 'login.html'));
};

// 1. LOGIN CONTROLLER ENDPOINT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Direct, exact comparison for absolute certainty
    if (username === MASTER_USER && password === MASTER_PASS) {
        req.session.authenticated = true;
        req.session.user = username;
        return res.send("Success");
    } else {
        return res.status(401).send("Invalid credentials.");
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
