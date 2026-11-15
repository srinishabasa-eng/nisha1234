

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
  Wallet,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  transaction_date: string;
  note?: string;
};

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [userName, setUserName] = useState("User");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    transaction_date: "",
    note: "",
  });

  async function loadTransactions() {
    try {
      const response = await fetch(`${API}/transactions`);

      if (!response.ok) {
        throw new Error("Unable to load transactions");
      }

      const data = await response.json();
      setTransactions(data);
      setError("");
    } catch {
      setError("Could not load transactions. Check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
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

  function startEditing(item: Transaction) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      type: item.type,
      transaction_date: item.transaction_date,
      note: item.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({
      title: "",
      amount: "",
      category: "",
      type: "expense",
      transaction_date: "",
      note: "",
    });
  }

  async function updateTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingId) return;

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      !form.transaction_date
    ) {
      alert("Please enter valid transaction details.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/transactions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          amount: Number(form.amount),
          category: form.category,
          type: form.type,
          transaction_date: form.transaction_date,
          note: form.note,
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      await loadTransactions();
      cancelEditing();
      alert("Transaction updated successfully!");
    } catch {
      alert("Could not update transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id: number) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setTransactions((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (editingId === id) cancelEditing();
    } catch {
      alert("Could not delete transaction.");
    }
  }

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpenses;

  const months = Array.from(
    new Set(transactions.map((item) => item.transaction_date.slice(0, 7)))
  ).sort().reverse();

  const filteredTransactions = transactions.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    const matchesMonth =
      monthFilter === "all" ||
      item.transaction_date.startsWith(monthFilter);

    return matchesType && matchesMonth;
  });

  function formatMonth(value: string) {
    return new Date(value + "-02").toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

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
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl bg-blue-500 px-4 py-3 font-semibold">
            <ArrowLeftRight size={20} /> Transactions
          </button>

          <button
            onClick={() => router.push("/add-transaction")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
          >
            <PlusCircle size={20} /> Add Transaction
          </button>

          <button
            onClick={() => router.push("/categories")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
          >
            <Tags size={20} /> Categories
          </button>
        </nav>

        <p className="mb-4 mt-10 text-xs uppercase tracking-wider text-blue-200">
          Account
        </p>

        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
        >
          <UserRound size={20} /> Profile
        </button>

        <button
          onClick={logout}
          className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-5 md:ml-60 md:p-8">

        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-[#10264e]">
              Transactions
            </h1>
            <p className="mt-1 text-gray-500">
              All your income and expenses in one place
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-700">{userName}</span>
          </div>
        </header>

        {/* EDIT FORM */}
        {editingId !== null && (
          <section className="mb-7 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Transaction
              </h2>
              <button onClick={cancelEditing}>
                <X className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={updateTransaction}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Amount (₹)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium">Date</label>
                  <input
                    type="date"
                    value={form.transaction_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        transaction_date: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">Note</label>
                  <input
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Save size={18} />
                  {saving ? "Updating..." : "Update Transaction"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg bg-gray-200 px-5 py-3 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SUMMARY CARDS */}
        <section className="mb-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-700">
                <TrendingUp size={25} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <h2 className="text-2xl font-bold text-green-600">
                  ₹{totalIncome.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <TrendingDown size={25} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <h2 className="text-2xl font-bold text-red-600">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Wallet size={25} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <h2 className="text-2xl font-bold text-blue-700">
                  ₹{balance.toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm">
            {(["all", "income", "expense"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-5 py-2 font-medium capitalize ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item === "all" ? "All" : item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <CalendarDays size={19} className="text-blue-600" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent p-1 text-gray-700 outline-none"
            >
              <option value="all">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* TRANSACTIONS TABLE */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-xl font-bold text-[#10264e]">
              All Transactions
            </h2>
            <button
              onClick={() => router.push("/add-transaction")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle size={18} />
              Add Transaction
            </button>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Loading transactions...</p>
          ) : error ? (
            <p className="p-6 text-red-600">{error}</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No transactions found.
            </p>
          ) : (
            <div className="overflow-x-auto p-3">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-[#edf2fb] text-[#10264e]">
                  <tr>
                    <th className="rounded-l-lg p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="rounded-r-lg p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-blue-50/40"
                    >
                      <td className="p-4 text-gray-600">
                        {item.transaction_date}
                      </td>

                      <td className="p-4 font-semibold text-gray-800">
                        {item.category}
                      </td>

                      <td className="p-4 text-gray-700">
                        {item.title}
                        {item.note && (
                          <p className="text-sm text-gray-400">{item.note}</p>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            item.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>

                      <td
                        className={`p-4 font-bold ${
                          item.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"} ₹
                        {item.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => deleteTransaction(item.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}