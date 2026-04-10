const fs = require("fs/promises");
const path = require("path");
const { normalizeText } = require("./pdfText");
const {
  GEMINI_MAX_INLINE_BYTES,
  generateGeminiContent,
  hasGeminiConfig,
  uploadGeminiFile,
} = require("./gemini");

const MIME_TYPES = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".mpeg": "video/mpeg",
  ".mpga": "audio/mpeg",
  ".wav": "audio/wav",
  ".webm": "video/webm",
};

const hasTranscriptionConfig = () => hasGeminiConfig();

const resolveMediaPath = (mediaUrl = "") => {
  const relativePath = mediaUrl.replace(/^\/+/, "");
  return path.join(__dirname, "..", relativePath);
};

const toSubtitleSegments = (segments = []) =>
  segments
    .map((segment) => ({
      start: Number(segment.start ?? 0),
      end: Number(segment.end ?? segment.start ?? 0),
      text: normalizeText(segment.text || ""),
    }))
    .filter((segment) => segment.text);

const subtitleSchema = {
  type: "object",
  properties: {
    videoTranscript: { type: "string" },
    subtitleSegments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "number" },
          end: { type: "number" },
          text: { type: "string" },
        },
        required: ["start", "end", "text"],
      },
    },
  },
  required: ["videoTranscript", "subtitleSegments"],
};

const transcribeVideoFromPath = async (filePath) => {
  if (!hasTranscriptionConfig()) {
    const error = new Error("Missing GEMINI_API_KEY for subtitle generation");
    error.statusCode = 503;
    throw error;
  }

  const stats = await fs.stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  let mediaPart;

  if (stats.size <= GEMINI_MAX_INLINE_BYTES) {
    const buffer = await fs.readFile(filePath);
    mediaPart = {
      inline_data: {
        mime_type: mimeType,
        data: buffer.toString("base64"),
      },
    };
  } else {
    const uploadedFile = await uploadGeminiFile(filePath, mimeType);
    mediaPart = {
      file_data: {
        mime_type: mimeType,
        file_uri: uploadedFile.uri,
      },
    };
  }

  const response = await generateGeminiContent({
    contents: [
      {
        role: "user",
        parts: [
          mediaPart,
          {
            text:
              "Transcribe the spoken audio in this educational video. Return only JSON with a full transcript and subtitle segments. " +
              "Each subtitle segment must have start and end in seconds plus text. Keep caption lines short and readable.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: subtitleSchema,
    },
  });

  const payload = JSON.parse(response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

  return {
    videoTranscript: normalizeText(payload.videoTranscript || ""),
    subtitleSegments: toSubtitleSegments(payload.subtitleSegments || []),
  };
};

const shouldGenerateSubtitles = (lesson) =>
  Boolean(
    lesson?.videoUrl &&
    (!Array.isArray(lesson.subtitleSegments) || lesson.subtitleSegments.length === 0)
  );

const ensureLessonSubtitles = async (lesson) => {
  if (!shouldGenerateSubtitles(lesson)) {
    return {
      videoTranscript: normalizeText(lesson.videoTranscript || ""),
      subtitleSegments: Array.isArray(lesson.subtitleSegments) ? lesson.subtitleSegments : [],
    };
  }

  const filePath = resolveMediaPath(lesson.videoUrl);
  const generated = await transcribeVideoFromPath(filePath);

  if (typeof lesson.save === "function") {
    lesson.videoTranscript = generated.videoTranscript;
    lesson.subtitleSegments = generated.subtitleSegments;
    await lesson.save();
  }

  return generated;
};

module.exports = {
  ensureLessonSubtitles,
  hasTranscriptionConfig,
  resolveMediaPath,
  shouldGenerateSubtitles,
  transcribeVideoFromPath,
};
