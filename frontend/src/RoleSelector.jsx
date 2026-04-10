import React from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./RoleSelector.css";

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="page-center">
      <div className="role-wrapper">
        <div className="role-header">
          <div className="role-logo">📚</div>
          <h1 className="role-title">AI Inclusive Learning</h1>
          <p className="role-sub">Who are you? Choose your role to continue.</p>
        </div>

        <div className="role-cards">
          <div className="role-card card" onClick={() => navigate("/student/login")}>
            <div className="role-card-icon">🎓</div>
            <h2 className="role-card-title">I am a Student</h2>
            <p className="role-card-desc">
              Access lessons, blind and deaf learning modes, chatbot, and quizzes.
            </p>
            <span className="role-card-btn">Enter as Student →</span>
          </div>

          <div className="role-card card" onClick={() => navigate("/teacher/login")}>
            <div className="role-card-icon">🧑‍🏫</div>
            <h2 className="role-card-title">I am a Teacher</h2>
            <p className="role-card-desc">
              Upload lessons, manage content for blind and deaf modes, track student access.
            </p>
            <span className="role-card-btn">Enter as Teacher →</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;