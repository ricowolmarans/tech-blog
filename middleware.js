import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_RANK = { viewer: 0, editor: 1, admin: 2 };

// Route -> minimum role required
const ROUTE_MIN_ROLE = [
  { prefix: "/admin/users", role: "admin" },
  { prefix: "/admin/themes", role: "editor" },
  { prefix: "/admin/uploads", role: "editor" },
  { prefix: "/admin/posts", role: "viewer" }, // viewers can see, editors/admins get write buttons client-side
  { prefix: "/admin", role: "viewer" },
];

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const role = req.nextauth.token?.role || "viewer";

    const match = ROUTE_MIN_ROLE.find((r) => path.startsWith(r.prefix));
    if (match && ROLE_RANK[role] < ROLE_RANK[match.role]) {
      return NextResponse.redirect(new URL("/admin/posts", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
