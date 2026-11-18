"use client";

import { ArrowLeft, Home, Info, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-orange-200/30 mix-blend-multiply blur-xl" />
        <div className="absolute -right-4 top-0 h-72 w-72 rounded-full bg-red-200/30 mix-blend-multiply blur-xl" />
        <div className="absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-200/30 mix-blend-multiply blur-xl" />
      </div>

      {/* Main 403 Card matching ForbiddenView.vue / vue_forbidden.png */}
      <div className="relative w-full max-w-2xl">
        <div className="rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm md:p-12">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                <Lock className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-8xl font-black text-transparent">
              403
            </h1>
          </div>

          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
            Access Denied
          </h2>

          <p className="mb-8 text-center text-lg leading-relaxed text-gray-600">
            You don&apos;t have the necessary permissions to access this page. This area is
            restricted to authorized users only.
          </p>

          <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 shrink-0 text-orange-600" />
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-orange-900">What can I do?</h3>
                <ul className="space-y-1 text-sm text-orange-800">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                    Contact your administrator for access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                    Return to the dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                    Verify you&apos;re using the correct account
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/class"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-6 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
            >
              <Home className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
