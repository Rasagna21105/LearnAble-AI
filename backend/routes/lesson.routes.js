const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  createLesson, getLessons,
  getLessonById, deleteLesson
} = require('../controllers/lesson.controller');

router.get('/',          getLessons);          // public — student pages call this
router.get('/:id',       getLessonById);
router.post('/',    auth, createLesson);        // teacher only
router.delete('/:id', auth, deleteLesson);
module.exports = router;