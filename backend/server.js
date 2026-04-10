const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000,
    () => console.log('Server running')))
  .catch(err => console.error(err));
