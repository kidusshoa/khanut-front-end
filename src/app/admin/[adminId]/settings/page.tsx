"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaSave, FaUserPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    notify: false,
    twoFactorAuth: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const accessToken = Cookies.get("client-token");

        if (!accessToken) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          notify: data.notificationsEnabled || false,
          twoFactorAuth: data.twoFactorEnabled || false,
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings ❌");
      }
    }
    fetchSettings();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      // Prepare the data for the API
      const updateData = {
        name: form.name,
        // Only include password fields if they are filled
        ...(passwordForm.oldPassword && passwordForm.newPassword
          ? {
              currentPassword: passwordForm.oldPassword,
              newPassword: passwordForm.newPassword,
            }
          : {}),
      };

      // Validate password match if changing password
      if (
        passwordForm.newPassword &&
        passwordForm.newPassword !== passwordForm.confirmPassword
      ) {
        toast.error("New passwords don't match ❌");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings");
      }

      // Reset password fields after successful update
      if (passwordForm.newPassword) {
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      toast.success("Settings saved ✅");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings ❌"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      // Validate inputs
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
        toast.error("All fields are required ❌");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/add-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(newAdmin),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add admin");
      }

      toast.success("New admin added ✅");
      setNewAdmin({ name: "", email: "", password: "" });
      setIsAddAdminOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add admin ❌"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-500">Admin Settings</h2>
        <button
          onClick={() => setIsAddAdminOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          <FaUserPlus /> Add Admin
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="notify"
              checked={form.notify}
              onChange={handleChange}
            />
            Receive activity notifications
          </label>
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="twoFactorAuth"
              checked={form.twoFactorAuth}
              onChange={handleChange}
            />
            Enable Two-Factor Authentication
          </label>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Change Password
          </h3>
          <div className="space-y-3">
            <input
              type="password"
              name="oldPassword"
              placeholder="Old password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700 disabled:opacity-50"
            disabled={saving}
          >
            <FaSave /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <Transition appear show={isAddAdminOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsAddAdminOpen(false)}
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
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold text-orange-700 mb-4">
                    Add New Admin
                  </Dialog.Title>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newAdmin.name}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, name: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-6 text-right">
                    <button
                      onClick={handleAddAdmin}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Add Admin
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
