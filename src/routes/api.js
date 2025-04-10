const express = require('express');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const env = process.env;

router.get('/name', (req, res) => {
    res.json({ name: env.blog_name });
});

module.exports = router;