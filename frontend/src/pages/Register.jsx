import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    alert("Registered Successfully ✅");
    navigate("/");
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          height: 100%;
          width: 100%;
        }

        .register-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #cbb7e2, #e6dff3);
          font-family: "Segoe UI", sans-serif;
        }

        .register-card {
          background: #ffffff;
          padding: 35px;
          width: 360px;
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          text-align: center;
        }

        .register-card h2 {
          margin-bottom: 5px;
          color: #6a4c93;
        }

        .subtitle {
          color: #888;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .input-group {
          text-align: left;
          margin-bottom: 18px;
        }

        .input-group label {
          font-size: 13px;
          color: #6a4c93;
          margin-bottom: 5px;
          display: block;
        }

        .input-group input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #d1c4e9;
          outline: none;
          background: #faf8ff;
        }

        .input-group input:focus {
          border-color: #a084ca;
          box-shadow: 0 0 5px rgba(160, 132, 202, 0.4);
        }

        .register-btn {
          width: 100%;
          padding: 12px;
          border: none;
          background: linear-gradient(135deg, #a084ca, #6a4c93);
          color: white;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 500;
        }

        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(106, 76, 147, 0.4);
        }

        .footer-text {
          margin-top: 15px;
          font-size: 13px;
          color: #666;
        }

        .footer-text span {
          color: #6a4c93;
          font-weight: 500;
          cursor: pointer;
        }

        .footer-text span:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>
          <p className="subtitle">Register to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn">
              Register
            </button>
          </form>

          <p className="footer-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Login</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;