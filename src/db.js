const mysql = require('mysql2/promise');
const { logger } = require('./utils/winston');
const log = logger();
const dotenv = require("dotenv");
dotenv.config();
const env = process.env

async function dbManager() {
    try {
        const db = await mysql.createConnection({
            host: env.database_host,
            user: env.database_user,
            password: env.database_password,
            database: env.database_name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0 
        });
        return db;
    } catch (err) {
        log.error('[src/db.js] Database connection failed: ' + err);
        throw err;
    }
}

module.exports = dbManager;