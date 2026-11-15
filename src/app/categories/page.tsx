

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Tags,
  UserRound,
  LogOut,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Film,
  BriefcaseBusiness,
  Shapes,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
};

const categoryDetails = [
  { name: "Food", icon: Utensils, color: "bg-orange-100 text-orange-600" },
  { name: "Travel", icon: Car, color: "bg-blue-100 text-blue-600" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-pink-100 text-pink-600" },
  { name: "Education", icon: GraduationCap, color: "bg-purple-100 text-purple-600" },
  { name: "Health", icon: HeartPulse, color: "bg-red-100 text-red-600" },
  { name: "Entertainment", icon: Film, color: "bg-yellow-100 text-yellow-700" },
  { name: "Salary", icon: BriefcaseBusiness, color: "bg-green-100 text-green-600" },
  { name: "Other", icon: Shapes, color: "bg-gray-100 text-gray-600" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("http://127.0.0.1:8000/transactions");
        if (!response.ok) throw new Error("Could not load data");

        const data = await response.json();
        setTransactions(data);
      } catch {
        setError("Could not load categories. Check your backend.");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    router.replace("/login");
  }

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-[#f3f6ff] md:flex">

      {/* SIDEBAR */}
      <aside className="flex w-full flex-col bg-[#073b91] p-5 text-white md:fixed md:inset-y-0 md:w-60">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 text-blue-700">
            <Wallet size={27} />
          </div>
          <div>
            <h2 className="font-bold">Monthly</h2>
            <p className="text-sm">Expenses Tracker</p>
          </div>
        </div>

        <p className="mb-4 text-xs uppercase tracking-wider text-blue-200">
          Main Menu
        </p>

        <nav className="space-y-2">
          <button onClick={() => router.push("/")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800">
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button onClick={() => router.push("/transactions")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800">
            <ArrowLeftRight size={20} /> Transactions
          </button>

          <button onClick={() => router.push("/add-transaction")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800">
            <PlusCircle size={20} /> Add Transaction
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl bg-blue-500 px-4 py-3 font-semibold">
            <Tags size={20} /> Categories
          </button>
        </nav>

        <p className="mb-4 mt-10 text-xs uppercase tracking-wider text-blue-200">
          Account
        </p>

        <button onClick={() => router.push("/profile")} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800">
          <UserRound size={20} /> Profile
        </button>

        <button onClick={logout} className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-5 md:ml-60 md:p-8">

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-[#10264e]">Categories</h1>
            <p className="mt-1 text-gray-500">
              Organize and track your income and expenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-700">{userName}</span>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="mb-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Tags size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <h2 className="text-2xl font-bold text-gray-800">8</h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <h2 className="text-2xl font-bold text-green-600">
                  ₹{totalIncome.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <h2 className="text-2xl font-bold text-red-600">
                  ₹{totalExpense.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY HEADING */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#10264e]">
              All Categories
            </h2>
            <p className="text-sm text-gray-500">
              Your spending and income categories
            </p>
          </div>

          <button
            onClick={() => router.push("/add-transaction")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            Add Transaction
          </button>
        </div>

        {/* CATEGORY CARDS */}
        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : error ? (
          <p className="rounded-xl bg-white p-5 text-red-600">{error}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {categoryDetails.map((category) => {
              const items = transactions.filter(
                (item) => item.category.toLowerCase() === category.name.toLowerCase()
              );

              const expense = items
                .filter((item) => item.type === "expense")
                .reduce((sum, item) => sum + item.amount, 0);

              const income = items
                .filter((item) => item.type === "income")
                .reduce((sum, item) => sum + item.amount, 0);

              const Icon = category.icon;

              return (
                <div
                  key={category.name}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`rounded-xl p-4 ${category.color}`}>
                      <Icon size={26} />
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {items.length} transactions
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#10264e]">
                    {category.name}
                  </h3>

                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expenses</span>
                      <span className="font-semibold text-red-600">
                        ₹{expense.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Income</span>
                      <span className="font-semibold text-green-600">
                        ₹{income.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
