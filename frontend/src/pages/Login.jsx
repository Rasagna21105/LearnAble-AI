import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      alert("Please register first.");
      return;
    }
    if (formData.email === storedUser.email && formData.password === storedUser.password) {
      alert("Login Successful");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="page-center">
      <div className="login-card card">
        <div className="login-icon">📚</div>
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-sub">Sign in to continue learning</p>

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
          <button type="submit" className="btn-primary login-submit">
            Login
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <span className="link-text" onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;