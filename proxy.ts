import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // const token =
  //   req.cookies.get("__Secure-next-auth.session-token") ||
  //   req.cookies.get("next-auth.session-token");
  // if (token && (pathname.startsWith("/auth"))) {
  //   const originurl = req.nextUrl.origin;
  //   const redirectURL = new URL(`${originurl}`);
  //   return NextResponse.redirect(redirectURL);
  // }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api/auth|login|signup|_next|favicon.ico|.*\\.).*)"],
};

