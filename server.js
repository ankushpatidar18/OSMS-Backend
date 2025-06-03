const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true              
}));

app.use(express.json());
app.use(cookieParser());

const admitCardRoutes = require('./routes/admitCardRoutes');
app.use('/api', admitCardRoutes);

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const studentRoutes = require("./routes/studentRoutes");
app.use("/api", studentRoutes);

const examScheduleRoutes = require('./routes/examScheduleRoutes');
app.use('/api/exam-schedules', examScheduleRoutes);






app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
