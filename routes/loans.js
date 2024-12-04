const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/loan', (req, res) => {
  const { book_id, first_name, last_name, email, phone, address, loan_date, return_date } = req.body;

  db.query(
    'INSERT INTO students (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
    [first_name, last_name, email, phone, address],
    (err, studentResult) => {
      if (err) throw err;

      const student_id = studentResult.insertId;

      db.query(
        'INSERT INTO loans (student_id, loan_date, return_date) VALUES (?, ?, ?)',
        [student_id, loan_date, return_date],
        (err, loanResult) => {
          if (err) throw err;

          const loan_id = loanResult.insertId;
          db.query(
            'INSERT INTO loan_books (loan_id, book_id) VALUES (?, ?)',
            [loan_id, book_id],
            (err) => {
              if (err) throw err;
              res.redirect('/');
            }
          );
        }
      );
    }
  );
});

router.get('/return', (req, res) => {
  db.query('SELECT * FROM books', (err, books) => {
    if (err) throw err;
    res.render('returnForm', { books });
  });
});

router.post('/return', (req, res) => {
  const { book_id, email } = req.body;

  db.query(
    `
    SELECT l.loan_id
    FROM loans l
    INNER JOIN loan_books lb ON l.loan_id = lb.loan_id
    INNER JOIN students s ON l.student_id = s.student_id
    WHERE lb.book_id = ? AND s.email = ?
  `,
    [book_id, email],
    (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(400).send('No such loan exists for this student and book');
      }

      const loan_id = result[0].loan_id;

      // Delete the loan record
      db.query('DELETE FROM loan_books WHERE loan_id = ?', [loan_id], (err) => {
        if (err) throw err;

        db.query('DELETE FROM loans WHERE loan_id = ?', [loan_id], (err) => {
          if (err) throw err;
          res.redirect('/');
        });
      });
    }
  );
});

module.exports = router;
