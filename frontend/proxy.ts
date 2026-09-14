// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * The purpose of this middleware (or proxy i guess?) is to simply check if the access token in the cookies is valid.
 * If the access token is invalid it will use the refresh token (also in the cookies) to regenerate both tokens again
 * If no tokens are present or they're invalid, user is redirected to the login
 */

export  async function proxy(request: NextRequest) {

    const accessToken = request.cookies.get("COINLOG_ACCESS_TOKEN")?.value;
    const refreshToken = request.cookies.get("COINLOG_REFRESH_TOKEN")?.value;

    // 1. Missing tokens -> Redirect to login immediately
    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 2. Validate access token against backend API
    const userReq = await fetch(`${process.env.API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: `${process.env.ORIGIN_URL}`,
      },
    });

    if (userReq.ok) {
      return NextResponse.next();
    }

    // 3. Access token invalid/expired -> Attempt refresh
    const refreshReq = await fetch(`${process.env.API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        Origin: `${process.env.ORIGIN_URL}`,
      },
    });

    if (refreshReq.ok) {
      const res = await refreshReq.json();
      const { accessToken: newAccess, refreshToken: newRefresh } = res.data ?? {};

      //get the response to update the cookies
      const response = NextResponse.next();

      if (newAccess && newRefresh) {
        // Updating the new value for the auth cookies 
        response.cookies.set("COINLOG_ACCESS_TOKEN", newAccess, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
        response.cookies.set("COINLOG_REFRESH_TOKEN", newRefresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      }

      return response;
    }

    // 4. Refresh token invalid/expired -> Clear cookies and redirect
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("COINLOG_ACCESS_TOKEN");
    response.cookies.delete("COINLOG_REFRESH_TOKEN");

    return response;
}

// Match all routes inside /admin
export const config = {
  matcher: ["/admin/:path*"],
};
