const databaseManager = require('../db');
const { logger } = require('./winston');
const log = logger();

async function deleteUser(username, email) {
    const db = await databaseManager();
    const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    if (existingUser.length === 0) {
        log.warn(`[src/utils/query.js] Account '${username}' does not exist: Cannot delete.`);
        return { message: 'Account not found' };
    }
    const [result] = await db.execute(
        'DELETE FROM users WHERE email = ? OR username = ?',
        [email, username]
    ); 
    if (result.affectedRows > 0) {
        log.info(`[src/utils/query.js] Account '${username}' deleted successfully.`);
        return { message: 'Account deleted successfully' };
    } else {
        log.error(`[src/utils/query.js] Failed to delete account '${username}'.`);
        return { message: 'Failed to delete account' };
    }
}

async function insertUser(username, email, password, role = 'user', status = 'active') {
    const db = await databaseManager();
    const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    if (existingUser.length > 0) {
        log.warn(`[src/utils/query.js] Account '${username}' already exists: Skipping account.`);
        return { message: 'Account already exists' };
    }
    const [result] = await db.execute(
        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [username, email, password, role, status]
    );
    log.info(`[src/utils/query.js] Account added: ${result.insertId}. New username is '${username}'`);
    return { message: `Account created. New username: ${username}` };
}

async function alterUser(username, email, newUsername, newEmail, newPassword, newRole, newStatus) {
    const db = await databaseManager();
    
    const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    
    if (existingUser.length === 0) {
        log.warn(`[src/utils/query.js] Account '${username}' does not exist: Cannot update.`);
        return { message: 'Account not found' };
    }
    
    let updateFields = [];
    let updateValues = [];

    if (newUsername) {
        updateFields.push('username = ?');
        updateValues.push(newUsername);
    }
    if (newEmail) {
        updateFields.push('email = ?');
        updateValues.push(newEmail);
    }
    if (newPassword) {
        updateFields.push('password = ?');
        updateValues.push(newPassword);
    }
    if (newRole) {
        updateFields.push('role = ?');
        updateValues.push(newRole);
    }
    if (newStatus) {
        updateFields.push('status = ?');
        updateValues.push(newStatus);
    }
    if (updateFields.length === 0) {
        log.warn(`[src/utils/query.js] No changes provided for '${username}' account.`);
        return { message: 'No changes provided' };
    }
    const [result] = await db.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE email = ? OR username = ?`,
        [...updateValues, email, username]
    );
    if (result.affectedRows > 0) {
        log.info(`[src/utils/query.js] Account '${username}' updated successfully.`);
        return { message: 'Account updated successfully' };
    } else {
        log.error(`[src/utils/query.js] Failed to update account '${username}'.`);
        return { message: 'Failed to update account' };
    }
}

async function getUser(username, email) {
    const db = await databaseManager();
    const [users] = await db.execute(
        'SELECT userid, username, email, password, role, status FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    if (users.length === 0) {
        log.warn(`[src/utils/query.js] Cannot retrieve info: Account '${username || email}' not found`);
        return { message: 'Account not found' };
    }
    const user = users[0];
    log.info(`[src/utils/query.js] Retrieved user details for '${user.username}'.`);
    return {
        id: user.userid,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        status: user.status
    };
}

async function createSession(userId, username, sessionId, expiryDays = 7) {
    const db = await databaseManager();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays); // Set expiry

    await db.execute(
        'INSERT INTO sessions (userid, username, session_id, expires_at) VALUES (?, ?, ?, ?)',
        [userId, username, sessionId, expiresAt]
    );

    log.info(`[src/utils/queries.js] Session created for '${username}', expires at ${expiresAt}.`);
    return { message: 'Session created', sessionId, expiresAt };
}

async function getSession(sessionId) {
    const db = await databaseManager();
    const [sessions] = await db.execute(
        'SELECT * FROM sessions WHERE session_id = ?',
        [sessionId]
    );

    if (sessions.length === 0) {
        log.warn(`[src/utils/queries.js] Session '${sessionId}' not found.`);
        return { message: 'Session not found' };
    }

    return sessions[0];
}

async function deleteSession(sessionId) {
    const db = await databaseManager();
    const [result] = await db.execute(
        'DELETE FROM sessions WHERE session_id = ?',
        [sessionId]
    );

    if (result.affectedRows > 0) {
        log.info(`[src/utils/queries.js] Session '${sessionId}' deleted.`);
        return { message: 'Session deleted' };
    } else {
        log.warn(`[src/utils/queries.js] Session '${sessionId}' not found.`);
        return { message: 'Session not found' };
    }
}

async function deleteExpiredSessions() {
    const db = await databaseManager();
    const [result] = await db.execute(
        'DELETE FROM sessions WHERE expires_at < NOW()'
    );

    if (result.affectedRows > 0) {
        log.info(`[src/utils/queries.js] ${result.affectedRows} expired sessions deleted.`);
    }
}

setInterval(deleteExpiredSessions, 10000);

module.exports = { insertUser, deleteUser, alterUser, getUser, createSession, deleteSession, getSession };