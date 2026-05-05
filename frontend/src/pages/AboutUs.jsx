/*
 * ============================================================================
 * TRAINING & PLACEMENT CELL MANAGEMENT SYSTEM
 * ============================================================================
 * Original Architecture & UI/UX Design by: Abhisekh, Shikhar & Binit
 * Developed: 2025-2026
 * 
 * Note to future maintainers: 
 * Please retain this authorship header & page in future iterations.
 * ============================================================================
 */

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  HiOutlineRocketLaunch,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCommandLine,
  HiOutlineCodeBracketSquare,
} from "react-icons/hi2";

const AboutUs = () => {
  const features = [
    {
      title: "Our Mission",
      desc: "Bridging the gap between academic excellence and industry requirements through continuous skill enhancement.",
      icon: <HiOutlineRocketLaunch className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Skill Development",
      desc: "Organizing workshops on technical training, personality development, and mock interview sessions.",
      icon: <HiOutlineAcademicCap className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "Placement Support",
      desc: "Dedicated assistance for students to secure career opportunities in top-tier corporate organizations.",
      icon: <HiOutlineBriefcase className="w-8 h-8 text-emerald-600" />,
      color: "bg-emerald-50",
    },
  ];

  const developers = [
    {
      name: "Abhisekh Roy",
      role: "Lead Developer",
      dept: "B.Tech CSE 2022-2026",
      image: "/abhisekh.jpg",
    },
    {
      name: "Shikhar Kashyap Jyoti",
      role: "Frontend & Deployment",
      dept: "B.Tech CSE 2022-2026",
      image: "/shikhar.jpg",
    },
    {
      name: "Binit Krishna Goswami",
      role: "Backend & Database",
      dept: "B.Tech CSE 2022-2026",
      image: "/binit.jpg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-20 px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Training & Placement Cell
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed italic">
            "Empowering students through innovation and digital transformation."
          </p>
        </section>

        {/* Feature Cards Grid */}
        <section className="container mx-auto px-6 -mt-8 md:-mt-12 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="bg-white px-8 py-5 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group flex flex-col justify-center"
              >
                {/* Changed items-center to items-start and md:flex-col for vertical stacking at mid-size */}
                <div className="flex flex-row md:flex-col lg:flex-row items-center md:items-start lg:items-center gap-4 mb-3">
                  <div
                    className={`w-15 h-15 md:w-15 lg:w-15 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                  >
                    {React.cloneElement(item.icon, {
                      className:
                        "w-6 h-6 " +
                        item.icon.props.className
                          .split(" ")
                          .filter(
                            (c) => !c.startsWith("w-") && !c.startsWith("h-"),
                          )
                          .join(" "),
                    })}
                  </div>
                  {/* Added md:mt-2 to give space between icon and text when stacked */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight md:mt-2 lg:mt-0">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Developers Section */}
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-9">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">
                Development Team
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-2 flex items-center justify-center gap-3">
                <HiOutlineCommandLine className="text-blue-600" />
                The Minds Behind the System
              </h2>
              <p className="mt-4 text-gray-500 max-w-4xl mx-auto">
                Developed as a Final Year Major Project by students of the
                B.Tech Computer Science and Engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {developers.map((dev, idx) => {
                const orderClass =
                  idx === 0
                    ? "order-1 md:order-2"
                    : idx === 1
                      ? "order-2 md:order-1"
                      : "order-3 md:order-3";

                return (
                  <div key={idx} className={`group relative ${orderClass}`}>
                    <div className="absolute inset-0 bg-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative h-full bg-white p-6 rounded-3xl border border-gray-100 text-center transition-all duration-300 group-hover:-translate-y-2 shadow-sm group-hover:shadow-xl flex flex-col items-center">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex-shrink-0">
                        <img
                          src={dev.image}
                          alt={dev.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {dev.name}
                      </h3>
                      <p className="text-blue-600 font-semibold text-sm mb-2 uppercase tracking-wide">
                        {dev.role}
                      </p>
                      <div className="mb-auto flex items-center justify-center gap-1 text-gray-500 text-sm">
                        <HiOutlineCodeBracketSquare className="text-indigo-400" />
                        {dev.dept}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* System Info Section */}
        <section className="container mx-auto px-6 py-10 text-center">
          <div className="max-w-6xl mx-auto bg-indigo-50 rounded-3xl p-10 border border-indigo-100 shadow-inner">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
              Digital Transformation
            </h2>
            <p className="text-indigo-700 leading-relaxed">
              Our Training and Placement Cell is powered by a custom-built
              <strong> Training & Placement Cell Management System</strong>.
              This platform digitizes documentation, application tracking, and
              recruiter communications to ensure a seamless experience for
              Gauhati University students.
            </p>
          </div>
        </section>

        {/* Technology Stack Footer */}
        <section className="bg-gray-50 py-9 border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">
                Technology Stack
              </h2>
              <div className="h-1 w-12 bg-blue-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* React */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-blue-300 hover:scale-110 transition-all duration-300 group cursor-default shadow-sm">
                <img
                  src="/icon-react.svg"
                  alt="React"
                  className="w-5 h-5 group-hover:animate-slowspin"
                />
                <span className="font-mono font-bold text-blue-600">
                  React 19
                </span>
              </div>

              {/* Node.js */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-green-300 hover:scale-110 transition-all duration-300 cursor-default shadow-sm">
                <img src="/icon-nodejs.svg" alt="Node.js" className="w-5 h-5" />
                <span className="font-mono font-bold text-green-600">
                  Node.js
                </span>
              </div>

              {/* MySQL */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-orange-300 hover:scale-110 transition-all duration-300 cursor-default shadow-sm">
                <img src="/icon-mysql.svg" alt="MySQL" className="w-5 h-5" />
                <span className="font-mono font-bold text-orange-600">
                  MySQL
                </span>
              </div>

              {/* Tailwind CSS */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-indigo-300 hover:scale-110 transition-all duration-300 cursor-default shadow-sm">
                <img
                  src="/icon-tailwindcss.svg"
                  alt="Tailwind"
                  className="w-5 h-5"
                />
                <span className="font-mono font-bold text-indigo-600">
                  Tailwind CSS v4
                </span>
              </div>

              {/* Express.js */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-purple-300 hover:scale-110 transition-all duration-300 cursor-default shadow-sm">
                <img
                  src="/icon-expressjs.svg"
                  alt="Express"
                  className="w-5 h-5 opacity-80"
                />
                <span className="font-mono font-bold text-purple-600">
                  Express.js
                </span>
              </div>

              {/* Vite */}
              <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full border-2 border-yellow-300 hover:scale-110 transition-all duration-300 cursor-default shadow-sm">
                <img src="/icon-vitejs.svg" alt="Vite" className="w-5 h-5" />
                <span className="font-mono font-bold text-yellow-600">
                  Vite
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
