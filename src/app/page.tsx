
"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Tags,
  UserRound,
  LogOut,
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Trash2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API = "http://127.0.0.1:8000";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  transaction_date: string;
};

type Summary = {
  total_income: number;
  total_expenses: number;
  balance: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [month, setMonth] = useState("");
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  useEffect(() => {
  setCurrentYear(new Date().getFullYear());
}, []);

  // Monthly chart data from actual transactions
  const monthlyData = (() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

   if (currentYear === null) return [];

    return months.map((monthName, index) => {
      const monthTransactions = transactions.filter((item) => {
        const date = new Date(item.transaction_date + "T00:00:00");

        return (
          date.getMonth() === index &&
          date.getFullYear() === currentYear
        );
      });

      const income = monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

      const expenses = monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      return { month: monthName, income, expenses };
    });
  })();

  // Category chart data from actual expenses
  const categoryData = (() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        totals[item.category] =
          (totals[item.category] || 0) + item.amount;
      });

    const colors = [
      "#2563eb",
      "#16a34a",
      "#9333ea",
      "#f59e0b",
      "#ef4444",
      "#0891b2",
    ];

    return Object.entries(totals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  })();

  // Load dashboard data
  async function loadDashboard() {
    try {
      setApiError("");

      const [summaryResponse, transactionResponse] =
        await Promise.all([
          fetch(`${API}/summary`),
          fetch(`${API}/transactions`),
        ]);

      if (!summaryResponse.ok || !transactionResponse.ok) {
        throw new Error("Could not load dashboard data");
      }

      const summaryData = await summaryResponse.json();
      const transactionData = await transactionResponse.json();

      setSummary(summaryData);
      setTransactions(transactionData);
    } catch {
      setApiError(
        "Cannot connect to backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const currentMonth = new Date().toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });

    setMonth(currentMonth);
  }, []);

  // Delete transaction
  async function deleteTransaction(id: number) {
    const confirmed = window.confirm(
      "Do you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/transactions/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadDashboard();
    } catch {
      alert("Unable to delete transaction.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7ff] text-slate-800 md:flex">

      {/* SIDEBAR */}
      <aside className="w-full bg-gradient-to-b from-[#073c91] to-[#0754c8] p-5 text-white md:min-h-screen md:w-64 md:shrink-0">

        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 text-blue-700">
            <Wallet size={25} />
          </div>

          <div>
            <h2 className="font-bold">Monthly</h2>
            <p className="text-sm">Expenses Tracker</p>
          </div>
        </div>

        <p className="mb-3 text-xs uppercase tracking-wider text-blue-200">
          Main Menu
        </p>

        <nav className="space-y-2">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl bg-blue-500 px-4 py-3 font-semibold"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a
            href="/transactions"
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-700"
          >
            <ArrowLeftRight size={19} />
            Transactions
          </a>

          <a
            href="/add-transaction"
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-700"
          >
            <PlusCircle size={19} />
            Add Transaction
          </a>

          <a
            href="/categories"
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-700"
          >
            <Tags size={19} />
            Categories
          </a>
        </nav>

        <p className="mb-3 mt-10 text-xs uppercase tracking-wider text-blue-200">
          Account
        </p>

        <nav className="space-y-2">
          <a
            href="/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-700"
          >
            <UserRound size={19} />
            Profile
          </a>
        </nav>

        <div className="mt-10 border-t border-blue-400 pt-5">
          <button className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:text-white">
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-4 md:p-8">

        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your income, expenses and balance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm sm:flex">
              <CalendarDays size={17} className="text-blue-600" />
              <span className="text-sm">{month}</span>
            </div>

            

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              U
            </div>
          </div>
        </header>

        {apiError && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {apiError}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Income</p>

              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <TrendingUp size={23} />
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-green-600">
              {loading ? "Loading..." : money(summary.total_income)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Your recorded income
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Expenses</p>

              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <TrendingDown size={23} />
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-red-500">
              {loading ? "Loading..." : money(summary.total_expenses)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Your recorded expenses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Available Balance</p>

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Wallet size={23} />
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-blue-700">
              {loading ? "Loading..." : money(summary.balance)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Income minus expenses
            </p>
          </div>
        </section>

        {/* CHARTS */}
        <section className="mb-7 grid gap-5 xl:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="font-bold text-slate-800">
              Income vs Expenses
            </h3>

            <p className="mb-5 text-xs text-slate-400">
              Your recorded monthly data
            </p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#16a34a"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#2563eb"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-800">
              Expenses by Category
            </h3>

            <p className="mb-3 text-xs text-slate-400">
              Your recorded expense data
            </p>

            <div className="h-64">
              {categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No expense data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categoryData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* RECENT TRANSACTIONS */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">
                Recent Transactions
              </h3>

              <p className="text-xs text-slate-400">
                Your latest income and expenses
              </p>
            </div>

            <a
              href="/add-transaction"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Transaction
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-400"
                    >
                      No transactions yet. Add your first transaction!
                    </td>
                  </tr>
                ) : (
                  transactions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-blue-50/50"
                    >
                      <td className="p-3">
                        {item.transaction_date}
                      </td>

                      <td className="p-3">{item.category}</td>

                      <td className="p-3">{item.title}</td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td
                        className={`p-3 font-semibold ${
                          item.type === "income"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {money(item.amount)}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => deleteTransaction(item.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Monthly Expenses Tracker © 2026
        </p>

      </main>
    </div>
  );
}

