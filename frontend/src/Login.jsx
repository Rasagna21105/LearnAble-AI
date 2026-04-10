import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { loginUser } from "./api";
import "./shared.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error,   setError]     = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ ...formData, role: "student" });
      if (res.token && res.role === "student") {
        login(res);
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid credentials or not a student account.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page-center">
      <div className="login-card card">
        <button className="back-role-btn" onClick={() => navigate("/")}>← Back</button>
        <div className="login-icon">🎓</div>
        <h2 className="login-title">Student Login</h2>
        <p className="login-sub">Sign in to continue learning</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
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
          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <span className="link-text" onClick={() => navigate("/student/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;