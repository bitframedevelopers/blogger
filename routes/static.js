const express = require("express");
const { getPosts, getPost } = require("../utils/posts");
const { marked } = require("marked");

const router = express.Router();

router.get("/post/:slug", (req, res) => {
    const post = getPost(req.params.slug);
    if (!post) return res.status(404).send("Post not found");

    res.render("post", {
        title: post.data.title || "Untitled",
        author: post.data.author || "Unknown",
        date: post.data.date || "No date",
        tags: post.data.tags || [],
        content: marked(post.content),
    });
});

router.get("/", (req, res) => {
    const posts = getPosts();
    res.render("index", { posts });
});

module.exports = router;
