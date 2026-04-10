const router = require("express").Router();
const auth   = require("../middleware/auth.middleware");
const {
  getLessons,
  getLessonById,
  getLessonReadableText,
  getLessonSubtitles,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lesson.controller");

router.get("/",       getLessons);          // public — student pages call this
router.get("/:id/readable-text", getLessonReadableText);
router.get("/:id/subtitles", getLessonSubtitles);
router.get("/:id",    getLessonById);       // public
router.post("/",   auth, createLesson);     // teacher only
router.put("/:id", auth, updateLesson);     // teacher only — NEW
router.delete("/:id", auth, deleteLesson);  // teacher only

module.exports = router;
