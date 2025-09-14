/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/login";
import Register from "./pages/register";
import Homepage from "./pages/Homepage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Role-based wrappers
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "0" = admin
  return isLoggedIn && userType === "0" ? children : <Navigate to="/login" />;
};

const StudentRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "1" = student
  return isLoggedIn && userType === "1" ? children : <Navigate to="/login" />;
};

// Public route (for homepage/login/register)
const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type;

  if (isLoggedIn) {
    // Redirect logged-in users based on type
    return userType === "0" ? (
      <Navigate to="/admin-dashboard" />
    ) : (
      <Navigate to="/student-dashboard" />
    );
  }

  return children; // allow access if not logged in
};

const App = () => {
  const [user, setUser] = useState(null);

  // Load user from localStorage when app mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <PublicRoute>
          <Homepage />
        </PublicRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
      ),
    },
    {
      path: "/admin-dashboard",
      element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      ),
    },
    {
      path: "/student-dashboard",
      element: (
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      ),
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
