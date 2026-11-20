const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Register a new user
public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username: username, password: password });
  return res
    .status(201)
    .json({ message: 'User successfully registered. Now you can login' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: 'Book not found' });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  Object.keys(books).forEach((key) => {
    if (books[key].author === author) {
      matchingBooks.push({
        isbn: key,
        title: books[key].title,
        reviews: books[key].reviews,
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbyauthor: matchingBooks });
  }
  return res.status(404).json({ message: 'No books found for this author' });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      matchingBooks.push({
        isbn: key,
        author: books[key].author,
        reviews: books[key].reviews,
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbytitle: matchingBooks });
  }
  return res.status(404).json({ message: 'No books found with this title' });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: 'Book not found' });
});

// Task 10: Get all books using async/await with Axios
async function getAllBooksAsync() {
  try {
    const response = await axios.get(BASE_URL + '/');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Task 11: Search by ISBN using Promises with Axios
function getBookByIsbnPromise(isbn) {
  return axios
    .get(BASE_URL + '/isbn/' + encodeURIComponent(isbn))
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}

// Task 12: Search by Author using async/await with Axios
async function getBooksByAuthorAsync(author) {
  try {
    const response = await axios.get(
      BASE_URL + '/author/' + encodeURIComponent(author)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Task 13: Search by Title using async/await with Axios
async function getBooksByTitleAsync(title) {
  try {
    const response = await axios.get(
      BASE_URL + '/title/' + encodeURIComponent(title)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByIsbnPromise = getBookByIsbnPromise;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;