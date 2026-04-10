import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherLessons, deleteLesson, updateLesson } from "./api";
import "./shared.css";
import "./ManageLessons.css";

const SUBJECTS = ["Science", "Mathematics", "English", "History", "Geography"];
const MODES    = ["blind", "deaf", "both"];

const ManageLessons = () => {
  const navigate = useNavigate();
  const [lessons,       setLessons]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterMode,    setFilterMode]    = useState("All");
  const [search,        setSearch]        = useState("");
  const [confirmId,     setConfirmId]     = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [message,       setMessage]       = useState({ text: "", type: "success" });

  /* Edit modal state */
  const [editLesson,  setEditLesson]  = useState(null); // lesson being edited
  const [editForm,    setEditForm]    = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState("");

  const fetchLessons = () => {
    setLoading(true);
    getTeacherLessons()
      .then((data) => { setLessons(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLessons(); }, []);

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l._id !== id));
      showMsg("Lesson deleted successfully.");
    } catch {
      showMsg("Failed to delete. Try again.", "error");
    }
    setConfirmId(null);
    setDeleting(false);
  };

  /* ── Open edit modal ── */
  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setEditForm({
      title:       lesson.title,
      subject:     lesson.subject,
      description: lesson.description || "",
      mode:        lesson.mode,
      textContent: lesson.textContent || "",
    });
    setEditError("");
  };

  /* ── Save edit ── */
  const handleEditSave = async () => {
    if (!editForm.title.trim()) { setEditError("Title is required."); return; }
    setEditLoading(true);
    try {
      const updated = await updateLesson(editLesson._id, editForm);
      if (updated._id) {
        setLessons((prev) => prev.map((l) => l._id === updated._id ? updated : l));
        showMsg("Lesson updated successfully.");
        setEditLesson(null);
      } else {
        setEditError(updated.message || "Update failed.");
      }
    } catch {
      setEditError("Server error. Try again.");
    }
    setEditLoading(false);
  };

  /* ── Filters ── */
  const subjects  = ["All", ...new Set(lessons.map((l) => l.subject))];
  const modeOpts  = ["All", "blind", "deaf", "both"];

  const filtered = lessons.filter((l) => {
    const matchSubj   = filterSubject === "All" || l.subject === filterSubject;
    const matchMode   = filterMode    === "All" || l.mode    === filterMode;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
                        (l.description || "").toLowerCase().includes(search.toLowerCase());
    return matchSubj && matchMode && matchSearch;
  });

  const modeLabel = (m) =>
    m === "blind" ? "👁️ Blind" : m === "deaf" ? "🤟 Deaf" : "👁️🤟 Both";

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">📋 Manage Lessons — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-primary" style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => navigate("/teacher/upload")}>
            + Upload New
          </button>
          <button className="btn-white" onClick={() => navigate("/teacher/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="manage-body">
        <div className="manage-top">
          <div>
            <h1 className="manage-heading">All Lessons</h1>
            <p className="manage-sub">{filtered.length} of {lessons.length} lessons shown</p>
          </div>
        </div>

        {message.text && (
          <div className={message.type === "error" ? "form-error manage-msg" : "form-success manage-msg"}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="manage-filters">
          <input type="text" className="manage-search"
            placeholder="🔍 Search by title or description..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="filter-group">
            <label className="filter-label">Subject</label>
            <select className="form-select filter-select" value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Mode</label>
            <select className="form-select filter-select" value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}>
              {modeOpts.map((m) => (
                <option key={m} value={m}>{m === "All" ? "All Modes" : modeLabel(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="manage-loading">Loading your lessons...</p>
        ) : filtered.length === 0 ? (
          <div className="manage-empty card">
            <p>📭 No lessons match your filters.</p>
            {lessons.length === 0 && (
              <button className="btn-primary" style={{ marginTop: "14px" }}
                onClick={() => navigate("/teacher/upload")}>
                Upload your first lesson
              </button>
            )}
          </div>
        ) : (
          <div className="lessons-table-wrap">
            <table className="lessons-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Mode</th>
                  <th>Files</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lesson) => (
                  <tr key={lesson._id}>
                    <td className="lesson-title-cell">
                      <p className="lesson-table-title">{lesson.title}</p>
                      {lesson.description && (
                        <p className="lesson-table-desc">
                          {lesson.description.slice(0, 68)}{lesson.description.length > 68 ? "…" : ""}
                        </p>
                      )}
                    </td>
                    <td><span className="tag tag-brown">{lesson.subject}</span></td>
                    <td><span className={`mode-tag mode-${lesson.mode}`}>{modeLabel(lesson.mode)}</span></td>
                    <td className="files-cell">
                      {lesson.pdfUrl      && <span className="file-tag">📄 PDF</span>}
                      {lesson.videoUrl    && <span className="file-tag">🎬 Video</span>}
                      {lesson.textContent && <span className="file-tag">📝 Text</span>}
                      {!lesson.pdfUrl && !lesson.videoUrl && !lesson.textContent && (
                        <span style={{ color: "#aaa", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    <td className="date-cell">
                      {lesson.createdAt
                        ? new Date(lesson.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      <div className="action-btns">
                        {/* Edit button */}
                        <button className="btn-edit" onClick={() => openEdit(lesson)}>
                          ✏️ Edit
                        </button>

                        {/* Delete */}
                        {confirmId === lesson._id ? (
                          <div className="confirm-row">
                            <span className="confirm-text">Delete?</span>
                            <button className="btn-delete-confirm"
                              onClick={() => handleDelete(lesson._id)} disabled={deleting}>
                              {deleting ? "..." : "Yes"}
                            </button>
                            <button className="btn-cancel-confirm" onClick={() => setConfirmId(null)}>No</button>
                          </div>
                        ) : (
                          <button className="btn-delete" onClick={() => setConfirmId(lesson._id)}>
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editLesson && (
        <div className="modal-backdrop" onClick={() => setEditLesson(null)}>
          <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Lesson</h2>
              <button className="modal-close" onClick={() => setEditLesson(null)}>✕</button>
            </div>

            {editError && <div className="form-error">{editError}</div>}

            <div className="form-group">
              <label>Title *</label>
              <input type="text" value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Lesson title" />
            </div>

            <div className="modal-row">
              <div className="form-group">
                <label>Subject *</label>
                <select className="form-select" value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Mode *</label>
                <select className="form-select" value={editForm.mode}
                  onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}>
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {m === "blind" ? "Blind Mode" : m === "deaf" ? "Deaf Mode" : "Both Modes"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-textarea" rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Brief description..." />
            </div>

            <div className="form-group">
              <label>Text Content (for Blind Mode TTS)</label>
              <textarea className="form-textarea" rows={5}
                value={editForm.textContent}
                onChange={(e) => setEditForm({ ...editForm, textContent: e.target.value })}
                placeholder="Lesson text content read aloud to students..." />
              <p className="form-hint">Note: To replace PDF or video files, delete this lesson and re-upload.</p>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setEditLesson(null)}>Cancel</button>
              <button className="btn-primary modal-save-btn"
                onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessons;