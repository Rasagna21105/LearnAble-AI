import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./DeafMode.css";

const chapters = [
  { id: 1, title: "Chapter 1: Introduction to Science", subject: "Science", duration: "12 mins", description: "Basics of the scientific method and observation techniques.", captioned: true, signLanguage: true, icon: "🔬" },
  { id: 2, title: "Chapter 2: The Solar System", subject: "Science", duration: "18 mins", description: "Planets, stars, moons, and our place in the universe.", captioned: true, signLanguage: true, icon: "🌍" },
  { id: 3, title: "Chapter 3: Introduction to Mathematics", subject: "Mathematics", duration: "15 mins", description: "Numbers, basic operations and foundations of arithmetic.", captioned: true, signLanguage: false, icon: "🔢" },
  { id: 4, title: "Chapter 4: Fractions and Decimals", subject: "Mathematics", duration: "20 mins", description: "Understanding parts of a whole and decimal conversions.", captioned: true, signLanguage: true, icon: "➗" },
  { id: 5, title: "Chapter 5: English Grammar Basics", subject: "English", duration: "10 mins", description: "Nouns, verbs, adjectives and correct sentence structure.", captioned: true, signLanguage: false, icon: "📝" },
  { id: 6, title: "Chapter 6: Creative Writing", subject: "English", duration: "14 mins", description: "Expressing ideas and emotions through stories and essays.", captioned: true, signLanguage: true, icon: "✍️" },
];

const DeafMode = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [activeSubject, setActiveSubject] = useState("All");
  const [playingId, setPlayingId] = useState(null);

  const subjects = ["All", "Science", "Mathematics", "English"];
  const filtered = activeSubject === "All" ? chapters : chapters.filter(c => c.subject === activeSubject);

  const handlePlay = (ch) => {
    setPlayingId(ch.id);
    setSelected(ch);
    setTimeout(() => setPlayingId(null), 3000);
  };

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">🤟 Deaf Mode — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button
            className={`cc-toggle ${showCaptions ? "cc-on" : "cc-off"}`}
            onClick={() => setShowCaptions(!showCaptions)}
          >
            CC {showCaptions ? "ON" : "OFF"}
          </button>
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="mode-hint-bar">
        <span>👁️ Visual Learning Mode Active</span>
        <span className="hint-chip">📺 Captions Available</span>
        <span className="hint-chip">🤟 Sign Language Videos</span>
        <span className="hint-chip">📄 Text Transcripts</span>
      </div>

      <div className="mode-body">
        <div className="sidebar">
          <p className="sidebar-label">Filter by Subject</p>
          {subjects.map(subj => {
            const count = subj === "All" ? chapters.length : chapters.filter(c => c.subject === subj).length;
            return (
              <button
                key={subj}
                className={`sidebar-btn ${activeSubject === subj ? "active" : ""}`}
                onClick={() => setActiveSubject(subj)}
              >
                {subj === "All" ? "📚" : subj === "Science" ? "🔬" : subj === "Mathematics" ? "🔢" : "📖"} {subj}
                <span className="subj-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mode-content">
          <div className="deaf-header">
            <div>
              <h2 className="mode-heading">🎬 Video Chapters</h2>
              <p className="mode-sub">All videos include closed captions. Click a card to preview.</p>
            </div>
            <span className="results-badge">{filtered.length} chapters</span>
          </div>

          <div className="chapters-grid">
            {filtered.map(ch => (
              <div
                key={ch.id}
                className={`deaf-card card ${selected?.id === ch.id ? "chapter-card-selected" : ""}`}
                onClick={() => setSelected(ch)}
              >
                <div className="video-thumb">
                  <span className="thumb-icon">{ch.icon}</span>
                  {playingId === ch.id ? (
                    <div className="playing-overlay">
                      <span className="dot-anim"><span /><span /><span /></span>
                      PLAYING
                    </div>
                  ) : (
                    <div className="play-circle">▶</div>
                  )}
                </div>

                {showCaptions && (
                  <div className="caption-bar">
                    <span className="cc-badge">CC</span>
                    {selected?.id === ch.id
                      ? `"${ch.description}"`
                      : "Captions available — click to preview"}
                  </div>
                )}

                <div className="deaf-card-body">
                  <p className="chapter-subject">{ch.subject}</p>
                  <h3 className="chapter-title">{ch.title}</h3>
                  <p className="chapter-desc">{ch.description}</p>
                  <div className="chapter-tags">
                    <span className="tag tag-brown">🕒 {ch.duration}</span>
                    {ch.captioned && <span className="tag tag-gold">CC Captions</span>}
                    {ch.signLanguage && <span className="tag tag-green">🤟 Sign Language</span>}
                  </div>
                  <button
                    className="btn-primary watch-btn"
                    onClick={e => { e.stopPropagation(); handlePlay(ch); }}
                  >
                    {playingId === ch.id ? "⏸ Playing..." : "▶ Watch Chapter"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeafMode;