import { cookies } from "next/headers";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_NAME = "COINLOG_ACCESS_TOKEN";
const REFRESH_TOKEN_NAME = "COINLOG_REFRESH_TOKEN";

// Shared cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Sets both access and refresh tokens in secure HttpOnly cookies.
 */
export async function setAuthCookies(tokens: Tokens): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_NAME, tokens.accessToken, {
    ...COOKIE_OPTIONS,
  });

  cookieStore.set(REFRESH_TOKEN_NAME, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
  });
}

/**
 * Clears authentication cookies (logout).
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_NAME);
  cookieStore.delete(REFRESH_TOKEN_NAME);
}

/**
 * Retrieves stored tokens from cookies.
 */
export async function getAuthTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_NAME)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_NAME)?.value,
  };
}