const express = require('express');
const mysql = require('mysql2');
const path = require('path');


const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('view engine', 'ejs'); 

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shumail47891$$',
  database: 'LibraryManagement',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});


app.get('/', (req, res) => {
  const query = 'SELECT * FROM books';
  db.query(query, (err, books) => {
    if (err) throw err;
    res.render('index', { books });
  });
});

app.get('/loan/:book_id', (req, res) => {
  const bookId = req.params.book_id;
  res.render('loan', { bookId });
});

app.post('/loan/:book_id', (req, res) => {
  const bookId = req.params.book_id;
  const { first_name, last_name, email, phone, address, loan_date, return_date } = req.body;

  const studentQuery = `INSERT INTO students (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)`;
  db.query(studentQuery, [first_name, last_name, email, phone, address], (err, studentResult) => {
    if (err) throw err;

    const studentId = studentResult.insertId;

    const loanQuery = `INSERT INTO loans (student_id, loan_date, return_date) VALUES (?, ?, ?)`;
    db.query(loanQuery, [studentId, loan_date, return_date], (err, loanResult) => {
      if (err) throw err;

      const loanId = loanResult.insertId;

      const loanBookQuery = `INSERT INTO loan_books (loan_id, book_id) VALUES (?, ?)`;
      db.query(loanBookQuery, [loanId, bookId], (err) => {
        if (err) throw err;

        const updateBookQuery = `UPDATE books SET available = false WHERE book_id = ?`;
        db.query(updateBookQuery, [bookId], (err) => {
          if (err) throw err;
          res.redirect('/');
        });
      });
    });
  });
});

app.get('/return/:book_id', (req, res) => {
  const bookId = req.params.book_id;
  res.render('return', { bookId });
});

app.post('/return/:book_id', (req, res) => {
  const bookId = req.params.book_id;
  const { email } = req.body;

  const query = `
    DELETE lb FROM loan_books lb
    INNER JOIN loans l ON lb.loan_id = l.loan_id
    INNER JOIN students s ON l.student_id = s.student_id
    WHERE lb.book_id = ? AND s.email = ?
  `;

  db.query(query, [bookId, email], (err, result) => {
    if (err) throw err;

    if (result.affectedRows > 0) {
      const updateBookQuery = `UPDATE books SET available = true WHERE book_id = ?`;
      db.query(updateBookQuery, [bookId], (err) => {
        if (err) throw err;
        res.redirect('/');
      });
    } else {
      res.send('No matching student or loan found!');
    }
  });
});
app.get('/add-book', (req, res) => {
    res.render('add-book');
  });
  
  app.post('/add-book', (req, res) => {
    const { title, author, published_year, category_id, publisher_id } = req.body;
    
    const query = `INSERT INTO books (title, author, published_year, category_id, publisher_id, available) VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(query, [title, author, published_year, category_id, publisher_id, true], (err) => {
      if (err) throw err;
      res.redirect('/'); 
    });
  });
  
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
