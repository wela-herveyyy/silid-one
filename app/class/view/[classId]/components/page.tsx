"use client";

import {
  Calendar,
  Folder,
  Inbox,
  Layers,
  ListFilter,
  Pencil,
  Percent,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ClassworkComponentsPage() {
  const { classId } = useParams<{ classId: string }>();
  const { components, addComponent, updateComponent, deleteComponent } = useLmsSession();
  const [activeTab, setActiveTab] = useState<"components" | "terms">("components");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("5");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState("20");
  const [termName, setTermName] = useState("1st Term");
  const [categoryName, setCategoryName] = useState("");
  const [weight, setWeight] = useState("20");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return components;
    return components.filter(
      (c) =>
        c.categoryName.toLowerCase().includes(q) || c.termName.toLowerCase().includes(q),
    );
  }, [components, search]);

  const totalWeight = components.reduce((sum, item) => sum + item.weightPercent, 0);
  const avgWeight = components.length > 0 ? Math.round(totalWeight / components.length) : 0;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    addComponent(termName.trim() || "1st Term", categoryName.trim(), Number(weight) || 10);
    setCategoryName("");
    setShowAddModal(false);
  };

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="space-y-6">
        {/* Header matching vue_class_components.png */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
            Class Setup
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Classwork Components
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and weight the categories that make up student grades.
          </p>
        </div>

        {/* Underline Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("components")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === "components"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Classwork Components</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === "terms"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Terms</span>
            </button>
          </div>
        </div>

        {/* 3 Stat Cards matching vue_class_components.png */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Components
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{components.length}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Layers className="h-5 w-5" />
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Weight
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalWeight}%</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Percent className="h-5 w-5" />
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Average Weight
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{avgWeight}%</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
        </div>

        {/* Toolbar Card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Components
              </p>
              <p className="text-sm font-bold text-gray-900">{components.length} categories</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components..."
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <label className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700">
              <ListFilter className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={perPage}
                onChange={(e) => setPerPage(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setShowAddModal((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Component</span>
            </button>
          </div>
        </div>

        {showAddModal ? (
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-orange-200 bg-orange-50/40 p-5 sm:grid-cols-4 sm:items-end"
          >
            <div>
              <label htmlFor="cmp-term" className="block text-xs font-semibold text-gray-700">
                Term
              </label>
              <input
                id="cmp-term"
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cmp-name" className="block text-xs font-semibold text-gray-700">
                Category name
              </label>
              <input
                id="cmp-name"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Recitation"
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cmp-weight" className="block text-xs font-semibold text-gray-700">
                Weight (%)
              </label>
              <input
                id="cmp-weight"
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="h-9 flex-1 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {/* List / Empty State */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-gray-800">No components found</p>
              <p className="mt-1 text-xs text-gray-500">
                Get started by creating a new component.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Component</th>
                  <th className="px-5 py-3">Weight</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.slice(0, Number(perPage)).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      {editingId === item.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 rounded-lg border border-orange-300 px-2.5 text-sm font-semibold text-gray-900 focus:outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="h-8 w-20 rounded-lg border border-orange-300 px-2 text-sm font-semibold text-gray-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateComponent(
                                item.id,
                                editName.trim() || item.categoryName,
                                Number(editWeight) || item.weightPercent,
                              );
                              setEditingId(null);
                            }}
                            className="h-8 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="h-8 rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-500">
                            <Folder className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-bold text-gray-900">{item.categoryName}</p>
                            <p className="text-[11px] font-mono text-gray-400">
                              ID: {item.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${Math.min(100, item.weightPercent)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-gray-900 tabular-nums">
                          {item.weightPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">Nov 13, 2026</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditName(item.categoryName);
                            setEditWeight(String(item.weightPercent));
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteComponent(item.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ClassWorkspaceTemplate>
  );
}
