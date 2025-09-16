const express = require('express');
const cors = require('cors');

require('dotenv').config();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/user', require('./routes/authRoutes'));
app.use('/api/admit-card', require('./routes/admitCardRoutes'));
app.use('/api/upload', require('./routes/uploadStudentRoutes'));
app.use('/api/exam-schedules', require('./routes/examScheduleRoutes'));
app.use('/api/students', require('./routes/studentsInfoRoutes'));
app.use('/api/classes', require('./routes/classesRoutes'));
app.use('/api/subjects', require('./routes/subjectsRoutes'));
app.use('/api/exams', require('./routes/examsRoutes'));
app.use('/api/students/for-class', require('./routes/studentsRoutes'));
app.use('/api/marks', require('./routes/marksRoutes'));
app.use('/api/marksheets', require('./routes/marksheetsRoutes'));
app.use('/api/students/full-register', require('./routes/addStudentsRoutes'));
app.use('/api/students/delete', require('./routes/deleteStudentsRoutes'));
app.use('/api/matrix', require('./routes/exammarksMatrix'));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
