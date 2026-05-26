const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Temporary in-memory array to simulate a database array
const usersDatabase = [];

// 1. REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const userExists = usersDatabase.find(u => u.username === username);
        if (userExists) {
            return res.status(400).send("Username already taken!");
        }

        // Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save user details to our "database"
        usersDatabase.push({
            username: username,
            password: hashedPassword
        });

        console.log(`\n[REGISTRATION] New User Added: ${username}`);
        console.log(`[DATABASE STORED] Password encrypted to: ${hashedPassword}`);
        
        res.send("Account created securely!");
    } catch (error) {
        res.status(500).send("Error creating account.");
    }
});

// 2. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Look up the user
        const user = usersDatabase.find(u => u.username === username);
        if (!user) {
            return res.status(400).send("User not found!");
        }

        // Securely compare the typed password with the scrambled hash
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            console.log(`\n[LOGIN] Success! User "${username}" authenticated.`);
            res.send("Welcome back! Login successful.");
        } else {
            console.log(`\n[LOGIN] Failed! Incorrect password attempted for user "${username}".`);
            res.status(400).send("Invalid credentials!");
        }
    } catch (error) {
        res.status(500).send("Server error during verification.");
    }
});

app.listen(3000, () => {
    console.log('Secure Server running smoothly on port 3000');
});
