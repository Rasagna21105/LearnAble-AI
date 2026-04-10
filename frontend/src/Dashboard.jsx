import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./shared.css";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">📚 AI Inclusive Learning</span>
        <div className="navbar-right">
          {user?.email && (
            <span className="student-email-badge">{user.email}</span>
          )}
          <button className="btn-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h1 className="dashboard-heading">Welcome back 👋</h1>
          <p className="dashboard-sub">
            Choose your learning mode to access chapters, quiz, and chatbot.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card card" onClick={() => navigate("/blind")}>
            <div className="dash-card-icon">👁️</div>
            <h3 className="dash-card-title">Blind Mode</h3>
            <p className="dash-card-desc">
              Audio-based learning with text-to-speech. Chapters read aloud,
              quiz by listening, and a hands-free chatbot — all accessible.
            </p>
            <div className="dash-card-features">
              <span className="feature-chip">📖 Chapters</span>
              <span className="feature-chip">📝 Quiz</span>
              <span className="feature-chip">💬 Chatbot</span>
            </div>
            <span className="dash-card-link">Enter Blind Mode →</span>
          </div>

          <div className="dashboard-card card" onClick={() => navigate("/deaf")}>
            <div className="dash-card-icon">🤟</div>
            <h3 className="dash-card-title">Deaf Mode</h3>
            <p className="dash-card-desc">
              Visual learning with captions and sign language videos. Watch
              chapters, take a visual quiz, and use the full-text chatbot.
            </p>
            <div className="dash-card-features">
              <span className="feature-chip">🎬 Chapters</span>
              <span className="feature-chip">📝 Quiz</span>
              <span className="feature-chip">💬 Chatbot</span>
            </div>
            <span className="dash-card-link">Enter Deaf Mode →</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;