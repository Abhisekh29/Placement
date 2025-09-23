/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import AcademicYear from "./pages/AdminCards/AcademicYear";
import Department from "./pages/AdminCards/Department";
import CompanyType from "./pages/AdminCards/CompanyType";
import AcademicSession from "./pages/AdminCards/AcademicSession";
import Program from "./pages/AdminCards/Program";
import Company from "./pages/AdminCards/Company";
import Expenditure from "./pages/AdminCards/Expenditure";


// Role-based wrappers
const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "0" = admin
  return isLoggedIn && userType === "0" ? children : <Navigate to="/login" />;
};

const StudentRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "1" = student
  return isLoggedIn && userType === "1" ? children : <Navigate to="/login" />;
};

// Public route (for homepage/login/register)
const PublicRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
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

  // Load user from sessionStorage when app mounts
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
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
      path: "/admin/academic-year",
      element: (
        <AdminRoute>
          <AcademicYear />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/academic-session",
      element: (
        <AdminRoute>
          <AcademicSession />4
        </AdminRoute>
      ),
    },
    {
      path: "/admin/department",
      element: (
        <AdminRoute>
          <Department />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/program",
      element: (
        <AdminRoute>
          <Program />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/company-type",
      element: (
        <AdminRoute>
          <CompanyType />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/company",
      element: (
        <AdminRoute>
          <Company />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/placement-drive",
      element: (
        <AdminRoute>
          
        </AdminRoute>
      ),
    },
    {
      path: "/admin/notifications",
      element: (
        <AdminRoute>
          
        </AdminRoute>
      ),
    },
    {
      path: "/admin/internship",
      element: (
        <AdminRoute>
          
        </AdminRoute>
      ),
    },
    {
      path: "/admin/expenditure",
      element: (
        <AdminRoute>
          <Expenditure />
        </AdminRoute>
      ),
    },
    
    {
      path: "/admin/students",
      element: (
        <AdminRoute>
          
        </AdminRoute>
      ),
    },
    {
      path: "/admin/reports",
      element: (
        <AdminRoute>
          
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
