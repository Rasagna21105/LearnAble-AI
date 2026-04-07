import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "", confirmPassword: "" });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    localStorage.setItem("user", JSON.stringify(data));
    alert("Registered Successfully!");
    navigate("/");
  };

  return (
    <div className="page-center">
      <div className="register-card card">
        <div className="register-icon">🌱</div>
        <h2 className="register-title">Create Account</h2>
        <p className="register-sub">Join AI Inclusive Learning today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary register-submit">
            Create Account
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <span className="link-text" onClick={() => navigate("/")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;