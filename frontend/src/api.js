const BASE = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export const registerUser  = (data) =>
  fetch(`${BASE}/auth/register`, { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r=>r.json());

export const loginUser = (data) =>
  fetch(`${BASE}/auth/login`, { method:'POST',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r=>r.json());

export const getLessons = (mode) =>
  fetch(`${BASE}/lessons?mode=${mode}`).then(r=>r.json());

export const uploadFiles = (formData) =>
  fetch(`${BASE}/upload`, { method:'POST',
    headers:{ Authorization:`Bearer ${token()}` }, body: formData }).then(r=>r.json());

export const createLesson = (data) =>
  fetch(`${BASE}/lessons`, { method:'POST',
    headers:{ Authorization:`Bearer ${token()}`, 'Content-Type':'application/json' },
    body: JSON.stringify(data) }).then(r=>r.json());

export const deleteLesson = (id) =>
  fetch(`${BASE}/lessons/${id}`, { method:'DELETE',
    headers:{ Authorization:`Bearer ${token()}` } }).then(r=>r.json());

export const getTeacherLessons = () =>
  fetch(`${BASE}/lessons`, { headers:{ Authorization:`Bearer ${token()}` } }).then(r=>r.json());