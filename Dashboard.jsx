import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logged out successfully 👋");
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

        .dashboard-container {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #cbb7e2, #e6dff3);
          font-family: "Segoe UI", sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .navbar {
          background: #6a4c93;
          color: white;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: 500;
        }

        .logout-btn {
          background: #ffffff;
          color: #6a4c93;
          border: none;
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #f0eaff;
        }

        /* Content */
        .dashboard-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .card-container {
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .card {
          background: white;
          width: 250px;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(106, 76, 147, 0.4);
        }

        .card h3 {
          color: #6a4c93;
          margin-bottom: 10px;
        }

        .card p {
          color: #777;
          font-size: 14px;
        }
      `}</style>

      <div className="dashboard-container">
        
        {/* Navbar */}
        <div className="navbar">
          <div>AI Inclusive Learning</div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="card-container">

            <div className="card">
              <h3>Blind Mode</h3>
              <p>Text to Speech learning support</p>
            </div>

            <div className="card">
              <h3>Deaf Mode</h3>
              <p>Speech to Text learning support</p>
            </div>

            <div className="card">
              <h3>Chatbot</h3>
              <p>Ask doubts and get answers</p>
            </div>

            <div className="card">
              <h3>Quiz</h3>
              <p>Test your knowledge</p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;