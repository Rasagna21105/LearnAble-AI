import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./api";
import "./shared.css";
import "./TeacherRegister.css";

const TEACHER_CODE = "TEACH2024"; // simple access code — change as needed

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    teacherCode: "",
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

    if (data.teacherCode !== TEACHER_CODE) {
      setError("Invalid teacher access code. Please contact your administrator.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        email:    data.email,
        password: data.password,
        role:     "teacher",
      });
      if (res.message === "Registered successfully") {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/teacher/login"), 1800);
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
      <div className="treg-card card">
        <button className="back-role-btn" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="treg-icon">🧑‍🏫</div>
        <h2 className="treg-title">Create Teacher Account</h2>
        <p className="treg-sub">You need a teacher access code to register.</p>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="teacher@school.com"
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
          <div className="form-group">
            <label>Teacher Access Code</label>
            <input
              type="text"
              name="teacherCode"
              placeholder="Enter your access code"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary treg-submit" disabled={loading}>
            {loading ? "Creating account..." : "Register as Teacher"}
          </button>
        </form>

        <p className="treg-footer">
          Already have an account?{" "}
          <span className="link-text" onClick={() => navigate("/teacher/login")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegister;