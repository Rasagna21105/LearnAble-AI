import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { loginUser } from "./api";
import "./shared.css";
import "./TeacherLogin.css";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ ...formData, role: "teacher" });
      if (res.token && res.role === "teacher") {
        login(res);
        navigate("/teacher/dashboard");
      } else {
        setError(res.message || "Invalid credentials or not a teacher account.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page-center">
      <div className="tlogin-card card">
        <button className="back-role-btn" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="tlogin-icon">🧑‍🏫</div>
        <h2 className="tlogin-title">Teacher Login</h2>
        <p className="tlogin-sub">Sign in to manage your lessons</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="teacher@school.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary tlogin-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login as Teacher"}
          </button>
        </form>

        <p className="tlogin-footer">
          No account?{" "}
          <span className="link-text" onClick={() => navigate("/teacher/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default TeacherLogin;