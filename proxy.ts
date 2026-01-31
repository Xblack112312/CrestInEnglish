import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return token?.role === "admin" || token?.role === "teacher";
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
