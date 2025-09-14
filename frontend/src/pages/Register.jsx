import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    user_type: "1", // default: student
  });
  
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // try {
    //   const res = await fetch("http://localhost:8000/api/auth/register", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(formData),
    //   });

    //   const data = await res.json();
    //   console.log("Server response:", data);

    //   // success message / redirect
    // } catch (error) {
    //   console.error("Error:", error);
    // }

    try {
      const res = await axios.post("http://localhost:8000/api/auth/register", formData);
      console.log(res.data); // response is already JSON
      navigate("/login");
      
    } catch (error) {
      setErr(error.response?.data);
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Create New Account
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_phone_number"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              User Type
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="0">Admin</option>
              <option value="1">Student</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white 
              transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Register
          </button>
        </form>

        {err && <p className="pt-4 text-red-600 text-center">{err}</p>}

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to={"/login"} className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
