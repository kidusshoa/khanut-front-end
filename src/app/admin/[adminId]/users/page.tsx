"use client";
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";
const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN || "your_token_here";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  createdAt: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState("");
  const router= useRouter()

  const fetchUsers = async () => {
    const accessToken = Cookies.get('client-token');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }

    try {
      const res = await axios.get("https://khanut.onrender.com/api/admin/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    }
  };

  const handleAction = async (action: "warn" | "delete") => {
    if (!selectedUser || (action === "warn" && !reason.trim())) {
      toast.error("Please provide a reason.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;

    try {
      if (action === "warn") {
        await axios.post(
          `http://localhost:4000/api/admin/users/${selectedUser._id}/warn`,
          { reason },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else if (action === "delete") {
        await axios.delete(
          `http://localhost:4000/api/admin/users/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      toast.success(`User ${action}ed successfully ✅`);
      setSelectedUser(null);
      setReason("");
      fetchUsers();
    } catch (err) {
      toast.error(`Failed to ${action} user.`);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-orange-500">Customers</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50"
              onClick={() => setSelectedUser(user)}
            >
              <FaUserCircle size={32} className="text-orange-600" />
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
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
                  <Dialog.Title className="text-lg font-bold text-orange-700 mb-4">
                    {selectedUser?.name}'s Profile
                  </Dialog.Title>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <p>
                      <strong>Email:</strong> {selectedUser?.email}
                    </p>
                    <p>
                      <strong>Joined At:</strong>{" "}
                      {new Date(selectedUser?.createdAt || "").toDateString()}
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
                      Remove
                    </button>
                    <button
                      className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded hover:bg-yellow-200"
                      onClick={() => handleAction("warn")}
                    >
                      Warn
                    </button>
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      className="px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded hover:bg-blue-200"
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
