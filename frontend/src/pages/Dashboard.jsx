import React from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Dashboard.css";

const menuItems = [
  {
    route: "/blind",
    icon: "👁️",
    title: "Blind Mode",
    desc: "Audio-based learning with text-to-speech support",
  },
  {
    route: "/deaf",
    icon: "🤟",
    title: "Deaf Mode",
    desc: "Visual learning with captions and sign language",
  },
  {
    route: "/chatbot",
    icon: "💬",
    title: "Chatbot",
    desc: "Ask doubts and get instant answers",
  },
  {
    route: "/quiz",
    icon: "📝",
    title: "Quiz",
    desc: "Test your knowledge with practice questions",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logged out successfully.");
    navigate("/");
  };

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">📚 AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h1 className="dashboard-heading">Welcome Back 👋</h1>
          <p className="dashboard-sub">Choose a learning mode to get started.</p>
        </div>

        <div className="dashboard-grid">
          {menuItems.map((item) => (
            <div
              key={item.route}
              className="dashboard-card card"
              onClick={() => navigate(item.route)}
            >
              <div className="dash-card-icon">{item.icon}</div>
              <h3 className="dash-card-title">{item.title}</h3>
              <p className="dash-card-desc">{item.desc}</p>
              <span className="dash-card-link">Open →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;