import React, { useMemo, useState } from "react";

const initialDrivers = [
  {
    id: 1,
    name: "Ahmad Rahman",
    phone: "012-3456789",
    vehicle: "Perodua Bezza",
    plate: "WJA1234",
    status: "Active",
    rating: 4.8,
    trips: 127,
  },
  {
    id: 2,
    name: "Siti Noor",
    phone: "013-2223344",
    vehicle: "Proton Saga",
    plate: "VBN4567",
    status: "Inactive",
    rating: 4.5,
    trips: 82,
  },
  {
    id: 3,
    name: "Daniel Lee",
    phone: "014-7788990",
    vehicle: "Toyota Vios",
    plate: "BQA9988",
    status: "Active",
    rating: 4.9,
    trips: 205,
  },
];

const statusOptions = ["Active", "Inactive", "On Leave"];

export default function DriverManagement() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const sorted = [...drivers].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return sorted.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q) ||
        d.plate.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    );
  }, [drivers, query, sortKey, sortDir]);

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  const onSave = (payload) => {
    if (payload.id) {
      setDrivers((prev) => prev.map((d) => (d.id === payload.id ? payload : d)));
    } else {
      const nextId = Math.max(0, ...drivers.map((d) => d.id)) + 1;
      setDrivers((prev) => [...prev, { ...payload, id: nextId }]);
    }
    resetForm();
  };

  const onDelete = (id) => {
    if (window.confirm("Delete this driver?")) {
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Banner */}
      <header className="bg-blue-700 text-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wide">Driver Dashboard</h1>
          <nav className="space-x-8 text-lg font-medium">
            <a href="#" className="hover:underline">Assignments</a>
            <a href="#" className="hover:underline">Rides</a>
            <a href="#" className="hover:underline">Profile</a>
          </nav>
        </div>
      </header>

      {/* Centered Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl mx-auto">
          {/* Search + Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 justify-center">
            <input
              className="w-full sm:max-w-md rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring focus:ring-indigo-100 text-lg"
              placeholder="Cari pemandu (nama/telefon/kereta/plate/status)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing({
                    id: null,
                    name: "",
                    phone: "",
                    vehicle: "",
                    plate: "",
                    status: "Active",
                    rating: 0,
                    trips: 0,
                  });
                  setShowForm(true);
                }}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 shadow text-lg"
              >
                + Pemandu Baharu
              </button>
              <button
                onClick={() => setDrivers(initialDrivers)}
                className="rounded-xl bg-gray-100 px-4 py-2 hover:bg-gray-200 text-lg"
              >
                Reset Sampel
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mx-auto max-w-6xl">
            <table className="w-full divide-y divide-gray-200 text-lg">
              <thead className="bg-gray-50">
                <tr>
                  {["name", "phone", "vehicle", "plate", "status", "rating", "trips"].map(
                    (key) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-left text-base font-semibold uppercase tracking-wider text-gray-600"
                      >
                        <button
                          onClick={() => toggleSort(key)}
                          className="flex items-center gap-1"
                        >
                          <span>
                            {{
                              name: "Nama",
                              phone: "Telefon",
                              vehicle: "Kenderaan",
                              plate: "Plat",
                              status: "Status",
                              rating: "Rating",
                              trips: "Trip",
                            }[key]}
                          </span>
                          <span className="text-gray-400">
                            {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </span>
                        </button>
                      </th>
                    )
                  )}
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{d.name}</td>
                    <td className="px-6 py-4">{d.phone}</td>
                    <td className="px-6 py-4">{d.vehicle}</td>
                    <td className="px-6 py-4">{d.plate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          "px-2 py-1 rounded-full text-sm " +
                          (d.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : d.status === "On Leave"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-700")
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{d.rating.toFixed(1)}</td>
                    <td className="px-6 py-4">{d.trips}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(d);
                            setShowForm(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(d.id)}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                        >
                          Padam
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Tiada pemandu ditemui.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showForm && <DriverForm value={editing} onCancel={resetForm} onSave={onSave} />}
        </div>
      </main>
    </div>
  );
}

function DriverForm({ value, onCancel, onSave }) {
  const [form, setForm] = useState(
    value || {
      id: null,
      name: "",
      phone: "",
      vehicle: "",
      plate: "",
      status: "Active",
      rating: 0,
      trips: 0,
    }
  );

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {form.id ? "Edit Pemandu" : "Tambah Pemandu"}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-4 space-y-4 text-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </Field>
            <Field label="Telefon">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </Field>
            <Field label="Kenderaan">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.vehicle}
                onChange={(e) => update("vehicle", e.target.value)}
                required
              />
            </Field>
            <Field label="Plat">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.plate}
                onChange={(e) => update("plate", e.target.value)}
                required
              />
            </Field>
            <Field label="Status">
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.rating}
                onChange={(e) => update("rating", Number(e.target.value))}
              />
            </Field>
            <Field label="Trip">
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                value={form.trips}
                onChange={(e) => update("trips", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
