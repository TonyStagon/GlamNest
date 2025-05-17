const express = require('express');
const router = express.Router();
const { initializeFirebase } = require('../firebase');
const { auth } = initializeFirebase();

// POST /api/auth/login
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// POST /api/auth/register 
router.post('/register', async(req, res) => {
    try {
        const { email, password } = req.body;
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;