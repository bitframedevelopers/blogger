const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

const staticRoutes = require("./routes/static");
app.use(staticRoutes);

app.listen(process.env.port, "0.0.0.0", () =>
    console.log(`Server running at http://localhost:${process.env.port}`)
);