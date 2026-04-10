const fs = require("fs/promises");
const path = require("path");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MAX_INLINE_BYTES = 20 * 1024 * 1024;

const hasGeminiConfig = () => Boolean(process.env.GEMINI_API_KEY);

const ensureGeminiConfig = () => {
  if (!hasGeminiConfig()) {
    const error = new Error("Missing GEMINI_API_KEY in backend/.env");
    error.statusCode = 503;
    throw error;
  }
};

const parseGeminiError = (payload, fallbackMessage) => {
  const message = payload?.error?.message || fallbackMessage;
  if (/api key/i.test(message)) return "Gemini setup error. Check GEMINI_API_KEY in backend/.env.";
  if (/quota|billing|credit|exceed/i.test(message)) {
    return "Gemini quota exceeded. Check your Google AI billing or usage limits.";
  }
  return message;
};

const geminiRequest = async (pathname, options = {}) => {
  ensureGeminiConfig();

  const separator = pathname.includes("?") ? "&" : "?";
  const url = `${GEMINI_API_BASE}${pathname}${separator}key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(parseGeminiError(payload, "Gemini request failed"));
    error.statusCode = response.status;
    throw error;
  }

  return payload;
};

const generateGeminiContent = async ({ contents, generationConfig, systemInstruction }) =>
  geminiRequest(`/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig,
      systemInstruction,
    }),
  });

const readGeminiText = (payload) =>
  payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";

const uploadGeminiFile = async (filePath, mimeType) => {
  ensureGeminiConfig();

  const buffer = await fs.readFile(filePath);
  const stats = await fs.stat(filePath);
  const displayName = path.basename(filePath);

  const startResponse = await fetch(`${GEMINI_API_BASE}/upload/v1beta/files?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(stats.size),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayName } }),
  });

  if (!startResponse.ok) {
    const payload = await startResponse.json().catch(() => null);
    const error = new Error(parseGeminiError(payload, "Could not start Gemini file upload"));
    error.statusCode = startResponse.status;
    throw error;
  }

  const uploadUrl = startResponse.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    const error = new Error("Gemini file upload URL missing");
    error.statusCode = 500;
    throw error;
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(stats.size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: buffer,
  });

  const uploadPayload = await uploadResponse.json();
  if (!uploadResponse.ok) {
    const error = new Error(parseGeminiError(uploadPayload, "Gemini file upload failed"));
    error.statusCode = uploadResponse.status;
    throw error;
  }

  return uploadPayload.file;
};

module.exports = {
  GEMINI_MAX_INLINE_BYTES,
  generateGeminiContent,
  hasGeminiConfig,
  readGeminiText,
  uploadGeminiFile,
};
