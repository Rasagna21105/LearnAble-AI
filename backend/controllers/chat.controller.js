const Lesson = require("../models/Lesson.model");
const { generateGeminiContent, hasGeminiConfig, readGeminiText } = require("../utils/gemini");

const buildLessonContext = async (lessonId) => {
  if (!lessonId) return "";
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) return "";

  return [
    `Lesson title: ${lesson.title || ""}`,
    `Subject: ${lesson.subject || ""}`,
    lesson.description ? `Description: ${lesson.description}` : "",
    lesson.textContent ? `Lesson text: ${lesson.textContent.slice(0, 4000)}` : "",
    lesson.videoTranscript ? `Video transcript: ${lesson.videoTranscript.slice(0, 4000)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, mode = "general", lessonId } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!hasGeminiConfig()) {
      return res.status(503).json({ message: "Missing GEMINI_API_KEY in backend/.env" });
    }

    const lessonContext = await buildLessonContext(lessonId);
    const response = await generateGeminiContent({
      systemInstruction: {
        parts: [
          {
            text:
              "You are a helpful school learning assistant for students. Answer clearly and correctly. " +
              "If the question is arithmetic, solve it directly. If the user asks whether something is correct or wrong, answer explicitly. " +
              "If the user greets you, greet them naturally. Use simple language suitable for students.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                `Mode: ${mode}`,
                lessonContext ? `Lesson context:\n${lessonContext}` : "",
                `Student question: ${message}`,
                "Respond in plain text only.",
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        },
      ],
    });

    const reply = readGeminiText(response);
    res.json({ reply: reply || "I could not generate an answer right now." });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Chat request failed" });
  }
};
