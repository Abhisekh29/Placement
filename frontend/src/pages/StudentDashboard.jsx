import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Zod schema for strict validation
const studentSchema = z.object({
  rollno: z
    .number({ invalid_type_error: "Roll Number must be a number" })
    .int("Roll Number must be an integer")
    .positive("Roll Number must be positive"),
  name: z
    .string()
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
    .min(1, "Full Name is required"),
  mobile: z
    .number({ invalid_type_error: "Mobile number must be a number" })
    .int("Mobile number must be an integer")
    .refine(
      (val) => /^\d{10}$/.test(String(val)),
      "Mobile number must be exactly 10 digits"
    ),
  email: z.string().email("Invalid email"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.enum(["Male", "Female", "Other"], "Select a valid gender"),
  caste: z.string().optional(),
  address: z.string().optional(),
  per_10: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be between 0-100")
    .max(100, "Must be between 0-100")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
      "Up to 2 decimal places only"
    ),
  per_12: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be between 0-100")
    .max(100, "Must be between 0-100")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
      "Up to 2 decimal places only"
    ),
  session_id: z.number({ invalid_type_error: "Select a session" }),
  program_id: z.number({ invalid_type_error: "Select a program" }),
});

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    mode: "onChange", // live validation
  });

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/session_master")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:8000/api/program_master")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error(err));
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, userid: user.userid, mod_by: user.userid };
      await axios.post("http://localhost:8000/api/student_master", payload);
      setSuccess("Student data saved successfully!");
      reset();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderDashboard />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome, <span className="font-semibold">{user.username}</span>
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto space-y-4"
        >
          {/* Roll Number */}
          <div>
            <label className="block mb-1 font-medium">Roll Number</label>
            <input
              type="number"
              {...register("rollno", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.rollno
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.rollno && (
              <p className="text-red-600 mt-1">{errors.rollno.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              {...register("name")}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block mb-1 font-medium">Mobile</label>
            <input
              type="number"
              {...register("mobile", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.mobile
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.mobile && (
              <p className="text-red-600 mt-1">{errors.mobile.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="abhisekh@gmail.com"
              {...register("email")}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block mb-1 font-medium">Date of Birth</label>
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <DatePicker
                  placeholderText="Select Date of Birth"
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString().split("T")[0] : "")
                  }
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.dob
                      ? "border-red-500 focus:ring-red-200"
                      : "focus:ring-blue-200"
                  }`}
                  maxDate={new Date()}
                />
              )}
            />
            {errors.dob && (
              <p className="text-red-600 mt-1">{errors.dob.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select
              {...register("gender")}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.gender
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 mt-1">{errors.gender.message}</p>
            )}
          </div>

          {/* Caste */}
          <div>
            <label className="block mb-1 font-medium">Caste</label>
            <select
              {...register("caste")}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.caste
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            >
              <option value="">Select Caste</option>
              <option value="General">General</option>
              <option value="OBC-NCL">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
            {errors.caste && (
              <p className="text-red-600 mt-1">{errors.caste.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              {...register("address")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Percentages */}
          <div>
            <label className="block mb-1 font-medium">10th Percentage</label>
            <input
              type="number"
              step="0.01"
              {...register("per_10", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.per_10
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.per_10 && (
              <p className="text-red-600 mt-1">{errors.per_10.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">12th Percentage</label>
            <input
              type="number"
              step="0.01"
              {...register("per_12", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.per_12
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            />
            {errors.per_12 && (
              <p className="text-red-600 mt-1">{errors.per_12.message}</p>
            )}
          </div>

          {/* Session */}
          <div>
            <label className="block mb-1 font-medium">Session</label>
            <select
              {...register("session_id", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.session_id
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name}
                </option>
              ))}
            </select>
            {errors.session_id && (
              <p className="text-red-600 mt-1">{errors.session_id.message}</p>
            )}
          </div>

          {/* Program */}
          <div>
            <label className="block mb-1 font-medium">Program</label>
            <select
              {...register("program_id", { valueAsNumber: true })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.program_id
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:ring-blue-200"
              }`}
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.program_id} value={p.program_id}>
                  {p.program_name}
                </option>
              ))}
            </select>
            {errors.program_id && (
              <p className="text-red-600 mt-1">{errors.program_id.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Save
          </button>

          {success && (
            <p className="text-green-600 mt-2 text-center">{success}</p>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;