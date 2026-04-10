import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import RoleSelector      from "./RoleSelector";
import Login             from "./Login";
import Register          from "./Register";
import Dashboard         from "./Dashboard";
import BlindMode         from "./BlindMode";
import DeafMode          from "./DeafMode";
import TeacherLogin      from "./TeacherLogin";
import TeacherRegister   from "./TeacherRegister";
import TeacherDashboard  from "./TeacherDashboard";
import UploadLesson      from "./UploadLesson";
import ManageLessons     from "./ManageLessons";

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/student/login" />;
  if (user.role !== "student") return <Navigate to="/teacher/dashboard" />;
  return children;
};

const TeacherRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/teacher/login" />;
  if (user.role !== "teacher") return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Landing — role picker */}
    <Route path="/" element={<RoleSelector />} />

    {/* Student auth */}
    <Route path="/student/login"    element={<Login />} />
    <Route path="/student/register" element={<Register />} />

    {/* Student protected — Blind and Deaf each contain Chapters + Quiz + Chatbot tabs */}
    <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
    <Route path="/blind"     element={<StudentRoute><BlindMode /></StudentRoute>} />
    <Route path="/deaf"      element={<StudentRoute><DeafMode /></StudentRoute>} />

    {/* Teacher auth */}
    <Route path="/teacher/login"    element={<TeacherLogin />} />
    <Route path="/teacher/register" element={<TeacherRegister />} />

    {/* Teacher protected */}
    <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
    <Route path="/teacher/upload"    element={<TeacherRoute><UploadLesson /></TeacherRoute>} />
    <Route path="/teacher/manage"    element={<TeacherRoute><ManageLessons /></TeacherRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;