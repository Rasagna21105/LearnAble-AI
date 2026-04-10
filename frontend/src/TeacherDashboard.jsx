import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getTeacherLessons } from "./api";
import "./shared.css";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherLessons()
      .then((data) => {
        setLessons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const blindCount = lessons.filter(
    (l) => l.mode === "blind" || l.mode === "both"
  ).length;
  const deafCount = lessons.filter(
    (l) => l.mode === "deaf" || l.mode === "both"
  ).length;

  const subjectCount = (subject) =>
    lessons.filter((l) => l.subject === subject).length;

  const recentLessons = [...lessons]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">🧑‍🏫 Teacher Dashboard — AI Inclusive Learning</span>
        <div className="navbar-right">
          <span className="teacher-email-badge">{user?.email}</span>
          <button className="btn-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tdash-body">
        {/* Welcome */}
        <div className="tdash-welcome">
          <h1 className="tdash-heading">Welcome back 👋</h1>
          <p className="tdash-sub">Manage your lessons and track uploaded content below.</p>
        </div>

        {/* Stats row */}
        <div className="tdash-stats">
          <div className="stat-card card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{loading ? "—" : lessons.length}</div>
            <div className="stat-label">Total Lessons</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">👁️</div>
            <div className="stat-value">{loading ? "—" : blindCount}</div>
            <div className="stat-label">Blind Mode</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🤟</div>
            <div className="stat-value">{loading ? "—" : deafCount}</div>
            <div className="stat-label">Deaf Mode</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🔬</div>
            <div className="stat-value">{loading ? "—" : subjectCount("Science")}</div>
            <div className="stat-label">Science</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🔢</div>
            <div className="stat-value">{loading ? "—" : subjectCount("Mathematics")}</div>
            <div className="stat-label">Mathematics</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📖</div>
            <div className="stat-value">{loading ? "—" : subjectCount("English")}</div>
            <div className="stat-label">English</div>
          </div>
        </div>

        {/* Action cards */}
        <h2 className="tdash-section-title">Quick Actions</h2>
        <div className="tdash-actions">
          <div className="action-card card" onClick={() => navigate("/teacher/upload")}>
            <div className="action-icon">⬆️</div>
            <h3 className="action-title">Upload New Lesson</h3>
            <p className="action-desc">
              Add a new lesson with PDF, text content, or a video for blind and deaf students.
            </p>
            <span className="action-link">Upload now →</span>
          </div>
          <div className="action-card card" onClick={() => navigate("/teacher/manage")}>
            <div className="action-icon">📋</div>
            <h3 className="action-title">Manage Lessons</h3>
            <p className="action-desc">
              View, filter, and delete all your uploaded lessons across all subjects and modes.
            </p>
            <span className="action-link">Manage →</span>
          </div>
        </div>

        {/* Recent lessons */}
        <h2 className="tdash-section-title">Recently Uploaded</h2>
        {loading ? (
          <p className="tdash-loading">Loading lessons...</p>
        ) : recentLessons.length === 0 ? (
          <div className="tdash-empty card">
            <p>📭 No lessons uploaded yet.</p>
            <button className="btn-primary" style={{ marginTop: "14px" }} onClick={() => navigate("/teacher/upload")}>
              Upload your first lesson
            </button>
          </div>
        ) : (
          <div className="recent-grid">
            {recentLessons.map((lesson) => (
              <div key={lesson._id} className="recent-card card">
                <div className="recent-card-top">
                  <span className="tag tag-brown">{lesson.subject}</span>
                  <span className={`mode-tag mode-${lesson.mode}`}>
                    {lesson.mode === "blind"
                      ? "👁️ Blind"
                      : lesson.mode === "deaf"
                      ? "🤟 Deaf"
                      : "👁️🤟 Both"}
                  </span>
                </div>
                <h4 className="recent-title">{lesson.title}</h4>
                <p className="recent-desc">{lesson.description || "No description provided."}</p>
                <div className="recent-files">
                  {lesson.pdfUrl   && <span className="file-tag">📄 PDF</span>}
                  {lesson.videoUrl && <span className="file-tag">🎬 Video</span>}
                  {lesson.textContent && <span className="file-tag">📝 Text</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;