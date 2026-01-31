"use client";
import AdminHeader from "@/components/AdminHeader";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Toaster } from "sonner";

const ALLOWED_ROLES = ["admin", "teacher"];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/not-found");
      return;
    }

    if (!ALLOWED_ROLES.includes(session.user.role)) {
      router.replace("/not-found");
    }
  }, [status, session, router]);

  // Prevent UI flash
  if (
    status === "loading" ||
    !session ||
    !ALLOWED_ROLES.includes(session.user.role)
  ) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Toaster />
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
