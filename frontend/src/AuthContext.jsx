import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    if (token && role && email) {
      setUser({ token, role, email });
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role",  data.role);
    localStorage.setItem("email", data.email);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;