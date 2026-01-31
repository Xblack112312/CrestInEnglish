"use client";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

interface ChildrenProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ChildrenProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // component mounted

    return () => {
      setMounted(false); // component unmounted
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
};

export default Provider;
