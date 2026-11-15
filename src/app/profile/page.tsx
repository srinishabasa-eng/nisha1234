

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Tags,
  UserRound,
  LogOut,
  Mail,
  LockKeyhole,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("Not connected");

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "User");
    setEmail(localStorage.getItem("user_email") || "Not connected");
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    router.replace("/login");
  }

  const links = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
    { label: "Add Transaction", icon: PlusCircle, path: "/add-transaction" },
    { label: "Categories", icon: Tags, path: "/categories" },
    { label: "Profile", icon: UserRound, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="w-full bg-blue-700 p-5 text-white md:min-h-screen md:w-64">
        <h2 className="mb-8 text-2xl font-bold">Expense Tracker</h2>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = link.path === "/profile";

            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${
                  active ? "bg-white text-blue-700" : "hover:bg-blue-600"
                }`}
              >
                <Icon size={20} />
                {link.label}
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-blue-600"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-2 text-slate-500">
          View and manage your account information.
        </p>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl font-bold text-blue-700">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              {name}
            </h2>
            <p className="text-slate-500">Monthly Expenses Tracker</p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5">
              <UserRound className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="font-semibold text-slate-800">{name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5">
              <Mail className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="font-semibold text-slate-800">{email}</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/change-password")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
            >
              <LockKeyhole size={19} />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 p-3 font-semibold text-white hover:bg-red-700"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
