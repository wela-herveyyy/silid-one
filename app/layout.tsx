import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ClassesPageSkeleton } from "@/components/organisms/PageSkeletons";
import { LmsSessionProvider } from "@/components/templates/LmsSessionProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SilidLMS",
  description: "Silid Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Suspense fallback={<ClassesPageSkeleton />}>
          <LmsSessionProvider>{children}</LmsSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
