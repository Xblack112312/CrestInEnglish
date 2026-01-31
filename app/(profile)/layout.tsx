"use client";
import AccountSidebar from "@/components/AccountSidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {

  const router = useRouter();
  const { status } = useSession();

    useEffect(() => {
      if (status === "unauthenticated") {
        router.replace("/sign-in")
      }
  }, [status, router])

  return (
    <div>
      <Navbar />
    <section className="flex flex-col gap-5 md:flex-row w-75 md:w-112.5 lg:w-250 mx-auto my-20 items-start">
      <AccountSidebar />
      <main className="flex flex-col">
        <Toaster />
        {children}
      </main>
    </section>
    <Footer />
    </div>
  );
};

export default ProfileLayout;
