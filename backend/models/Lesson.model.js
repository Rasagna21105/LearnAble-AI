const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, required: true },     // Science / Maths / English
  description: { type: String },
  mode:        { type: String, enum: ['blind','deaf','both'], required: true },
  pdfUrl:      { type: String },   // path or cloud URL — used by BlindMode
  textContent: { type: String },   // extracted or typed text — used by BlindMode TTS
  videoUrl:    { type: String },   // path or cloud URL — used by DeafMode
  videoTranscript: { type: String },
  subtitleSegments: [{
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
  }],
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Lesson', schema);
