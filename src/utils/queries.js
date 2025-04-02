const databaseManager = require('../db');
const { logger } = require('./winston');
const log = logger();

async function insertUser(username, email, password, role = 'user', status = 'active') {
    const db = await databaseManager();
    const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    if (existingUser.length > 0) {
        log.warn(`Account '${username}' already exists: Skipping account.`);
        return { message: 'Account already exists' };
    }
    const [result] = await db.execute(
        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [username, email, password, role, status]
    );
    log.info(`Account added: ${result.insertId}. New username is '${result.username}'`);
}

module.exports = { insertUser };