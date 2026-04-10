const BASE = "http://localhost:5000/api";

const token = () => localStorage.getItem("token");

/* ---- AUTH ---- */
export const registerUser = (data) =>
  fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const loginUser = (data) =>
  fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

/* ---- LESSONS (student reads) ---- */
export const getLessons = (mode = "", subject = "") => {
  const params = new URLSearchParams();
  if (mode)    params.append("mode", mode);
  if (subject) params.append("subject", subject);
  return fetch(`${BASE}/lessons?${params.toString()}`).then((r) => r.json());
};

export const getLessonById = (id) =>
  fetch(`${BASE}/lessons/${id}`).then((r) => r.json());

export const getLessonReadableText = (id) =>
  fetch(`${BASE}/lessons/${id}/readable-text`).then((r) => r.json());

export const getLessonSubtitles = (id) =>
  fetch(`${BASE}/lessons/${id}/subtitles`).then((r) => r.json());

export const askChatbot = (data) =>
  fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

/* ---- UPLOAD (teacher) ---- */
export const uploadFiles = (formData) =>
  fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  }).then((r) => r.json());

/* ---- LESSONS (teacher writes) ---- */
export const createLesson = (data) =>
  fetch(`${BASE}/lessons`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateLesson = (id, data) =>
  fetch(`${BASE}/lessons/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteLesson = (id) =>
  fetch(`${BASE}/lessons/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  }).then((r) => r.json());

export const getTeacherLessons = () =>
  fetch(`${BASE}/lessons`, {
    headers: { Authorization: `Bearer ${token()}` },
  }).then((r) => r.json());
