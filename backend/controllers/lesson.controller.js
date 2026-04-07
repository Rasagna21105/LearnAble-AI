const Lesson = require('../models/Lesson.model');

exports.getLessons = async (req, res) => {
  try {
    const filter = {};
    if (req.query.mode) filter.mode = { $in: [req.query.mode, 'both'] };
    if (req.query.subject) filter.subject = req.query.subject;
    const lessons = await Lesson.find(filter).sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, uploadedBy: req.user.id });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};