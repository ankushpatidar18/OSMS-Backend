const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const cookieParser = require('cookie-parser');




const app = express();
app.use(cors());
app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

const authRoutes = require('./routes/auth');

// Use routes
app.use('/api', authRoutes); 
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
