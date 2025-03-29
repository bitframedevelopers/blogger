const express = require("express");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const app = express();
const PORT = 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static("public"));

// Read all markdown files in the posts directory
function getPosts() {
    const postsDir = path.join(__dirname, "posts");
    if (!fs.existsSync(postsDir)) return []; // Ensure posts directory exists

    const files = fs.readdirSync(postsDir);
    return files
        .filter(file => file.endsWith(".md")) // Only process Markdown files
        .map(file => {
            const filePath = path.join(postsDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const { data } = matter(fileContent);
            return { ...data, slug: file.replace(".md", "") };
        });
}

// Homepage - List all posts
app.get("/", (req, res) => {
    const posts = getPosts();
    res.render("index", { posts });
});

// Post page
app.get("/post/:slug", (req, res) => {
    const slug = req.params.slug;
    const filePath = path.join(__dirname, "posts", `${slug}.md`);

    if (!fs.existsSync(filePath)) return res.status(404).send("Post not found");

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Render the post with the markdown content processed
    res.render("post", {
        title: data.title || "Untitled",
        author: data.author || "Unknown",
        date: data.date || "No date",
        tags: data.tags || [],
        content: marked(content),  // Ensure markdown is converted to HTML
    });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://localhost:${PORT}`));
