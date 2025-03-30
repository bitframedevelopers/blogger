const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(__dirname, "../posts");

function getPosts() {
    if (!fs.existsSync(postsDir)) return [];

    const files = fs.readdirSync(postsDir);
    return files
        .filter(file => file.endsWith(".md"))
        .map(file => {
            const filePath = path.join(postsDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const { data } = matter(fileContent);
            return { ...data, slug: file.replace(".md", "") };
        });
}

function getPost(slug) {
    const filePath = path.join(postsDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return matter(fileContent);
}

module.exports = { getPosts, getPost };