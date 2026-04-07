import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Chatbot.css";

const suggestions = [
  "What is the solar system?",
  "Explain fractions simply",
  "What is a noun?",
  "How does photosynthesis work?",
];

const botResponses = {
  "solar system": "The solar system consists of the Sun and everything that orbits it — 8 planets, moons, asteroids, and comets. Earth is the third planet from the Sun.",
  "fraction": "A fraction represents a part of a whole. For example, 1/2 means one part out of two equal parts. The top number is the numerator and the bottom is the denominator.",
  "noun": "A noun is a word that names a person, place, thing, or idea. Examples: 'teacher', 'school', 'book', and 'happiness' are all nouns.",
  "photosynthesis": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to make their own food (glucose) and release oxygen as a byproduct.",
  "default": "That's a great question! I'm here to help you learn. Could you rephrase or ask something about Science, Mathematics, or English?",
};

const getBotReply = (msg) => {
  const lower = msg.toLowerCase();
  for (const key in botResponses) {
    if (key !== "default" && lower.includes(key)) return botResponses[key];
  }
  return botResponses["default"];
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! 👋 I'm your AI learning assistant. Ask me anything about your chapters — Science, Mathematics, or English!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: "bot", text: getBotReply(msg) }]);
    }, 1200);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="page-full">
      <div className="navbar">
        <span className="navbar-logo">💬 Chatbot — AI Inclusive Learning</span>
        <div className="navbar-right">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="chat-wrapper">
        {/* Suggestions */}
        <div className="chat-suggestions">
          <span className="suggestions-label">Try asking:</span>
          {suggestions.map(s => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-row ${msg.from === "user" ? "chat-row-user" : "chat-row-bot"}`}>
              {msg.from === "bot" && <div className="bot-avatar">🤖</div>}
              <div className={`chat-bubble ${msg.from === "user" ? "bubble-user" : "bubble-bot"}`}>
                {msg.text}
              </div>
              {msg.from === "user" && <div className="user-avatar">🧑</div>}
            </div>
          ))}
          {typing && (
            <div className="chat-row chat-row-bot">
              <div className="bot-avatar">🤖</div>
              <div className="bubble-bot typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask your doubt here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="btn-primary chat-send" onClick={() => sendMessage()}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;