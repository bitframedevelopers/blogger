## Blogger: A Nodejs framework for creating blogging sites.
Blogger is a all-in-one nodejs framework for people who want a simple, sleek blogging site.

### Getting Started
To use Blogger, you will need the following installed:
``nodejs``
``npm``

1. To start using blogger, clone this repository using
```
git clone https://github.com/bitframedevelopers/blogger.git
```

2. Next, you will need to install all the libaries required using ``npm install``

3. You will need to create the following files/folders: ``.env`` inside the main folder, and the ``posts`` directory inside ``/src``

Your new added files structure should look like this, with ``.env`` and ``posts/``:
```
blogger/
├── src/
|   └── posts/
└──.env
```

4. Your ``.env`` file should have the following structure:
```
port=4100
```

5. You can start a development server by running this inside the terminal
```
npm run dev
```

6. Start writing your blog posts! You need to write them inside the ``/posts`` directory. Each post should consist of a ``.md`` file with the following structure:
```md
---
title: "My First Blog Post"
author: "Author name"
date: "2025-03-29"
tags: ["blogging", "markdown", "web"]
---

This is my first post! Wow it works!
```

After writing the post, just save it! No need to restart the webserver since Blogger automatically updates with all blog posts!
