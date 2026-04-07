import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./BlindMode.css";

const chapters = [
  { id: 1, title: "Chapter 1: Introduction to Science", subject: "Science", duration: "12 mins", description: "Basics of the scientific method and observation techniques used by scientists." },
  { id: 2, title: "Chapter 2: The Solar System", subject: "Science", duration: "18 mins", description: "Planets, stars, moons, and our place in the universe explained clearly." },
  { id: 3, title: "Chapter 3: Introduction to Mathematics", subject: "Mathematics", duration: "15 mins", description: "Numbers, basic operations and the foundations of arithmetic." },
  { id: 4, title: "Chapter 4: Fractions and Decimals", subject: "Mathematics", duration: "20 mins", description: "Understanding parts of a whole, decimal numbers and conversions." },
  { id: 5, title: "Chapter 5: English Grammar Basics", subject: "English", duration: "10 mins", description: "Nouns, verbs, adjectives and how to build correct sentences." },
  { id: 6, title: "Chapter 6: Creative Writing", subject: "English", duration: "14 mins", description: "Expressing ideas and emotions through stories, paragraphs and essays." },
];

const BlindMode = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [activeSubject, setActiveSubject] = useState("All");

  const subjects = ["All", "Science", "Mathematics", "English"];
  const filtered = activeSubject === "All" ? chapters : chapters.filter(c => c.subject === activeSubject);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleSelect = (ch) => {
    setSelected(ch);
    speak(`${ch.title}. Subject: ${ch.subject}. Duration: ${ch.duration}. ${ch.description}`);
  };

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">👁️ Blind Mode — AI Inclusive Learning</span>
        <div className="navbar-right">
          {speaking && (
            <button className="btn-outline stop-btn" onClick={stopSpeaking}>
              ⏹ Stop Audio
            </button>
          )}
          <button className="btn-white" onClick={() => { stopSpeaking(); navigate("/dashboard"); }}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="mode-hint-bar">
        <span>♿ Accessibility Mode Active</span>
        <span className="hint-chip">🎧 Click any chapter to hear it</span>
        <span className="hint-chip">⌨️ Tab + Enter to navigate</span>
      </div>

      <div className="mode-body">
        <div className="sidebar">
          <p className="sidebar-label">Filter by Subject</p>
          {subjects.map(subj => (
            <button
              key={subj}
              className={`sidebar-btn ${activeSubject === subj ? "active" : ""}`}
              onClick={() => { setActiveSubject(subj); speak(`Showing ${subj} chapters`); }}
            >
              {subj === "All" ? "📚" : subj === "Science" ? "🔬" : subj === "Mathematics" ? "🔢" : "📖"} {subj}
            </button>
          ))}
        </div>

        <div className="mode-content">
          <h2 className="mode-heading">📖 Select a Chapter</h2>
          <p className="mode-sub">Click or press Enter on any chapter to hear its description aloud.</p>

          <div className="chapters-grid">
            {filtered.map(ch => (
              <div
                key={ch.id}
                className={`chapter-card card ${selected?.id === ch.id ? "chapter-card-selected" : ""}`}
                onClick={() => handleSelect(ch)}
                onKeyDown={e => e.key === "Enter" && handleSelect(ch)}
                tabIndex={0}
                role="button"
                aria-label={`${ch.title}. ${ch.description}. Duration: ${ch.duration}`}
              >
                <p className="chapter-subject">{ch.subject}</p>
                <h3 className="chapter-title">{ch.title}</h3>
                <p className="chapter-desc">{ch.description}</p>
                <div className="chapter-tags">
                  <span className="tag tag-brown">🕒 {ch.duration}</span>
                  <span className="tag tag-brown">{ch.subject}</span>
                </div>
                {selected?.id === ch.id && (
                  <button
                    className="btn-primary listen-btn"
                    onClick={e => {
                      e.stopPropagation();
                      speak(`Starting ${ch.title}. ${ch.description}. This chapter is about ${ch.subject} and takes ${ch.duration}.`);
                    }}
                  >
                    🔊 Listen to Chapter
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {speaking && (
        <div className="speaking-toast">
          <span className="speaking-wave">▶▶</span> Audio Playing...
          <button className="toast-stop" onClick={stopSpeaking}>Stop</button>
        </div>
      )}
    </div>
  );
};

export default BlindMode;