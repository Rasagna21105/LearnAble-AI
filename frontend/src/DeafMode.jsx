import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { askChatbot, getLessonSubtitles, getLessons } from "./api";
import "./shared.css";
import "./DeafMode.css";

/* ─── Quiz data ─── */
const quizData = [
  { id: 1, subject: "Science",     question: "How many planets are in our solar system?",  options: ["7","8","9","10"],                                               answer: "8" },
  { id: 2, subject: "Science",     question: "What do plants need for photosynthesis?",      options: ["Water, sunlight, CO₂","Water, oxygen, soil","Sunlight, nitrogen","CO₂ only"], answer: "Water, sunlight, CO₂" },
  { id: 3, subject: "Mathematics", question: "What is 1/2 + 1/4?",                           options: ["2/6","3/4","1/3","2/4"],                                        answer: "3/4" },
  { id: 4, subject: "Mathematics", question: "What is 7 × 8?",                               options: ["54","56","48","64"],                                            answer: "56" },
  { id: 5, subject: "English",     question: "Which of these is a noun?",                    options: ["Run","Happy","School","Quickly"],                               answer: "School" },
  { id: 6, subject: "English",     question: "What is the plural of 'child'?",               options: ["Childs","Childes","Children","Childrens"],                      answer: "Children" },
];

const subjectIcon = (s) =>
  s === "Science" ? "🔬" : s === "Mathematics" ? "🔢" : s === "English" ? "📖" : "📚";

const findActiveSubtitleIndex = (segments = [], currentTime = 0) =>
  segments.findIndex((segment) => currentTime >= segment.start && currentTime <= segment.end);

