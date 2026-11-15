
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
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  IndianRupee,
  FileText,
} from "lucide-react";

export default function AddTransaction() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    transaction_date: new Date().toISOString().slice(0, 10),
    note: "",
  });


  useEffect(() => {
    setForm((prev) =>  ({ 
        ...prev,
        transaction_date: new
  Date().toISOString().slice(0,10),
    }));
  },[])

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    router.replace("/login");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save transaction. Please check your details.");
      }

      setMessage("Transaction added successfully!");

      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
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
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/transactions")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
          >
            <ArrowLeftRight size={20} />
            Transactions
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl bg-blue-500 px-4 py-3 font-semibold"
          >
            <PlusCircle size={20} />
            Add Transaction
          </button>

          <button
            onClick={() => router.push("/categories")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
          >
            <Tags size={20} />
            Categories
          </button>
        </nav>

        <p className="mb-4 mt-10 text-xs uppercase tracking-wider text-blue-200">
          Account
        </p>

        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
        >
          <UserRound size={20} />
          Profile
        </button>

        <button
          onClick={logout}
          className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-800"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-5 md:ml-60 md:p-8">

        {/* HEADER */}
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-[#10264e]">
              Add Transaction
            </h1>

            <p className="mt-1 text-gray-500">
              Record your income and expenses easily.
            </p>
          </div>

          <div className="rounded-full bg-blue-100 p-3 text-blue-700">
            <Wallet size={25} />
          </div>
        </header>

        {/* FORM CARD */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">

          <div className="mb-7">
            <h2 className="text-xl font-bold text-[#10264e]">
              Transaction Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the details below to save your transaction.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TRANSACTION TYPE */}
            <div>
              <label className="mb-3 block font-semibold text-gray-700">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      type: "income",
                      category: "Salary",
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 font-semibold transition ${
                    form.type === "income"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp size={21} />
                  Income
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      type: "expense",
                      category: "Food",
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 font-semibold transition ${
                    form.type === "expense"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <TrendingDown size={21} />
                  Expense
                </button>

              </div>
            </div>

            {/* TITLE */}
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Transaction Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Monthly Salary or Lunch"
                required
                className="w-full rounded-xl border border-gray-300 p-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* AMOUNT */}
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Amount
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="border-r border-gray-200 px-4 py-4 text-gray-500">
                  ₹
                </span>

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                  className="w-full rounded-r-xl p-4 text-gray-800 outline-none"
                />
              </div>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {form.type === "expense" ? (
                  <>
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Entertainment</option>
                    <option>Other</option>
                  </>
                ) : (
                  <>
                    <option>Salary</option>
                    <option>Business</option>
                    <option>Investment</option>
                    <option>Other</option>
                  </>
                )}
              </select>
            </div>

            {/* DATE */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-gray-700">
                <CalendarDays size={18} />
                Date
              </label>

              <input
                name="transaction_date"
                type="date"
                value={form.transaction_date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 p-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* NOTE */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-gray-700">
                <FileText size={18} />
                Note (Optional)
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Add additional details..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 p-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`rounded-lg p-3 text-sm font-medium ${
                  message.includes("successfully")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">

              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                <PlusCircle size={20} />
                {loading ? "Saving..." : "Save Transaction"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border border-gray-300 px-8 py-4 font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}