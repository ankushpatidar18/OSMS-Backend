const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the connection



const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// // Example: Use the db connection for a query
// app.get('/students', (req, res) => {
//   db.query('SELECT * FROM students', (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
