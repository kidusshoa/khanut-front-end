"use client";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";

const users = [
  {
    id: 1,
    name: "Kidus Birhanu",
    email: "kidus@example.com",
    phone: "+251912345678",
    location: "Addis Ababa",
    joinedAt: "2024-03-15",
  },
  {
    id: 2,
    name: "Mekdes Assefa",
    email: "mekdes@example.com",
    phone: "+251911223344",
    location: "Haramaya",
    joinedAt: "2024-04-01",
  },
];

export default function ManageUsers() {
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(
    null
  );
  const [reason, setReason] = useState("");

  const handleAction = async (action: "delete" | "ban" | "warn") => {
    if (!selectedUser || !reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;

    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      toast.success(`User ${action}ed successfully ✅`);
      console.log("Audit Log:", {
        userId: selectedUser.id,
        action,
        reason,
        timestamp: new Date().toISOString(),
      });
      setSelectedUser(null);
      setReason("");
    } catch (error) {
      toast.error(`Failed to ${action} user.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Customers</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50"
              onClick={() => setSelectedUser(user)}
            >
              <FaUserCircle size={32} className="text-blue-600" />
              <span className="text-lg font-medium text-gray-800">
                {user.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Transition appear show={!!selectedUser} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedUser(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-200 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold text-blue-700 mb-4">
                    {selectedUser?.name}'s Profile
                  </Dialog.Title>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <p>
                      <strong>Email:</strong> {selectedUser?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedUser?.phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedUser?.location}
                    </p>
                    <p>
                      <strong>Joined At:</strong> {selectedUser?.joinedAt}
                    </p>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for action:
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      rows={3}
                      placeholder="Write your reason here..."
                    />
                  </div>

                  <div className="mt-4 flex justify-between gap-2">
                    <button
                      className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200"
                      onClick={() => handleAction("delete")}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded hover:bg-yellow-200"
                      onClick={() => handleAction("warn")}
                    >
                      Warn
                    </button>
                    <button
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
                      onClick={() => handleAction("ban")}
                    >
                      Ban
                    </button>
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200"
                      onClick={() => {
                        setSelectedUser(null);
                        setReason("");
                      }}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
