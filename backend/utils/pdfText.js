const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const normalizeText = (value = "") =>
  value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

const isPlaceholderText = (lesson, text = "") => {
  const normalizedText = normalizeText(text).toLowerCase();
  if (!normalizedText) return true;

  const title = normalizeText(lesson.title || "").toLowerCase();
  const description = normalizeText(lesson.description || "").toLowerCase();
  const combinedFallback = normalizeText(
    [lesson.title, lesson.description].filter(Boolean).join("\n")
  ).toLowerCase();

  if (normalizedText.length < 80) return true;
  if (title && normalizedText === title) return true;
  if (description && normalizedText === description) return true;
  if (combinedFallback && normalizedText === combinedFallback) return true;

  return false;
};

const resolvePdfPath = (pdfUrl = "") => {
  const relativePath = pdfUrl.replace(/^\/+/, "");
  return path.join(__dirname, "..", relativePath);
};

const extractTextFromPdfPath = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const parsed = await parser.getText();
    return normalizeText(parsed.text);
  } finally {
    await parser.destroy();
  }
};

const getReadableLessonText = async (lesson) => {
  const existingText = typeof lesson.textContent === "string" ? lesson.textContent.trim() : "";
  if (existingText && (!lesson.pdfUrl || !isPlaceholderText(lesson, existingText))) {
    return existingText;
  }

  if (!lesson.pdfUrl) {
    return normalizeText([lesson.title, lesson.description].filter(Boolean).join("\n"));
  }

  const filePath = resolvePdfPath(lesson.pdfUrl);
  const extractedText = await extractTextFromPdfPath(filePath);

  if (extractedText && typeof lesson.save === "function") {
    lesson.textContent = extractedText;
    await lesson.save();
  }

  return extractedText || normalizeText([lesson.title, lesson.description].filter(Boolean).join("\n"));
};

module.exports = {
  extractTextFromPdfPath,
  getReadableLessonText,
  isPlaceholderText,
  normalizeText,
  resolvePdfPath,
};
