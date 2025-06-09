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

const uploadStudentRoutes = require("./routes/uploadStudentRoutes");
app.use("/api", uploadStudentRoutes);

const examScheduleRoutes = require('./routes/examScheduleRoutes');
app.use('/api/exam-schedules', examScheduleRoutes);

const studentsInfoRoutes = require("./routes/studentsInfoRoutes");
app.use("/api/students", studentsInfoRoutes);

const marksheetRoutes = require('./routes/marksheetRoutes');
app.use('/api/marksheet', marksheetRoutes);

app.use('/api/classes', require('./routes/classesRoutes'));
app.use('/api/subjects', require('./routes/subjectsRoutes'));
app.use('/api/exams', require('./routes/examsRoutes'));
app.use('/api/students', require('./routes/studentsRoutes'));
app.use('/api/marks', require('./routes/marksRoutes'));



app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
