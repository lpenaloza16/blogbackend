require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const BlogPost = require("./blogPostModel");

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

// Middlewares
app.use(bodyParser.json());

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Routes
app.get("/posts", async (req, res) => {
  try {
    const posts = await BlogPost.find();
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

app.post("/post", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(422).json({
      message: "Invalid input, please provide title and content",
    });
  }

  const newPost = new BlogPost({ title, content });

  try {
    await newPost.save();
    res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
});

app.delete("/post/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await BlogPost.deleteOne({ _id: postId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted", postId: postId });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
