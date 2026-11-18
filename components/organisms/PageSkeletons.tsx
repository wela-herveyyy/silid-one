import type { ReactNode } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-orange-100"
        aria-hidden="true"
      />
      <div className="mx-auto flex h-16 w-full max-w-full items-center justify-between gap-3 px-4 md:max-w-[960px] md:px-6 lg:max-w-[1240px] lg:px-6 xl:max-w-[1380px] xl:px-8 2xl:max-w-[min(100%,1640px)]">
        <Skeleton variant="warm" className="h-7 w-28 rounded-lg" />
        <div className="hidden items-center gap-6 lg:flex">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </header>
  );
}

/**
 * Shared dashboard container matching DashboardTemplate geometry so route loading.tsx
 * skeletons transition without layout shift.
 */
export function AppShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
      className="relative flex min-h-screen flex-col overflow-x-clip bg-white"
    >
      <NavbarSkeleton />
      <div className="relative min-h-screen w-full flex-1 overflow-x-clip bg-white py-6">
        <main className="relative mx-auto w-full max-w-full px-4 md:max-w-[960px] md:px-6 lg:max-w-[1240px] lg:px-6 xl:max-w-[1380px] xl:px-8 2xl:max-w-[min(100%,1640px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Inner class-grid skeleton reusable inside both /class/loading.tsx and live client hydration.
 */
export function ClassesContentSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading classes">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Skeleton variant="warm" className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton variant="warm" className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton variant="warm" className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton variant="warm" className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-52 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-[20px] border border-orange-100 bg-white p-5 shadow-sm"
          >
            <Skeleton variant="warm" className="h-28 w-full rounded-xl" />
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton variant="warm" className="h-7 w-7 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClassesPageSkeleton() {
  return (
    <AppShellSkeleton>
      <ClassesContentSkeleton />
    </AppShellSkeleton>
  );
}

function ClassWorkspaceBannerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} variant="warm" className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border-2 border-orange-100 bg-gradient-to-br from-[#fff7f0] to-[#fffaf5] px-6 py-10 sm:px-12 sm:py-12">
        <Skeleton variant="warm" className="h-10 w-72 max-w-full rounded-xl" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton variant="warm" className="h-6 w-20 rounded-full" />
          <Skeleton variant="warm" className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ClassWorkspaceSkeleton({ children }: { children: ReactNode }) {
  return (
    <AppShellSkeleton>
      <div className="space-y-6">
        <ClassWorkspaceBannerSkeleton />
        {children}
      </div>
    </AppShellSkeleton>
  );
}

export function ClassFeedWorkspaceSkeleton() {
  return (
    <ClassWorkspaceSkeleton>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="space-y-4 lg:col-span-1">
          <div className="space-y-3 rounded-[20px] border-2 border-orange-100 bg-white p-5">
            <Skeleton variant="warm" className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <div className="hidden space-y-2 rounded-[20px] border-2 border-orange-100 bg-white p-4 lg:block">
            <Skeleton variant="warm" className="h-3.5 w-24" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-full rounded-xl" />
            ))}
          </div>
        </aside>

        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton variant="warm" className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>

          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClassWorkspaceSkeleton>
  );
}

export function ClassListRowsSkeleton() {
  return (
    <ClassWorkspaceSkeleton>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton variant="warm" className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <Skeleton variant="warm" className="h-9 w-36 rounded-lg" />
        </div>
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="warm" className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </ClassWorkspaceSkeleton>
  );
}

export function ClassTableWorkspaceSkeleton() {
  return (
    <ClassWorkspaceSkeleton>
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton variant="warm" className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton variant="warm" className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </ClassWorkspaceSkeleton>
  );
}

export function ClassBadgesWorkspaceSkeleton() {
  return (
    <ClassWorkspaceSkeleton>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <Skeleton variant="warm" className="h-16 w-16 rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-36" />
            <Skeleton className="mt-2 h-3.5 w-full" />
          </div>
        ))}
      </div>
    </ClassWorkspaceSkeleton>
  );
}

export function ClassChatWorkspaceSkeleton() {
  return (
    <ClassWorkspaceSkeleton>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${idx % 2 === 1 ? "flex-row-reverse" : ""}`}
            >
              <Skeleton variant="warm" className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-14 w-72 max-w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-12 w-full rounded-xl" />
      </div>
    </ClassWorkspaceSkeleton>
  );
}

export function CatalogPageSkeleton() {
  return (
    <AppShellSkeleton>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="warm" className="h-9 w-56 rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton variant="warm" className="h-10 w-36 rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <Skeleton variant="warm" className="h-32 w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function ChatPageSkeleton() {
  return (
    <AppShellSkeleton>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
          <Skeleton variant="warm" className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
          <Skeleton variant="warm" className="h-7 w-48" />
          <div className="space-y-3 py-4">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton variant="warm" className="ml-auto h-14 w-2/3 rounded-2xl" />
            <Skeleton className="h-20 w-4/5 rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function DirectoryOrFormSkeleton() {
  return (
    <AppShellSkeleton>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton variant="warm" className="h-8 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Skeleton variant="warm" className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function LoginPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading sign in"
      className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-4"
    >
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
        <Skeleton variant="warm" className="mx-auto h-9 w-36 rounded-xl" />
        <Skeleton className="mx-auto h-4 w-56" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton variant="warm" className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
