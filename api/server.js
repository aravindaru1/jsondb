const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const path = require('path');
const filePath = path.join('db.json');
const data = fs.readFileSync(filePath, "utf-8");
let db = JSON.parse(data);
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();
const express = require('express');

server.use(express.json()); // Add this line to parse JSON request bodies
server.use(middlewares);

// Custom route to handle likes
server.post('/posts/:articleId/like', (req, res) => {
  const articleId = req.params.articleId;
  console.log(`Received like request for articleId: ${articleId}`);

  let post = db.posts[articleId] && db.posts[articleId][0];
  if (!post) {
    // If the post doesn't exist, create a new entry
    post = {
      article_id: articleId,
      numberoflikes: 0,
      numberofcomments: 0,
      comments: []
    };
    db.posts[articleId] = [post];
  }

  post.numberoflikes += 1;
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  res.json(post);
});

// Custom route to handle comments
server.post('/posts/:articleId/comment', (req, res) => {
  const articleId = req.params.articleId;
  console.log(`Received comment request for articleId: ${articleId}`);
  console.log(`Request body:`, req.body); // Add this line to log the request body

  const { guest, comment, time } = req.body;

  if (!guest || !comment || !time) {
    return res.status(400).json({ error: 'Missing required fields: guest, comment, or time' });
  }

  try {
    let post = db.posts[articleId] && db.posts[articleId][0];
    if (!post) {
      // If the post doesn't exist, create a new entry
      post = {
        article_id: articleId,
        numberoflikes: 0,
        numberofcomments: 0,
        comments: []
      };
      db.posts[articleId] = [post];
    }

    const newComment = {
      guest: guest,
      comment: comment,
      time: time
    };
    post.comments.push(newComment);
    post.numberofcomments += 1;
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    res.json(post);
  } catch (error) {
    console.error(`Error handling comment request: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Custom route to fetch a specific article by article_id
server.get('/posts/:articleId', (req, res) => {
  const articleId = req.params.articleId;
  console.log(`Received request for articleId: ${articleId}`);

  let post = db.posts[articleId] && db.posts[articleId][0];
  if (!post) {
    console.log(`Article with articleId ${articleId} not found`);
    return res.status(404).json({ error: 'Article not found' });
  }

  console.log(`Found article:`, post);
  res.json(post);
});

server.use(jsonServer.rewriter({}));
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

// Export the Server API
module.exports = server;
