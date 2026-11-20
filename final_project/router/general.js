const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.entries(books)
    .filter(([, book]) => book.author.toLowerCase() === author.toLowerCase())
    .reduce((acc, [key, book]) => {
      acc[key] = book;
      return acc;
    }, {});
  return res.status(200).json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.entries(books)
    .filter(([, book]) => book.title.toLowerCase() === title.toLowerCase())
    .reduce((acc, [key, book]) => {
      acc[key] = book;
      return acc;
    }, {});
  return res.status(200).json(matchingBooks);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

// Task 11: Axios helpers (Promises & async/await)
function getAllBooksAsync() {
  return axios.get(${BASE_URL}/).then((response) => response.data);
}

async function getBookByISBNAsync(isbn) {
  const response = await axios.get(${BASE_URL}/isbn/${encodeURIComponent(isbn)});
  return response.data;
}

async function getBooksByAuthorAsync(author) {
  const response = await axios.get(${BASE_URL}/author/${encodeURIComponent(author)});
  return response.data;
}

async function getBooksByTitleAsync(title) {
  const response = await axios.get(${BASE_URL}/title/${encodeURIComponent(title)});
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
