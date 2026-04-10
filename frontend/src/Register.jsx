import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./api";
import "./shared.css";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "", password: "", confirmPassword: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        email: data.email, password: data.password, role: "student",
      });
      if (res.message === "Registered successfully") {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/student/login"), 1800);
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page-center">
      <div className="register-card card">
        <button className="back-role-btn" onClick={() => navigate("/")}>← Back</button>
        <div className="register-icon">🌱</div>
        <h2 className="register-title">Create Student Account</h2>
        <p className="register-sub">Join AI Inclusive Learning today</p>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com"
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password"
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Repeat your password"
              onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary register-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <span className="link-text" onClick={() => navigate("/student/login")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;