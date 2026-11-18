"use client";

import { Trash2, Users } from "lucide-react";
import { useUserCardActions } from "@/components/organisms/userCard.hooks";
import type { UserSelect } from "@/lib/entities/users.type";

interface UserDirectoryPanelProps {
  users: UserSelect[];
  errorMessage?: string;
}

export function UserDirectoryPanel({ users, errorMessage }: UserDirectoryPanelProps) {
  const { isPending, handleDelete } = useUserCardActions();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Registered Users
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Better Auth + Drizzle ORM directory guarded with inline AAA permissions.
        </p>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900">
            <Users className="h-4 w-4 text-orange-500" />
            Users ({users.length})
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-gray-900">{u.name}</p>
                  <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                    {u.role}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500">{u.email}</p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(u.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
