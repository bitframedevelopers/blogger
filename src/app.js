const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { logger } = require('./utils/winston');
const log = logger();
dotenv.config();
const app = express();
const v = "alphadev-1.0.0"

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log.info(`Incoming request from: ${ip} - ${req.method} ${req.url}`);
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

const staticRoutes = require("./routes/static");
const apiRoutes = require("./routes/api");
app.use(staticRoutes);
app.use(apiRoutes);

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

app.listen(process.env.port, "0.0.0.0", () => {
    log.info(`Thanks for using Blogger! Made with ❤️ by bit-frame`);
    log.info(`Server Version ${v} | Access at 0.0.0.0:${process.env.port}`);
});