const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { logger } = require('./utils/winston');
const rateLimit = require("express-rate-limit");
const log = logger();
dotenv.config();
const app = express();
const v = require('./v.json');
const { insertUser, deleteUser, alterUser, getUser, createSession, getSession, deleteSession } = require('./utils/queries');
const env = process.env;
const { getIP } = require('./utils/functions');
const cors = require('cors');

const limiter = rateLimit({
    windowMs: 10 * 1000,
    max: env.ratelimit_maxreq_per10sec,
    keyGenerator: getIP,
    message: "Too many requests, please try again later.",
    headers: true,
    handler: (req, res, next) => {
        const ip = getIP(req);
        log.warn(`[rate-limit] IP ${ip} exceeded rate limit: ${req.method} ${req.url}`);
        res.status(429).json({ error: "Too many requests, please try again later." });
    },
});

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log.info(`[client-ip] Incoming request from: ${ip} - ${req.method} ${req.url}`);
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

const staticRoutes = require("./routes/pages");
const apiRoutes = require("./routes/api");
const srcRoutes = require("./routes/src");
const authRoutes = require("./routes/auth");
app.use(cors());
app.use(express.json());
app.use(staticRoutes);
app.use('/v1', apiRoutes);
app.use('/src', srcRoutes);
app.use('/account', authRoutes);
app.use(limiter);

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

app.use((err, req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log.error(`Client IP: ${clientIp}, Error: ${err.stack}`);
    res.status(500).send("Internal Server Error. Please try again later.");
});


app.listen(process.env.port, "0.0.0.0", () => {
    log.info(`Thanks for using Blogger! Made with ❤️ by Linus Kang`);
    log.info(`Version: ${v.version} build ${v.build}`);
    log.info(`Blogger is ready on port ${process.env.port}`);
    insertUser(env.root_account_username, env.root_account_email, env.root_account_password, 'admin');
});