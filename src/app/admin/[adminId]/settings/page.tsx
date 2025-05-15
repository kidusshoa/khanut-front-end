"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaSave, FaUserPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminSettingsInput,
  AdminPasswordChangeInput,
  NewAdminInput,
  adminSettingsSchema,
  adminPasswordChangeSchema,
  newAdminSchema,
} from "@/lib/validations/admin";

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  // Settings form
  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
    formState: { errors: settingsErrors },
    setValue: setSettingsValue,
    reset: resetSettings,
  } = useForm<AdminSettingsInput>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      notify: false,
      twoFactorAuth: false,
    },
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<AdminPasswordChangeInput>({
    resolver: zodResolver(adminPasswordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // New admin form
  const {
    register: registerNewAdmin,
    handleSubmit: handleNewAdminSubmit,
    formState: { errors: newAdminErrors },
    reset: resetNewAdmin,
  } = useForm<NewAdminInput>({
    resolver: zodResolver(newAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
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
        // Update form values using setValue
        setSettingsValue("name", data.name || "");
        setSettingsValue("email", data.email || "");
        setSettingsValue("notify", data.notificationsEnabled || false);
        setSettingsValue("twoFactorAuth", data.twoFactorEnabled || false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings ❌");
      }
    }
    fetchSettings();
  }, [router, setSettingsValue]);

  const onSettingsSubmit = async (data: AdminSettingsInput) => {
    setSaving(true);

    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      // Make the API call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            notificationsEnabled: data.notify,
            twoFactorEnabled: data.twoFactorAuth,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings");
      }

      toast.success("Settings saved successfully ✅");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings ❌"
      );
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: AdminPasswordChangeInput) => {
    setSaving(true);

    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      // Make the API call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentPassword: data.oldPassword,
            newPassword: data.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      toast.success("Password updated successfully ✅");
      resetPassword(); // Reset password fields
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password ❌"
      );
    } finally {
      setSaving(false);
    }
  };

  const onNewAdminSubmit = async (data: NewAdminInput) => {
    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
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
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add admin");
      }

      toast.success("New admin added successfully ✅");
      resetNewAdmin(); // Reset form fields
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
        onSubmit={handleSettingsSubmit(onSettingsSubmit)}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            {...registerSettings("name")}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {settingsErrors.name && (
            <p className="text-red-500 text-xs mt-1">
              {settingsErrors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...registerSettings("email")}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {settingsErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {settingsErrors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              {...registerSettings("notify")}
              className="rounded"
            />
            Receive activity notifications
          </label>
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              {...registerSettings("twoFactorAuth")}
              className="rounded"
            />
            Enable Two-Factor Authentication
          </label>
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

      {/* Password Change Form */}
      <form
        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        className="bg-white rounded-lg shadow p-6 space-y-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Change Password
        </h3>
        <div className="space-y-3">
          <div>
            <input
              type="password"
              {...registerPassword("oldPassword")}
              placeholder="Current password"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {passwordErrors.oldPassword && (
              <p className="text-red-500 text-xs mt-1">
                {passwordErrors.oldPassword.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...registerPassword("newPassword")}
              placeholder="New password"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...registerPassword("confirmPassword")}
              placeholder="Confirm new password"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700 disabled:opacity-50"
            disabled={saving}
          >
            <FaSave /> {saving ? "Updating..." : "Update Password"}
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
                  <form
                    onSubmit={handleNewAdminSubmit(onNewAdminSubmit)}
                    className="space-y-3"
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        {...registerNewAdmin("name")}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                      {newAdminErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {newAdminErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        {...registerNewAdmin("email")}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                      {newAdminErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {newAdminErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        {...registerNewAdmin("password")}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                      {newAdminErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {newAdminErrors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 text-right">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        Add Admin
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
