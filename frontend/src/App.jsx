/* eslint-disable no-unused-vars */
import { useState } from 'react'
import './App.css'
import Login from './assets/pages/login'
import Register from './assets/pages/register'

import React from 'react'

import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: <div className='text-red-500 text-3xl font-bold underline'>Moi Tissar lover</div>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
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