import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Verify, Step 2: Reset
  const [formData, setFormData] = useState({
    username: "",
    mobile: "",
    email: "",
    dob: null,
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [verifiedUserId, setVerifiedUserId] = useState(null);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- Handlers for Step 1 (Verification) ---
  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr("");
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setErr("");
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErr("");

    // Format date to YYYY-MM-DD (using en-CA locale)
    const formattedDOB = formData.dob
      ? formData.dob.toLocaleDateString("en-CA")
      : "";

    try {
      const res = await api.post("/auth/verify-student-details", {
        username: formData.username,
        mobile: formData.mobile,
        email: formData.email,
        dob: formattedDOB, // now in YYYY-MM-DD format
      });

      setVerifiedUserId(res.data.userid);
      setSuccess(res.data.message);
      setErr("");
      setStep(2);
    } catch (error) {
      setErr(
        error.response?.data ||
          "Verification failed. Please check your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for Step 2 (Resetting Password) ---
  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr("");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErr("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErr("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 4) {
      setErr("Password must be at least 4 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/reset-password-public", {
        userid: verifiedUserId,
        newPassword: passwordData.newPassword,
      });

      setSuccess(res.data + " Redirecting to login...");
      setErr("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {step === 1 && (
          <>
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Forgot Your Password?
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600">
              Please enter your details to verify your identity.
            </p>
            <form className="space-y-4" onSubmit={handleVerificationSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Username (Phone Number)"
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                required
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number (10 digits)"
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                required
              />
              <div className="w-full">
                <DatePicker
                  selected={formData.dob}
                  onChange={handleDateChange}
                  placeholderText="Date of Birth (YYYY-MM-DD)"
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                  wrapperClassName="w-full"
                  required
                />
              </div>

              {err && (
                <p className="pt-2 text-red-600 text-center text-sm">{err}</p>
              )}

              <button
                type="submit"
                className={`w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
              Reset Your Password
            </h2>
            <p className="mb-6 text-center text-sm text-green-600">{success}</p>
            <form className="space-y-4" onSubmit={handleResetSubmit}>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password (min. 4 characters)"
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                onChange={handlePasswordChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2"
                required
              />

              {err && (
                <p className="pt-2 text-red-600 text-center text-sm">{err}</p>
              )}

              <button
                type="submit"
                className={`w-full rounded-xl bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
