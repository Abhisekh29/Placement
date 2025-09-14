import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        formData,
        { withCredentials: true }
      );

      console.log(res.data);
      localStorage.setItem("token", res.data.token); // if backend returns token

      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          userid: res.data.userid,
          username: res.data.username,
          user_type: res.data.user_type,
          is_enable: res.data.is_enable,
          mod_by: res.data.mod_by,
          mod_time: res.data.mod_time,
        })
      );

      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user.username); // Example: prints the username

      if (res.data.is_enable === "0") {
        alert(
          "Your account is not verified yet. Please wait for admin approval."
        );
      } else if (res.data.is_enable === "2") {
        alert("Your account has been rejected. Contact admin for details.");
      } else if (res.data.is_enable === "1") {
        // Account verified
        if (res.data.user_type === "0") {
          navigate("/admin-dashboard");
        } else if (res.data.user_type === "1") {
          navigate("/student-dashboard");
        }
      }
    } catch (error) {
      setErr(error.response?.data || "Something went wrong");
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Welcome
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </button>
        </form>
        {err && <p className="pt-4 text-red-600 text-center">{err}</p>}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to={"/register"} className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
