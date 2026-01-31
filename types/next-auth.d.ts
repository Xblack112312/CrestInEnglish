import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      grade?: string;
      fullName: string;
      email: string;
      education?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    grade?: string;
    fullName: string;
    email: string;
    education?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    grade?: string;
    education?: string;
  }
}
