import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { askChatbot, getLessonReadableText, getLessons } from "./api";
import "./shared.css";
import "./BlindMode.css";

/* ─── Quiz data ─── */
const quizData = [
  { id: 1, subject: "Science",     question: "How many planets are in our solar system?",  options: ["7","8","9","10"],                                               answer: "8" },
  { id: 2, subject: "Science",     question: "What do plants need for photosynthesis?",      options: ["Water, sunlight, CO₂","Water, oxygen, soil","Sunlight, nitrogen","CO₂ only"], answer: "Water, sunlight, CO₂" },
  { id: 3, subject: "Mathematics", question: "What is 1/2 + 1/4?",                           options: ["2/6","3/4","1/3","2/4"],                                        answer: "3/4" },
  { id: 4, subject: "Mathematics", question: "What is 7 × 8?",                               options: ["54","56","48","64"],                                            answer: "56" },
  { id: 5, subject: "English",     question: "Which of these is a noun?",                    options: ["Run","Happy","School","Quickly"],                               answer: "School" },
  { id: 6, subject: "English",     question: "What is the plural of 'child'?",               options: ["Childs","Childes","Children","Childrens"],                      answer: "Children" },
];

const looksLikePlaceholderText = (lesson, text = "") => {
  const normalized = text.trim().toLowerCase();
  const title = (lesson.title || "").trim().toLowerCase();
  const description = (lesson.description || "").trim().toLowerCase();
  const combined = [lesson.title, lesson.description].filter(Boolean).join(" ").trim().toLowerCase();

  if (!normalized) return true;
  if (normalized.length < 80) return true;
  if (title && normalized === title) return true;
  if (description && normalized === description) return true;
  if (combined && normalized === combined) return true;

  return false;
};

