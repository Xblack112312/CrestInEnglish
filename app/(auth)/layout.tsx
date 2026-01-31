"use client";
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { Toaster } from 'sonner';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <Toaster />
        {children}
    </div>
  )
}

export default Layout