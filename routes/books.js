const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {
  db.query('SELECT * FROM books', (err, books) => {
    if (err) throw err;
    res.render('books', { books });
  });
});

router.get('/loan/:book_id', (req, res) => {
  const { book_id } = req.params;
  db.query('SELECT * FROM books WHERE book_id = ?', [book_id], (err, books) => {
    if (err) throw err;
    if (books.length === 0) return res.status(404).send('Book not found');
    res.render('loanForm', { book: books[0] });
  });
});



module.exports = router;
