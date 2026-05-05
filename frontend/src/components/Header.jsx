import React, { useEffect, useState } from "react";
import { HiOutlineGlobeAlt, HiOutlineClock, HiOutlineInformationCircle } from "react-icons/hi2";
import { Link } from "react-router-dom";

const Header = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenManual = () => {
    window.open("/User_Manual.pdf", "_blank");
  };

  return (
    <nav className="flex justify-between items-center py-3 px-6 md:px-10 bg-blue-500/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all">
      {/* Logo */}
      <a 
        href="https://gauhati.ac.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.png" alt="Gauhati University Logo" className="h-10 md:h-15 w-auto object-contain" />
      </a>

      {/* Right Side */}
      <div className="flex items-center gap-4 md:gap-4">
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 shadow-inner">
          <HiOutlineClock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold tabular-nums tracking-wide">
            {dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            <span className="mx-1.5 opacity-50">|</span>
            {dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <button 
          onClick={handleOpenManual}
          className="group flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-600 hover:text-white transition-all duration-300 font-bold text-sm border border-amber-100 shadow-sm cursor-pointer"
        >
          <HiOutlineInformationCircle className="w-5 h-5 group-hover:rotate-12 scale-109 transition-transform" />
          <span className="hidden sm:inline">Help</span>
        </button>
        <Link 
          to="/about" 
          className="group flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 font-bold text-sm border border-indigo-100 shadow-sm"
        >
          <HiOutlineGlobeAlt className="w-5 h-5 group-hover:rotate-12 scale-109 transition-transform" />
          <span className="hidden sm:inline">About Us</span>
        </Link>
      </div>
    </nav>
  );
};

export default Header;