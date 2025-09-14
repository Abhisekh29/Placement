/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import './App.css'
import Login from './pages/login'
import Register from './pages/register'
import Homepage from './pages/Homepage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'

import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage/>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />
  },
  {
    path: "/student-dashboard",
    element: <StudentDashboard />
  },
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App