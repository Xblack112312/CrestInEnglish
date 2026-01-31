"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!mounted || status === "loading") {
    return <nav className="h-16" />;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 h-16 px-10 flex items-center justify-between bg-gray-50/90">
      <Link href="/">
        <h1 className="text-[24px] font-semibold text-[#1E1E24]">
          CrestInEnglish.
        </h1>
      </Link>

      {status === "unauthenticated" ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.replace("/sign-in")}
            className="underline"
          >
            Log In
          </button>
          <button
            onClick={() => router.replace("/sign-up")}
            className="bg-black text-white p-3 rounded-md"
          >
            Get Started
          </button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10 cursor-pointer">
              <AvatarFallback className=" bg-black! text-white! text-lg uppercase">
                {getInitials(session?.user?.fullName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-72 mx-5">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.replace("/")}>
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.replace("/profile")}>
                Profile
              </DropdownMenuItem>
              {session?.user?.role === "admin" ? (
                <DropdownMenuItem onClick={() => router.replace("/dashboard")}>
                  Admin
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>Courses</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => signOut()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
};

export default Navbar;
