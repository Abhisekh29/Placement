/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingRequest = ({ setToastMessage }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/users/pending");
        setPendingUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPendingUsers();
  }, []);

  const handleAction = async (userId, username, status) => {
    try {
      await axios.put(`http://localhost:8000/api/users/${userId}/status`, {
        status: status,
        mod_by: user.userid,
      });
      setPendingUsers(pendingUsers.filter((user) => user.userid !== userId));
      setToastMessage({
        type: status === "1" ? "success" : "error",
        content: `${username} has been ${
          status === "1" ? "accepted" : "rejected"
        }.`,
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "An error occurred while updating the user.",
      });
    }
  };

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">Pending Requests</h2>
      <div className="border rounded-lg overflow-hidden">
        {/* Headers */}
        <div className="flex bg-gray-300 p-2 font-semibold text-sm">
          <div className="w-2/5">Username</div>
          <div className="w-2/5">User Type</div>
          <div className="w-1/5 text-right">Actions</div>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-60 overflow-y-auto">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((request) => (
              <div
                key={request.userid}
                className="flex items-center p-2 border-t bg-white text-sm"
              >
                <div className="w-2/5">{request.username}</div>
                <div className="w-2/5">
                  {request.user_type === "0" ? "Admin" : "Student"}
                </div>
                <div className="w-1/5 text-right space-x-1">
                  <button
                    onClick={() =>
                      handleAction(request.userid, request.username, "1")
                    }
                    className="bg-green-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleAction(request.userid, request.username, "2")
                    }
                    className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-2 text-sm">
              No pending requests.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingRequest;
