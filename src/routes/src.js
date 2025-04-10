const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/credit.js", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'credit.js'));
});

module.exports = router;