/* ────────────────────────────────────────────────────────── */
/*  CHAPTERS TAB                                              */
/* ────────────────────────────────────────────────────────── */
const ChaptersTab = () => {
  const [lessons,       setLessons]       = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [speaking,      setSpeaking]      = useState(false);
  const [activeSubject, setActiveSubject] = useState("All");
  const [loading,       setLoading]       = useState(true);
  const [listenLoading, setListenLoading] = useState("");
  const [listenError,   setListenError]   = useState("");
  const [currentLine,   setCurrentLine]   = useState(-1);
  const [lines,         setLines]         = useState([]);
  const lineRefs = useRef([]);

  useEffect(() => {
    getLessons("blind")
      .then((data) => { setLessons(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    window.speechSynthesis.cancel();
  }, []);

  const availableSubjects = ["All", ...new Set(lessons.map((l) => l.subject))];
  const filtered = activeSubject === "All" ? lessons : lessons.filter((l) => l.subject === activeSubject);

  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); setCurrentLine(-1); };

  const speakText = (text, onDone) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => { setSpeaking(false); if (onDone) onDone(); };
    window.speechSynthesis.speak(u);
  };

  /* Read PDF / text line by line */
  const handleListen = async (lesson) => {
    setListenError("");
    let raw = lesson.textContent || "";

    if (lesson.pdfUrl && looksLikePlaceholderText(lesson, raw)) {
      setListenLoading(lesson._id);
      try {
        const response = await getLessonReadableText(lesson._id);
        raw = response.textContent || lesson.description || lesson.title;

        if (response.textContent) {
          setLessons((prev) =>
            prev.map((item) =>
              item._id === lesson._id ? { ...item, textContent: response.textContent } : item
            )
          );
          setSelected((prev) =>
            prev?._id === lesson._id ? { ...prev, textContent: response.textContent } : prev
          );
        }
      } catch (error) {
        raw = lesson.description || lesson.title;
        setListenError("Could not read the PDF text, so reading the lesson summary instead.");
      } finally {
        setListenLoading("");
      }
    }

    const splitLines = raw.split(/(?<=[.?!])\s+|\n+/).map(l => l.trim()).filter(Boolean);
    setLines(splitLines);
    setCurrentLine(0);
    lineRefs.current = [];
    readLine(splitLines, 0);
  };

  const readLine = (allLines, idx) => {
    if (idx >= allLines.length) { setSpeaking(false); setCurrentLine(-1); return; }
    setCurrentLine(idx);
    setTimeout(() => lineRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    const u = new SpeechSynthesisUtterance(allLines[idx]);
    u.rate = 0.88;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => readLine(allLines, idx + 1);
    window.speechSynthesis.speak(u);
  };

  const handleSelect = (lesson) => {
    stop();
    setLines([]);
    setCurrentLine(-1);
    setSelected(lesson);
    speakText(`${lesson.title}. ${lesson.description || ""}. Press Listen to Chapter to begin reading.`);
  };

  return (
    <div className="tab-body">
      <div className="sidebar">
        <p className="sidebar-label">Subject</p>
        {availableSubjects.map((subj) => (
          <button key={subj} className={`sidebar-btn ${activeSubject === subj ? "active" : ""}`}
            onClick={() => { stop(); setActiveSubject(subj); }}>
            {subj === "All" ? "📚" : subj === "Science" ? "🔬" : subj === "Mathematics" ? "🔢" : "📖"} {subj}
          </button>
        ))}
      </div>

      <div className="mode-content">
        <h2 className="mode-heading">📖 Chapters</h2>
        <p className="mode-sub">Click a chapter to hear its description, then press Listen to read line by line.</p>
        {listenError && <p className="mode-loading">{listenError}</p>}

        {speaking && (
          <button className="stop-reading-btn" onClick={stop}>⏹ Stop Reading</button>
        )}

        {loading ? <p className="mode-loading">Loading lessons...</p>
          : filtered.length === 0 ? (
            <div className="mode-empty card">
              <p style={{ fontSize: "28px" }}>📭</p>
              <p style={{ fontWeight: "bold", color: "#4a3728", marginTop: "10px" }}>No lessons yet.</p>
              <p style={{ fontSize: "13px", color: "#8b6343", marginTop: "6px" }}>Your teacher hasn't uploaded Blind Mode lessons yet.</p>
            </div>
          ) : (
          <div className="chapters-grid">
            {filtered.map((lesson) => (
              <div key={lesson._id}
                className={`chapter-card card ${selected?._id === lesson._id ? "chapter-card-selected" : ""}`}
                onClick={() => handleSelect(lesson)}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(lesson)}
                tabIndex={0} role="button"
                aria-label={`${lesson.title}. Subject: ${lesson.subject}`}>
                <p className="chapter-subject">{lesson.subject}</p>
                <h3 className="chapter-title">{lesson.title}</h3>
                <p className="chapter-desc">{lesson.description || "No description."}</p>
                <div className="chapter-tags">
                  <span className="tag tag-brown">{lesson.subject}</span>
                  {lesson.pdfUrl      && <span className="tag tag-brown">📄 PDF</span>}
                  {lesson.textContent && <span className="tag tag-brown">📝 Text</span>}
                </div>

                {selected?._id === lesson._id && (
                  <div className="lesson-actions">
                    <button className="btn-primary listen-btn"
                      onClick={(e) => { e.stopPropagation(); stop(); handleListen(lesson); }}
                      disabled={listenLoading === lesson._id}>
                      {listenLoading === lesson._id ? "Preparing audio..." : "🔊 Listen to Chapter"}
                    </button>
                    {lesson.pdfUrl && (
                      <a href={`http://localhost:5000${lesson.pdfUrl}`} target="_blank" rel="noreferrer"
                        className="pdf-download-btn" onClick={(e) => e.stopPropagation()}>
                        📄 Download PDF
                      </a>
                    )}
                  </div>
                )}

                {/* Line-by-line reader */}
                {selected?._id === lesson._id && lines.length > 0 && (
                  <div className="line-reader">
                    <p className="line-reader-label">📄 Reading line by line:</p>
                    {lines.map((line, i) => (
                      <p key={i} ref={(el) => (lineRefs.current[i] = el)}
                        className={`reader-line ${i === currentLine ? "reader-line-active" : i < currentLine ? "reader-line-done" : ""}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {speaking && (
        <div className="speaking-toast">
          <span className="speaking-wave">▶▶</span>
          {currentLine >= 0 ? `Line ${currentLine + 1} of ${lines.length}` : "Audio Playing..."}
          <button className="toast-stop" onClick={stop}>Stop</button>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  QUIZ TAB                                                  */
/* ────────────────────────────────────────────────────────── */
const QuizTab = ({ speak }) => {
  const [started,  setStarted]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers,  setAnswers]  = useState([]);
  const [finished, setFinished] = useState(false);
  const [subject,  setSubject]  = useState("All");

  const questions = subject === "All" ? quizData : quizData.filter(q => q.subject === subject);

  const handleStart = () => {
    setCurrent(0); setSelected(null); setAnswers([]); setFinished(false); setStarted(true);
    speak(`Quiz started. Question 1 of ${questions.length}. ${questions[0].question}. Options: ${questions[0].options.join(", ")}.`);
  };

  const handlePick = (opt) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === questions[current].answer;
    speak(correct ? "Correct!" : `Wrong. The answer is ${questions[current].answer}.`);
  };

  const handleNext = () => {
    if (!selected) return;
    const updated = [...answers, { ...questions[current], selected, isCorrect: selected === questions[current].answer }];
    setAnswers(updated);
    if (current + 1 >= questions.length) { setFinished(true); const s = updated.filter(a => a.isCorrect).length; speak(`Quiz finished. You scored ${s} out of ${questions.length}.`); return; }
    const next = current + 1;
    setCurrent(next); setSelected(null);
    speak(`Question ${next + 1}. ${questions[next].question}. Options: ${questions[next].options.join(", ")}.`);
  };

  const score = answers.filter(a => a.isCorrect).length;

  if (!started) return (
    <div className="tab-body tab-body-center">
      <div className="quiz-start-card card">
        <div className="quiz-start-icon">📝</div>
        <h2 className="quiz-start-title">Blind Mode Quiz</h2>
        <p className="quiz-start-sub">Questions will be read aloud. Pick an answer to continue.</p>
        <div className="quiz-subject-buttons">
          {["All","Science","Mathematics","English"].map(s => (
            <button key={s} className={`quiz-subj-btn ${subject === s ? "quiz-subj-active" : ""}`}
              onClick={() => setSubject(s)}>
              {s === "All" ? "📚" : s === "Science" ? "🔬" : s === "Mathematics" ? "🔢" : "📖"} {s}
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
      <div className="tab-body tab-body-center">
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
    <div className="tab-body tab-body-center">
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

const ChatbotTab = ({ speak }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! 👋 I'm your Blind Mode assistant. Ask me anything — I'll read every answer aloud for you." }
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
      const response = await askChatbot({ message: msg, mode: "blind" });
      const reply = response.reply || response.message || "I could not answer that right now.";
      setTyping(false);
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
      speak(reply);
    } catch {
      const reply = "I could not answer right now. Please try again.";
      setTyping(false);
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
      speak(reply);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      speak("Voice input is not supported in this browser.");
      return;
    }

    setVoiceError("");
    recognitionRef.current?.stop?.();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      speak("Listening. Please ask your doubt.");
    };
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
      speak("Could not hear clearly. Please try again.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="tab-body chatbot-tab-body">
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
/*  ROOT COMPONENT                                            */
/* ────────────────────────────────────────────────────────── */
const BlindMode = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("chapters");

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  };

  const tabs = [
    { key: "chapters", label: "📖 Chapters" },
    { key: "quiz",     label: "📝 Quiz" },
    { key: "chatbot",  label: "💬 Chatbot" },
  ];

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">👁️ Blind Mode — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={() => { window.speechSynthesis.cancel(); navigate("/dashboard"); }}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mode-tabs">
        {tabs.map(t => (
          <button key={t.key}
            className={`mode-tab-btn ${tab === t.key ? "mode-tab-active" : ""}`}
            onClick={() => { window.speechSynthesis.cancel(); setTab(t.key); }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chapters" && <ChaptersTab />}
      {tab === "quiz"     && <QuizTab speak={speak} />}
      {tab === "chatbot"  && <ChatbotTab speak={speak} />}
    </div>
  );
};

export default BlindMode;
