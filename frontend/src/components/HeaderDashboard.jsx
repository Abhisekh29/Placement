// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// const HeaderDashboard = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(sessionStorage.getItem("user"));

//   const handleLogout = async () => {
//     try {
//       const res = await api.post("/auth/logout", {});

//       console.log(res.data);

//       // Clear sessionStorage
//       sessionStorage.removeItem("user");
//       sessionStorage.removeItem("token");
//       sessionStorage.removeItem("studentStatus");

//       // Redirect to homepage
//       navigate("/");
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };
//   const [dateTime, setDateTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setDateTime(new Date());
//     }, 1000); // update every second
//     return () => clearInterval(timer); // cleanup on unmount
//   }, []);

//   return (
//     <nav className="flex justify-between items-center py-2 px-10 bg-blue-500 text-white">
//       <div className="w-50">
//         <img src="/logo.png" alt="" />
//       </div>

//       <div className="flex flex-col items-center text-center">
//         <button
//           onClick={handleLogout}
//           className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
//         >
//           Logout
//         </button>
//         <span className="text-xs mt-1">
//           {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
//         </span>
//       </div>
//     </nav>
//   );
// };

// export default HeaderDashboard;


/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { HiArrowRightOnRectangle, HiOutlineClock } from "react-icons/hi2";

const HeaderDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout", {});
      console.log(res.data);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("studentStatus");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="flex justify-between items-center py-3 px-6 md:px-10 bg-blue-600/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all">
      {/* Logo Container */}
      <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/student/dashboard")}>
        <img src="/logo.png" alt="Gauhati University Logo" className="h-10 md:h-15 w-auto object-contain" />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Sleek Clock Badge (Hidden on super small mobile, visible otherwise) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 shadow-inner">
          <HiOutlineClock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold tabular-nums tracking-wide">
            {dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            <span className="mx-1.5 opacity-50">|</span>
            {dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Modern Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-sm border border-red-100 hover:border-red-600 shadow-sm"
        >
          <span>Logout</span>
          <HiArrowRightOnRectangle className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </nav>
  );
};

export default HeaderDashboard;