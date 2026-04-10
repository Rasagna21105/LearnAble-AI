const Lesson = require("../models/Lesson.model");
const { getReadableLessonText, isPlaceholderText, normalizeText } = require("../utils/pdfText");
const { ensureLessonSubtitles, hasTranscriptionConfig, shouldGenerateSubtitles } = require("../utils/transcription");

/* GET /api/lessons?mode=blind&subject=Science */
exports.getLessons = async (req, res) => {
  try {
    const filter = {};
    if (req.query.mode)    filter.mode    = { $in: [req.query.mode, "both"] };
    if (req.query.subject) filter.subject = req.query.subject;
    const lessons = await Lesson.find(filter).sort({ createdAt: -1 });

    await Promise.all(
      lessons.map(async (lesson) => {
        if (lesson.pdfUrl && isPlaceholderText(lesson, lesson.textContent)) {
          try {
            lesson.textContent = await getReadableLessonText(lesson);
          } catch (error) {
            lesson.textContent = normalizeText(
              [lesson.title, lesson.description].filter(Boolean).join("\n")
            );
          }
        }
      })
    );

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/lessons/:id */
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Not found" });

    if (lesson.pdfUrl && isPlaceholderText(lesson, lesson.textContent)) {
      try {
        lesson.textContent = await getReadableLessonText(lesson);
      } catch (error) {
        lesson.textContent = normalizeText(
          [lesson.title, lesson.description].filter(Boolean).join("\n")
        );
      }
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/lessons  (teacher only) */
exports.createLesson = async (req, res) => {
  try {
    const payload = { ...req.body, uploadedBy: req.user.id };

    if (payload.pdfUrl && isPlaceholderText(payload, payload.textContent)) {
      try {
        payload.textContent = await getReadableLessonText(payload);
      } catch (error) {
        payload.textContent = normalizeText(
          [payload.title, payload.description].filter(Boolean).join("\n")
        );
      }
    }

    const lesson = await Lesson.create(payload);

    if (lesson.videoUrl && hasTranscriptionConfig()) {
      try {
        await ensureLessonSubtitles(lesson);
      } catch (error) {
        console.error("Subtitle generation failed during lesson creation:", error.message);
      }
    }

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/lessons/:id  (teacher only) */
exports.updateLesson = async (req, res) => {
  try {
    /* Only allow updating these fields — never overwrite file URLs from here */
    const allowed = ["title", "subject", "description", "mode", "textContent"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (lesson.pdfUrl && isPlaceholderText(lesson, lesson.textContent)) {
      try {
        lesson.textContent = await getReadableLessonText(lesson);
      } catch (error) {
        lesson.textContent = normalizeText(
          [lesson.title, lesson.description].filter(Boolean).join("\n")
        );
      }
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/lessons/:id/readable-text */
exports.getLessonReadableText = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const textContent = await getReadableLessonText(lesson);
    res.json({
      _id: lesson._id,
      title: lesson.title,
      textContent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to read lesson content" });
  }
};

/* GET /api/lessons/:id/subtitles */
exports.getLessonSubtitles = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (!lesson.videoUrl) return res.status(400).json({ message: "This lesson has no video" });

    if (shouldGenerateSubtitles(lesson) && !hasTranscriptionConfig()) {
      return res.status(503).json({
        message: "Subtitle generation is not configured yet. Add GEMINI_API_KEY in backend/.env.",
      });
    }

    const { videoTranscript, subtitleSegments } = await ensureLessonSubtitles(lesson);
    res.json({
      _id: lesson._id,
      title: lesson.title,
      videoTranscript,
      subtitleSegments,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to load subtitles" });
  }
};

/* DELETE /api/lessons/:id  (teacher only) */
exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
