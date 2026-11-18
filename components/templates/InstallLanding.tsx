"use client";

import Link from "next/link";
import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { StoragePanel } from "@/components/organisms/StoragePanel";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";

export function InstallLanding() {
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setSwReady(true))
        .catch(() => setSwReady(false));
    }
  }, []);

  return (
    <DashboardTemplate>
      <div className="mx-auto max-w-[1360px] space-y-8">
        <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm xl:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Smartphone className="h-3.5 w-3.5" />
              SilidLMS PWA Ready {swReady ? "· Service Worker Active" : ""}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Install SilidLMS as a Progressive Web App
            </h1>
            <p className="text-sm text-gray-600">
              Desktop-first App Router workspace backed by Drizzle ORM, Better Auth, inline AAA
              permissions, and IndexedDB offline records (`rnd_pwa`).
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Download className="h-4 w-4" />
                Sign In with Better Auth
              </Link>
              <Link
                href="/class"
                className="inline-flex h-10 items-center rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open Classes
              </Link>
            </div>
          </div>

          <StoragePanel embedded />
        </div>
      </div>
    </DashboardTemplate>
  );
}
