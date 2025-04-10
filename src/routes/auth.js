const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const databaseManager = require('../db');
const { logger } = require('../utils/winston');
const log = logger();

async function authenticateUser(username, password) {
    const db = await databaseManager();
    const [users] = await db.execute(
        'SELECT userid, username, email, password, role, status FROM users WHERE username = ? OR email = ?',
        [username, username]
    );
    if (users.length === 0) {
        log.warn(`[src/routes/auth.js] Account '${username}' not found.`);
        return { message: 'Invalid credentials' };
    }
    const user = users[0];
    if (password !== user.password) {
        log.warn(`[src/routes/auth.js] Invalid password for '${username}'.`);
        return { message: 'Invalid credentials' };
    }
    return user;
}

async function generateSession(userId, username) {
    const sessionId = uuid.v4();
    const expiryDays = 7;
    const db = await databaseManager();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    await db.execute(
        'INSERT INTO sessions (userid, username, session_id, expires_at) VALUES (?, ?, ?, ?)',
        [userId, username, sessionId, expiresAt]
    );
    log.info(`[src/routes/auth.js] Session created for '${username}', expires at ${expiresAt}.`);
    return { sessionId, expiresAt };
}

router.post('/auth', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const user = await authenticateUser(username, password);
        if (user.message) {
            return res.status(401).json({ message: user.message });
        }
        const { sessionId, expiresAt } = await generateSession(user.userid, user.username);
        return res.json({
            message: 'Authentication successful',
            sessionId,
            expiresAt
        });
    } catch (err) {
        log.error(`[src/routes/auth.js] Error during authentication: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
async function checkSession(sessionId) {
    const db = await databaseManager();
    const [sessions] = await db.execute(
        'SELECT session_id, expires_at, userid FROM sessions WHERE session_id = ?',
        [sessionId]
    );
    if (sessions.length === 0) {
        log.warn(`[src/routes/auth.js] Session ID '${sessionId}' not found.`);
        return null;
    }
    const session = sessions[0];
    const currentTime = new Date();
    if (new Date(session.expires_at) < currentTime) {
        log.warn(`[src/routes/auth.js] Session ID '${sessionId}' has expired.`);
        return null;
    }
    const [users] = await db.execute(
        'SELECT username, email, role, status FROM users WHERE userid = ?',
        [session.userid]
    );
    if (users.length === 0) {
        log.warn(`[src/routes/auth.js] User with ID '${session.userid}' not found.`);
        return null;
    }
    const user = users[0];
    return { session, user };
}

// use the session token to return other user data. use the userid since its synced with other tables.
router.get('/session', async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }
    try {
        const sessionData = await checkSession(sessionId);
        if (!sessionData) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }
        const { session, user } = sessionData;
        return res.json({
            message: 'Session is valid',
            sessionId: session.session_id,
            expiresAt: session.expires_at,
            userId: session.userid,
            user: {
                username: user.username,
                email: user.email,
                password: '',
                role: user.role,
                status: user.status
            }
        });
    } catch (err) {
        log.error(`[src/routes/auth.js] Error checking session: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;