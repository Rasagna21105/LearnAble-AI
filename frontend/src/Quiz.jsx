import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Quiz.css";

const allQuestions = [
  { id: 1, subject: "Science", question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], answer: "8" },
  { id: 2, subject: "Science", question: "What do plants need for photosynthesis?", options: ["Water, sunlight, CO₂", "Water, oxygen, soil", "Sunlight, oxygen, soil", "CO₂, nitrogen, sunlight"], answer: "Water, sunlight, CO₂" },
  { id: 3, subject: "Science", question: "What is the closest star to Earth?", options: ["Sirius", "Proxima Centauri", "The Sun", "Betelgeuse"], answer: "The Sun" },
  { id: 4, subject: "Mathematics", question: "What is 1/2 + 1/4?", options: ["2/6", "3/4", "1/3", "2/4"], answer: "3/4" },
  { id: 5, subject: "Mathematics", question: "What is 0.5 as a fraction?", options: ["1/4", "1/5", "1/2", "2/5"], answer: "1/2" },
  { id: 6, subject: "Mathematics", question: "What is 7 × 8?", options: ["54", "56", "48", "64"], answer: "56" },
  { id: 7, subject: "English", question: "Which of these is a noun?", options: ["Run", "Happy", "School", "Quickly"], answer: "School" },
  { id: 8, subject: "English", question: "Which sentence is correct?", options: ["She go to school.", "She goes to school.", "She going to school.", "She goed to school."], answer: "She goes to school." },
  { id: 9, subject: "English", question: "What is the plural of 'child'?", options: ["Childs", "Childes", "Children", "Childrens"], answer: "Children" },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState("All");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const subjects = ["All", "Science", "Mathematics", "English"];
  const questions = activeSubject === "All" ? allQuestions : allQuestions.filter(q => q.subject === activeSubject);

  const handleStart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setStarted(true);
  };

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === null) return;
    const isCorrect = selected === questions[current].answer;
    const updated = [...answers, { question: questions[current].question, selected, correct: questions[current].answer, isCorrect }];
    setAnswers(updated);

    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(prev => prev + 1);
      setSelected(null);
    }
  };

  const score = answers.filter(a => a.isCorrect).length;
  const percent = Math.round((score / questions.length) * 100);

  const getGrade = () => {
    if (percent >= 80) return { label: "Excellent!", emoji: "🏆", color: "#2d6a2d" };
    if (percent >= 60) return { label: "Good Job!", emoji: "👍", color: "#856404" };
    return { label: "Keep Practicing!", emoji: "💪", color: "#8b3a3a" };
  };

  if (!started) {
    return (
      <div className="page-full">
        <div className="navbar">
          <span className="navbar-logo">📝 Quiz — AI Inclusive Learning</span>
          <div className="navbar-right">
            <button className="btn-white" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          </div>
        </div>

        <div className="quiz-start-screen">
          <div className="quiz-start-card card">
            <div className="quiz-start-icon">📝</div>
            <h2 className="quiz-start-title">Knowledge Quiz</h2>
            <p className="quiz-start-sub">Test what you've learned. Choose a subject or attempt all.</p>

            <div className="quiz-subject-picker">
              <p className="quiz-picker-label">Select Subject</p>
              <div className="quiz-subject-buttons">
                {subjects.map(s => (
                  <button
                    key={s}
                    className={`quiz-subj-btn ${activeSubject === s ? "quiz-subj-active" : ""}`}
                    onClick={() => setActiveSubject(s)}
                  >
                    {s === "All" ? "📚" : s === "Science" ? "🔬" : s === "Mathematics" ? "🔢" : "📖"} {s}
                  </button>
                ))}
              </div>
            </div>

            <p className="quiz-count">
              {activeSubject === "All" ? allQuestions.length : allQuestions.filter(q => q.subject === activeSubject).length} questions
            </p>

            <button className="btn-primary quiz-start-btn" onClick={handleStart}>
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const grade = getGrade();
    return (
      <div className="page-full">
        <div className="navbar">
          <span className="navbar-logo">📝 Quiz — AI Inclusive Learning</span>
          <div className="navbar-right">
            <button className="btn-white" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          </div>
        </div>

        <div className="quiz-result-screen">
          <div className="quiz-result-card card">
            <div className="result-emoji">{grade.emoji}</div>
            <h2 className="result-title" style={{ color: grade.color }}>{grade.label}</h2>
            <p className="result-score">{score} / {questions.length} correct</p>
            <div className="result-bar-wrap">
              <div className="result-bar" style={{ width: `${percent}%`, backgroundColor: grade.color }} />
            </div>
            <p className="result-percent">{percent}%</p>

            <div className="result-breakdown">
              {answers.map((a, i) => (
                <div key={i} className={`result-item ${a.isCorrect ? "result-correct" : "result-wrong"}`}>
                  <span className="result-item-icon">{a.isCorrect ? "✅" : "❌"}</span>
                  <div>
                    <p className="result-q">{a.question}</p>
                    {!a.isCorrect && (
                      <p className="result-answer">Correct: {a.correct}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="result-actions">
              <button className="btn-primary" onClick={handleStart}>Try Again</button>
              <button className="btn-outline" onClick={() => { setStarted(false); }}>Change Subject</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">📝 Quiz — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
      </div>

      <div className="quiz-screen">
        <div className="quiz-card card">
          <div className="quiz-meta">
            <span className="tag tag-brown">{q.subject}</span>
            <span className="quiz-progress-text">Question {current + 1} of {questions.length}</span>
          </div>

          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <h3 className="quiz-question">{q.question}</h3>

          <div className="quiz-options">
            {q.options.map(opt => (
              <button
                key={opt}
                className={`quiz-option
                  ${selected === opt ? (opt === q.answer ? "option-correct" : "option-wrong") : ""}
                  ${selected !== null && opt === q.answer && selected !== opt ? "option-reveal" : ""}
                `}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected && (
            <div className={`quiz-feedback ${selected === q.answer ? "feedback-correct" : "feedback-wrong"}`}>
              {selected === q.answer ? "✅ Correct!" : `❌ Wrong. The answer is: ${q.answer}`}
            </div>
          )}

          <button
            className={`btn-primary quiz-next ${!selected ? "quiz-next-disabled" : ""}`}
            onClick={handleNext}
            disabled={!selected}
          >
            {current + 1 >= questions.length ? "Finish Quiz" : "Next Question →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;