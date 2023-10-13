require("dotenv").config();

const express = require("express");
const PORT = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbUri = process.env.MONGODB_URI;
const BlogPost = require("./blogPostModel");

const app = express();

mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // ... other headers
  next();
});

app.get("/posts", async (req, res, next) => {
  try {
    const posts = await BlogPost.find();
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

app.post("/post", async (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(422).json({
      message: "Invalid input, please provide title and content",
    });
  }

  const newPost = new BlogPost({
    title,
    content,
  });

  try {
    await newPost.save();
    res.status(201).json({ message: "Post created", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
});

// Add MongoDB logic for DELETE if needed...

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// const express = require("express");
// const bodyParser = require("body-parser");
// const { v4: uuid } = require("uuid");
// const mongoose = require("mongoose");

// // local testing use only
// const fs = require("fs");
// const path = require("path");
// const POSTS_FILE_PATH = path.join(__dirname, "posts.json");

// const app = express();

// mongoose
//   .connect(
//     "X",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.log("Failed to connect to MongoDB", err);
//   });

// const BlogPost = require("./blogPostModel");

app.use(bodyParser.json());

// CORS Headers => Required for cross-origin/ cross-server communication
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// // local testing purposes

// app.get("/posts", (req, res, next) => {
//   fs.readFile(POSTS_FILE_PATH, "utf8", (err, data) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to fetch posts" });
//     }

//     const posts = JSON.parse(data || "[]");
//     res.status(200).json({ posts });
//   });
// });

// app.post("/post", (req, res, next) => {
//   const { title, content } = req.body;

//   if (!title || !content) {
//     return res
//       .status(422)
//       .json({ message: "Invalid input, please provide title and content" });
//   }

//   const newPost = {
//     id: uuid(),
//     title,
//     content,
//   };

//   fs.readFile(POSTS_FILE_PATH, "utf8", (err, data) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to save post" });
//     }

//     const posts = JSON.parse(data || "[]");
//     posts.push(newPost);

//     fs.writeFile(
//       POSTS_FILE_PATH,
//       JSON.stringify(posts, null, 2),
//       "utf8",
//       (err) => {
//         if (err) {
//           return res.status(500).json({ message: "Failed to save post" });
//         }

//         res.status(201).json({ message: "Post created", post: newPost });
//       }
//     );
//   });
// });

app.delete("/post/:postId", async (req, res, next) => {
  const postId = req.params.postId;
  console.log("Post ID to delete:", postId);

  try {
    const result = await BlogPost.deleteOne({ _id: postId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove the "Post created" line and only send a response for successful deletion.
    res.status(200).json({ message: "Post deleted", postId: postId });
  } catch (error) {
    console.error("Error deleting post:", error); // Print the error to console
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// // app.get("/posts", async (req, res, next) => {
// //   try {
// //     const posts = await BlogPost.find();
// //     res.status(200).json({ posts });
// //   } catch (error) {
// //     res.status(500).json({ message: "Failed to fetch posts" });
// //   }
// // });

// // app.post("/post", async (req, res, next) => {
// //   const { title, content } = req.body;

// //   if (!title || !content) {
// //     return res
// //       .status(422)
// //       .json({ message: "Invalid input, please provide title and content" });
// //   }

// //   const newPost = new BlogPost({
// //     title,
// //     content,
// //   });

// //   try {
// //     await newPost.save();
// //     res.status(201).json({ message: "Post created", post: newPost });
// //   } catch (error) {
// //     res.status(500).json({ message: "Failed to create post" });
// //   }
// // });

// app.listen(8000); // start Node + Express server on port 8000
