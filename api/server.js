const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const path = require('path');
const filePath = path.join('db.json');
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom route to handle likes
server.post('/posts/:articleId/like', (req, res) => {
  const articleId = req.params.articleId;
  const post = db.posts.find(p => p.article_id === articleId);
  if (post) {
    if (!post.numberoflikes) {
      post.numberoflikes = 0;
    }
    post.numberoflikes += 1;
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

// Custom route to handle comments
server.post('/posts/:articleId/comment', (req, res) => {
  const articleId = req.params.articleId;
  const post = db.posts.find(p => p.article_id === articleId);
  if (post) {
    const newComment = {
      guest: `guest-${Date.now()}`,
      comment: req.body.comment,
      time: new Date().toLocaleString()
    };
    if (!post.comments) {
      post.comments = [];
    }
    post.comments.push(newComment);
    if (!post.numberofcomments) {
      post.numberofcomments = 0;
    }
    post.numberofcomments += 1;
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

server.use(jsonServer.rewriter({}));
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});

// Export the Server API
module.exports = server;
