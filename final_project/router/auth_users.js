const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  const existingUser = users.find((user) => user.username === username);
  return !existingUser;
};

const authenticatedUser = (username, password) => {
  const validUser = users.find(
    (user) => user.username === username && user.password === password
  );
  return Boolean(validUser);
};

// Only registered users can login
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res
      .status(401)
      .json({ message: 'Invalid login. Check username and password' });
  }

  const accessToken = jwt.sign({ data: username }, 'access', {
    expiresIn: 60 * 60,
  });

  req.session.authorization = {
    accessToken,
    username,
  };

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken,
  });
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;
  const username =
    (req.session &&
      req.session.authorization &&
      req.session.authorization.username) ||
    (req.user && req.user.data);

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!review) {
    return res.status(400).json({ message: 'Review content is required' });
  }

  if (!username) {
    return res.status(403).json({ message: 'User not authenticated' });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review successfully added or updated',
    reviews: books[isbn].reviews,
  });
});

// Delete a book review added by the logged-in user
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username =
    (req.session &&
      req.session.authorization &&
      req.session.authorization.username) ||
    (req.user && req.user.data);

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!username) {
    return res.status(403).json({ message: 'User not authenticated' });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: 'Review successfully deleted',
      reviews: books[isbn].reviews,
    });
  }

  return res
    .status(404)
    .json({ message: 'Review by this user not found for this ISBN' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;