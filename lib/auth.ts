import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import ConnectToDatabase from "./database";
import argon2 from "argon2";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await ConnectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const valid = await argon2.verify(user.password, credentials.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          grade: user.grade,
          education: user.education,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On login, store DB info in token
        token.id = user.id;
        token.fullName = user.fullName;
        token.email = user.email;
        token.role = user.role;
        token.grade = user.grade;
        token.education = user.education;
      } else {
        // On subsequent requests, refresh token from DB
        await ConnectToDatabase();
        const dbUser = await User.findById(token.id);

        if (dbUser) {
          token.fullName = dbUser.fullName;
          token.role = dbUser.role;
          token.grade = dbUser.grade;
          token.education = dbUser.education;
        }
      }

      return token;
    },
    async session({ session, token }) {
            await ConnectToDatabase();
        const dbUser = await User.findById(token.id);

      if (session.user) {
        session.user.id = token.id as string;
        session.user.fullName = token.fullName as string;
        session.user.email = token.email as string;
        session.user.role = dbUser.role as string;
        session.user.grade = token.grade as string;
        session.user.education = token.education as string;
      }
      return session;
    },
  },
};
