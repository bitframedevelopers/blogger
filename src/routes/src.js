const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/credit.js", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'credit.js'));
});

router.get("/login/styles.css", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login', 'styles.css'));
});

router.get("/signup/styles.css", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup', 'styles.css'));
});

module.exports = router;