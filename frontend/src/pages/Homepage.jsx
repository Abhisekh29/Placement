/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import api from '../api/axios'
// Import the Marquee component for vertical scrolling
import Marquee from "react-easy-marquee";
// Dot icon 
import { BsDot } from "react-icons/bs";


// Utility function to format the date reliably (remains the same)
const formatDate = (dateString) => {
  // ... (implementation remains the same)
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown Date';
    // Format to DD/MM/YYYY
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return 'Error Date';
  }
};

const NotificationTicker = ({ notifications }) => {
  const reversedNotifications = [...notifications].reverse();
  // Keep blank items for initial marquee fill
  //const blankItems = Array(1).fill({ text: '', date: '' });
  const blankItems1 = Array(6).fill({ text: '', date: '' });
  const finalData = [ ...reversedNotifications, ...blankItems1];

  const marqueeItems = finalData.map((notif, index) => {
    const formattedDate = formatDate(notif.date);
    const isBlank = notif.text === '';


    return (
      <div
        key={index}
        // Set up the container as a flex row, aligning items to the START (top)
        className="w-full flex items-start" // <-- Crucial for top alignment
        style={{
          flexShrink: 0,
          padding: '4px 0',
          minHeight: '40px',
          opacity: isBlank ? 0 : 1,
          visibility: isBlank ? 'hidden' : 'visible',
          borderBottom: isBlank ? 'none' : '1px solid #e5e7eb',
        }}
      >
        {!isBlank && (
          // The main container for the content line
          <div className="gap-2 flex w-full">
            {/* Dot/Date/Dash Column */}
            <div
              className="flex items-start flex-nowrap flex-shrink-0 pr-2"
              style={{
                width: '115px',
                lineHeight: '1.4',
              }}
            >
              {/* Dot */}
              <div className="text-gray-900 mr-1 flex-shrink-0" style={{ marginTop: '-4px' }}>
                <BsDot size={27} />
              </div>
              {/* Date */}
              <span className="text-red-600 font-medium text-sm flex-shrink-0">
                {formattedDate}
              </span>
            </div>
            {/* Flexible Text Content */}
            <span
              className="text-gray-900 text-base flex-1 min-w-0"
              style={{
                lineHeight: '1.4',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {notif.text}
            </span>
          </div>
        )}
      </div>
    );
  });

  if (marqueeItems.length === 0) {
    return <p className="text-center text-gray-500 py-4">No notifications to display.</p>;
  }

  return (
    <div className="h-full overflow-hidden">
      <Marquee
        axis="Y"
        height="100%"
        reverse={true} // Keep Bottom-to-Top scroll
        duration={12000}
        loop={0}
        pauseOnHover={true}
        // Note: The `style` is crucial for the component to take up the full height
        style={{ height: '100%', overflow: 'hidden' }}
      >
        {marqueeItems}
      </Marquee>
    </div>
  );
};

const Homepage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data Fetching
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/homeNotifications");

        if (Array.isArray(res.data)) {

          // Guaranteed NEWEST FIRST (Descending) sort
          const sortedData = res.data.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setNotifications(sortedData);
        } else {
          setError("Unexpected data format: Expected an array.");
        }
      } catch (err) {
        const message = `Failed to load notifications. Check if your API server is running and reachable.`;
        setError(message);
        console.error("Error fetching home notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Conditional content for the notifications box
  let notificationContent;

  if (loading) {
    notificationContent = <p className="text-center text-gray-500 py-4">Loading notifications...</p>;
  } else if (error) {
    // Display a detailed error for easy debugging
    notificationContent = <p className="p-2 text-red-700 bg-red-100 border border-red-300 rounded text-sm overflow-auto">{error}</p>;
  } else if (notifications.length === 0) {
    notificationContent = <p className="text-center text-gray-500 p-4">No new notifications available.</p>;
  } else {
    // Ticker container with calculated height, essential for vertical scrolling
    notificationContent = (
      <div className="flex-1 h-full min-h-0">
        <NotificationTicker
          key={`notifications-count-${notifications.length}`}
          notifications={notifications}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="gur.png"
            alt="Placement"
            className="w-full rounded-lg shadow-lg"
          />
          <h1 className="mt-6 text-2xl font-bold text-gray-800">
            Placement Management System
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 h-40">
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg shadow-md hover:bg-blue-100 transition cursor-pointer"
            >
              <img src="student.svg" alt="Student" className="w-12 h-12 mb-2" />
              <h2 className="font-semibold text-blue-600 text-center">
                Student Login
              </h2>
            </Link>
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg shadow-md hover:bg-green-100 transition cursor-pointer"
            >
              <img src="admin.svg" alt="Admin" className="w-12 h-12 mb-2" />
              <h2 className="font-semibold text-green-600 text-center">
                Admin Login
              </h2>
            </Link>
          </div>

          {/* Notification Box: Ensure h-72 and flex-col for height management */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-md overflow-hidden h-72 flex flex-col">
            <h3 className="text-lg font-bold pb-2 text-gray-700 flex-shrink-0">
              Notifications
            </h3>
            {notificationContent}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;