const formatVttTime = (value = 0) => {
  const totalMs = Math.max(0, Math.floor(value * 1000));
  const hours = String(Math.floor(totalMs / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((totalMs % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, "0");
  const milliseconds = String(totalMs % 1000).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const buildVttText = (segments = []) =>
  [
    "WEBVTT",
    "",
    ...segments.flatMap((segment, index) => [
      String(index + 1),
      `${formatVttTime(segment.start)} --> ${formatVttTime(segment.end)}`,
      segment.text || "",
      "",
    ]),
  ].join("\n");

/* ────────────────────────────────────────────────────────── */
/*  CHAPTERS TAB                                              */
/* ────────────────────────────────────────────────────────── */
const ChaptersTab = () => {
  const [lessons,       setLessons]       = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [showCaptions,  setShowCaptions]  = useState(true);
  const [activeSubject, setActiveSubject] = useState("All");
  const [playingId,     setPlayingId]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [subtitleError, setSubtitleError] = useState("");
  const [subtitleLoadingId, setSubtitleLoadingId] = useState("");
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState({});
  const videoRefs = useRef({});
  const trackUrlRefs = useRef({});

  useEffect(() => {
    getLessons("deaf")
      .then((data) => { setLessons(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    Object.values(trackUrlRefs.current).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, []);

  const availableSubjects = ["All", ...new Set(lessons.map((l) => l.subject))];
  const filtered = activeSubject === "All" ? lessons : lessons.filter((l) => l.subject === activeSubject);

  const mergeLessonData = (lessonId, updates) => {
    setLessons((prev) => prev.map((item) => (item._id === lessonId ? { ...item, ...updates } : item)));
    setSelected((prev) => (prev?._id === lessonId ? { ...prev, ...updates } : prev));
  };

  const loadSubtitles = async (lesson) => {
    if (!lesson.videoUrl || (lesson.subtitleSegments && lesson.subtitleSegments.length > 0)) {
      return lesson.subtitleSegments || [];
    }

    setSubtitleError("");
    setSubtitleLoadingId(lesson._id);
    try {
      const response = await getLessonSubtitles(lesson._id);
      if (response.message && !response.subtitleSegments) {
        setSubtitleError(response.message);
        return [];
      }

      const subtitleSegments = Array.isArray(response.subtitleSegments) ? response.subtitleSegments : [];
      mergeLessonData(lesson._id, {
        subtitleSegments,
        videoTranscript: response.videoTranscript || "",
      });
      return subtitleSegments;
    } catch {
      setSubtitleError("Could not load subtitles for this video.");
      return [];
    } finally {
      setSubtitleLoadingId("");
    }
  };

  const handlePlay = async (lesson) => {
    setPlayingId(lesson._id);
    setSelected(lesson);
    await loadSubtitles(lesson);
    requestAnimationFrame(() => {
      const video = videoRefs.current[lesson._id];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  };

  const getCurrentSubtitleText = (lesson) => {
    if (subtitleLoadingId === lesson._id) return "Loading subtitles...";
    if (subtitleError && selected?._id === lesson._id) return subtitleError;
    return (
      lesson.subtitleSegments?.[activeSubtitleIndex[lesson._id]]?.text ||
      lesson.description ||
      lesson.title
    );
  };

  const getSubtitleTrackUrl = (lesson) => {
    const segments = Array.isArray(lesson.subtitleSegments) ? lesson.subtitleSegments : [];
    if (!segments.length) return "";

    if (trackUrlRefs.current[lesson._id]) {
      return trackUrlRefs.current[lesson._id];
    }

    const blob = new Blob([buildVttText(segments)], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    trackUrlRefs.current[lesson._id] = url;
    return url;
  };

  return (
    <div className="tab-body">
      <div className="sidebar">
        <p className="sidebar-label">Subject</p>
        {availableSubjects.map((subj) => {
          const count = subj === "All" ? lessons.length : lessons.filter(l => l.subject === subj).length;
          return (
            <button key={subj} className={`sidebar-btn ${activeSubject === subj ? "active" : ""}`}
              onClick={() => setActiveSubject(subj)}>
              {subjectIcon(subj)} {subj}
              <span className="subj-count">{count}</span>
            </button>
          );
        })}
        <div className="cc-toggle-wrap">
          <p className="sidebar-label" style={{ marginTop: "24px" }}>Captions</p>
          <button
            className={`cc-sidebar-toggle ${showCaptions ? "cc-on" : "cc-off"}`}
            onClick={() => setShowCaptions(!showCaptions)}>
            CC {showCaptions ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="mode-content">
        <div className="deaf-header">
          <div>
            <h2 className="mode-heading">🎬 Video Chapters</h2>
            <p className="mode-sub">Click a card to preview. Select Watch to play the video.</p>
          </div>
          <span className="results-badge">{filtered.length} lessons</span>
        </div>

        {loading ? (
          <p className="mode-loading">Loading lessons...</p>
        ) : filtered.length === 0 ? (
          <div className="mode-empty card">
            <p style={{ fontSize: "28px" }}>📭</p>
            <p style={{ fontWeight: "bold", color: "#4a3728", marginTop: "10px" }}>No lessons yet.</p>
            <p style={{ fontSize: "13px", color: "#8b6343", marginTop: "6px" }}>Your teacher hasn't uploaded Deaf Mode lessons yet.</p>
          </div>
        ) : (
          <div className="deaf-grid">
            {filtered.map((lesson) => (
              <div key={lesson._id}
                className={`deaf-card card ${selected?._id === lesson._id ? "chapter-card-selected" : ""}`}
                onClick={() => setSelected(lesson)}>
                <div className="video-thumb">
                  {selected?._id === lesson._id && lesson.videoUrl ? (
                    <>
                      <video
                        ref={(el) => { videoRefs.current[lesson._id] = el; }}
                        controls
                        className="video-player video-player-hero"
                        src={`http://localhost:5000${lesson.videoUrl}`}
                        onClick={(e) => e.stopPropagation()}
                        onPlay={() => setPlayingId(lesson._id)}
                        onPause={() => setPlayingId((current) => (current === lesson._id ? null : current))}
                        onEnded={() => setPlayingId((current) => (current === lesson._id ? null : current))}
                        onLoadedMetadata={() => loadSubtitles(lesson)}
                        onTimeUpdate={(e) => {
                          const nextIndex = findActiveSubtitleIndex(
                            lesson.subtitleSegments,
                            e.currentTarget.currentTime
                          );
                          setActiveSubtitleIndex((prev) =>
                            prev[lesson._id] === nextIndex ? prev : { ...prev, [lesson._id]: nextIndex }
                          );
                        }}
                      >
                        {lesson.subtitleSegments?.length > 0 && (
                          <track
                            kind="subtitles"
                            srcLang="en"
                            label="English"
                            src={getSubtitleTrackUrl(lesson)}
                            default
                          />
                        )}
                      </video>
                      {showCaptions && (
                        <div className="video-subtitle-overlay" onClick={(e) => e.stopPropagation()}>
                          <p className="video-subtitle-text">{getCurrentSubtitleText(lesson)}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="thumb-icon">{subjectIcon(lesson.subject)}</span>
                      {playingId === lesson._id ? (
                        <div className="playing-overlay">
                          <span className="dot-anim"><span /><span /><span /></span> PLAYING
                        </div>
                      ) : (
                        <div className="play-circle">▶</div>
                      )}
                    </>
                  )}
                </div>

                <div className="deaf-card-body">
                  <p className="chapter-subject">{lesson.subject}</p>
                  <h3 className="chapter-title">{lesson.title}</h3>
                  <p className="chapter-desc">{lesson.description || "No description provided."}</p>
                  <div className="chapter-tags">
                    <span className="tag tag-brown">{lesson.subject}</span>
                    {lesson.videoUrl    && <span className="tag tag-gold">CC Captions</span>}
                    {lesson.textContent && <span className="tag tag-green">📝 Transcript</span>}
                  </div>

                  {lesson.videoUrl ? (
                    selected?._id === lesson._id ? null : (
                      <button className="btn-primary watch-btn"
                        onClick={(e) => { e.stopPropagation(); handlePlay(lesson); }}>
                        {playingId === lesson._id ? "⏸ Playing..." : "▶ Watch Chapter"}
                      </button>
                    )
                  ) : (
                    <div className="no-video-note">📄 Text-only lesson — no video available.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  QUIZ TAB                                                  */
/* ────────────────────────────────────────────────────────── */
const QuizTab = () => {
  const [started,  setStarted]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers,  setAnswers]  = useState([]);
  const [finished, setFinished] = useState(false);
  const [subject,  setSubject]  = useState("All");

  const questions = subject === "All" ? quizData : quizData.filter(q => q.subject === subject);

  const handleStart = () => { setCurrent(0); setSelected(null); setAnswers([]); setFinished(false); setStarted(true); };

  const handlePick = (opt) => { if (selected) return; setSelected(opt); };

  const handleNext = () => {
    if (!selected) return;
    const updated = [...answers, { ...questions[current], selected, isCorrect: selected === questions[current].answer }];
    setAnswers(updated);
    if (current + 1 >= questions.length) { setFinished(true); return; }
    setCurrent(c => c + 1); setSelected(null);
  };

  const score = answers.filter(a => a.isCorrect).length;

  if (!started) return (
    <div className="tab-body-center tab-body">
      <div className="quiz-start-card card">
        <div className="quiz-start-icon">📝</div>
        <h2 className="quiz-start-title">Deaf Mode Quiz</h2>
        <p className="quiz-start-sub">Visual quiz with instant feedback. Pick a subject or try all.</p>
        <div className="quiz-subject-buttons">
          {["All","Science","Mathematics","English"].map(s => (
            <button key={s} className={`quiz-subj-btn ${subject === s ? "quiz-subj-active" : ""}`}
              onClick={() => setSubject(s)}>
              {subjectIcon(s)} {s}
            </button>
          ))}
        </div>
        <p className="quiz-count">{subject === "All" ? quizData.length : quizData.filter(q => q.subject === subject).length} questions</p>
        <button className="btn-primary quiz-start-btn" onClick={handleStart}>Start Quiz →</button>
      </div>
    </div>
  );

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? { label: "Excellent!", emoji: "🏆", color: "#2d6a2d" }
                : pct >= 60 ? { label: "Good Job!", emoji: "👍", color: "#856404" }
                :             { label: "Keep Practicing!", emoji: "💪", color: "#8b3a3a" };
    return (
      <div className="tab-body-center tab-body">
        <div className="quiz-result-card card">
          <div className="result-emoji">{grade.emoji}</div>
          <h2 className="result-title" style={{ color: grade.color }}>{grade.label}</h2>
          <p className="result-score">{score} / {questions.length} correct — {pct}%</p>
          <div className="result-bar-wrap"><div className="result-bar" style={{ width: `${pct}%`, backgroundColor: grade.color }} /></div>
          <div className="result-breakdown">
            {answers.map((a, i) => (
              <div key={i} className={`result-item ${a.isCorrect ? "result-correct" : "result-wrong"}`}>
                <span>{a.isCorrect ? "✅" : "❌"}</span>
                <div><p className="result-q">{a.question}</p>{!a.isCorrect && <p className="result-answer">Correct: {a.answer}</p>}</div>
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button className="btn-primary" onClick={handleStart}>Try Again</button>
            <button className="btn-outline" onClick={() => { setStarted(false); setSubject("All"); }}>Change Subject</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="tab-body-center tab-body">
      <div className="quiz-card card">
        <div className="quiz-meta">
          <span className="tag tag-brown">{q.subject}</span>
          <span className="quiz-progress-text">Question {current + 1} of {questions.length}</span>
        </div>
        <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} /></div>
        <h3 className="quiz-question">{q.question}</h3>
        <div className="quiz-options">
          {q.options.map((opt) => (
            <button key={opt}
              className={`quiz-option ${selected === opt ? (opt === q.answer ? "option-correct" : "option-wrong") : ""} ${selected && opt === q.answer && selected !== opt ? "option-reveal" : ""}`}
              onClick={() => handlePick(opt)} disabled={!!selected}>
              {opt}
            </button>
          ))}
        </div>
        {selected && (
          <div className={`quiz-feedback ${selected === q.answer ? "feedback-correct" : "feedback-wrong"}`}>
            {selected === q.answer ? "✅ Correct!" : `❌ Wrong. Answer: ${q.answer}`}
          </div>
        )}
        <button className={`btn-primary quiz-next ${!selected ? "quiz-next-disabled" : ""}`}
          onClick={handleNext} disabled={!selected}>
          {current + 1 >= questions.length ? "Finish Quiz" : "Next →"}
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  CHATBOT TAB                                               */
/* ────────────────────────────────────────────────────────── */
const suggestions = ["What is the solar system?", "Explain fractions", "What is a noun?", "How does photosynthesis work?"];

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const ChatbotTab = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! 👋 I'm your Deaf Mode assistant. Ask me anything about your chapters!" }
  ]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => () => { recognitionRef.current?.stop?.(); }, []);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);
    try {
      const response = await askChatbot({ message: msg, mode: "deaf" });
      const reply = response.reply || response.message || "I could not answer that right now.";
      setTyping(false);
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { from: "bot", text: "I could not answer right now. Please try again." }]);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    setVoiceError("");
    recognitionRef.current?.stop?.();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      setListening(false);
      if (transcript) {
        setInput(transcript);
        send(transcript);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceError("Could not hear clearly. Please try again.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="chatbot-tab-body tab-body">
      <div className="chat-wrapper">
        <div className="chat-suggestions">
          <span className="suggestions-label">Try asking:</span>
          {suggestions.map(s => <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>)}
        </div>
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-row ${msg.from === "user" ? "chat-row-user" : "chat-row-bot"}`}>
              {msg.from === "bot" && <div className="bot-avatar">🤖</div>}
              <div className={`chat-bubble ${msg.from === "user" ? "bubble-user" : "bubble-bot"}`}>{msg.text}</div>
              {msg.from === "user" && <div className="user-avatar">🧑</div>}
            </div>
          ))}
          {typing && (
            <div className="chat-row chat-row-bot">
              <div className="bot-avatar">🤖</div>
              <div className="bubble-bot typing-bubble"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {voiceError && <p className="chat-voice-note">{voiceError}</p>}
        <div className="chat-input-area">
          <input type="text" className="chat-input" placeholder="Type your question..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()} />
          <button
            type="button"
            className={`btn-outline chat-mic ${listening ? "chat-mic-active" : ""}`}
            onClick={startVoiceInput}
          >
            {listening ? "Listening..." : "🎤 Speak"}
          </button>
          <button className="btn-primary chat-send" onClick={() => send()}>Send →</button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  ROOT                                                      */
/* ────────────────────────────────────────────────────────── */
const DeafMode = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("chapters");

  const tabs = [
    { key: "chapters", label: "🎬 Chapters" },
    { key: "quiz",     label: "📝 Quiz" },
    { key: "chatbot",  label: "💬 Chatbot" },
  ];

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">🤟 Deaf Mode — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
      </div>

      <div className="mode-tabs">
        {tabs.map(t => (
          <button key={t.key}
            className={`mode-tab-btn ${tab === t.key ? "mode-tab-active" : ""}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chapters" && <ChaptersTab />}
      {tab === "quiz"     && <QuizTab />}
      {tab === "chatbot"  && <ChatbotTab />}
    </div>
  );
};

export default DeafMode;
