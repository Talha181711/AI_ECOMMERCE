import React, { createContext, useState, useEffect } from "react";

// 1) Create the context object
export const AuthContext = createContext({
  currentUser: null,
  login: () => {},
  logout: () => {},
});

// 2) Create a provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // e.g. on mount, try to fetch the user from your backend/session
  useEffect(() => {
    fetch(`${import.meta.env.VITE_HOST_URL}/get_current_user.php`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCurrentUser(data.user);
      });
  }, []);

  const login = (user) => {
    setCurrentUser(user);
  };
  const logout = () => {
    // optionally call backend logout endpoint
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
