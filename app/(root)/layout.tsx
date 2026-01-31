"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* main content respects navbar height */}
      <main className="flex-1 pt-16 w-full">
        <Toaster />
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
