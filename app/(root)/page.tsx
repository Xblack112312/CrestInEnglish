"use client"
import Courses from "@/components/Courses";
import Hero from "@/components/Hero";
import StudentReviews from "@/components/Reviews";
import Teachers from "@/components/Teachers";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Page = () => {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true); // component mounted

      return () => {
        setMounted(false); // component unmounted
      };
    }, []);

    if (!mounted) {
      return null;
    }

  return (
    <div className=" w-full">
      <Hero />
      {/* <Teachers /> */}
      <Courses />
      <StudentReviews />
    </div>
  );
};

export default Page;
