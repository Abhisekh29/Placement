// import React from "react";

// const Footer = () => {
//   return (
//     <>
//       <footer className="flex justify-between items-center py-2 px-10 bg-gray-600 text-white">
//         {/* Left - Logo */}
//         <div className="w-50">
//           <img src="/logo.png" alt="Logo" />
//         </div>

//         <div>
//           <p>© Gauhati University 2025. All Rights Reserved</p>
//         </div>

//         {/* Right - Contact Us */}
//         <div className="flex flex-col items-center text-center text-sm">
//           <h3 className="font-semibold">Contact Us</h3>
//           <p>Department of Information Technology</p>
//           <p>Gauhati University, Guwahati 14, Assam, India</p>
//         </div>
//       </footer>
//     </>
//   );
// };

// export default Footer;

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-1 py-6 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center md:items-start text-center md:text-left">
        
        {/* Left - Logo */}
        <div className="flex justify-center md:justify-start">
          <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
            <img src="/logo.png" alt="Gauhati University Logo" className="h-12 w-auto object-contain" />
          </div>
        </div>

        {/* Middle - Copyright */}
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-sm font-semibold tracking-wide text-white mb-1">
            Gauhati University Placement System
          </p>
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>

        {/* Right - Contact Us */}
        <div className="flex flex-col items-center md:items-end text-sm">
          <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Contact Us
          </h3>
          <p className="text-slate-400 font-medium hover:text-white transition-colors cursor-default mb-1">
            Department of Information Technology
          </p>
          <p className="text-slate-400 font-medium hover:text-white transition-colors cursor-default">
            Gauhati University, Guwahati 14, Assam
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;