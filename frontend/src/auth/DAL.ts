import "server-only";

import { parseAsync } from "valibot";
import { UserSchema, UserType } from "../schemas/auth/UserSchema";
import { getAuthTokens } from "../lib/sessions";
import { cache } from "react";

export const getUserObject = cache(async (): Promise<null | UserType> => {
  try {
    const { accessToken = "" } = await getAuthTokens();

    //validate access_token
    const URL = `${process.env.API_URL}/user`;
    const req = await fetch(URL, {
      headers: {
        Origin: `${process.env.ORIGIN_URL}`,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    //if access_token is expired or invalid, generate a new one with the refresh_token
    const res = await req.json();
    if (req.status !== 200 || !req.ok) {
      return null;
    }
    const userObject: UserType = await parseAsync(UserSchema, res.data);
    return userObject;
  } catch (e) {
    return null;
  }
});

// export const generateAccessToken = async ({
//   refreshToken,
// }: {
//   refreshToken: string;
// }): Promise<null | { accessToken: string; refreshToken: string }> => {
//   try {
//     //regenerate access token
//     const URL = `${process.env.API_URL}/auth/refresh-token`;
//     const req = await fetch(URL, {
//       method: "POST",
//       headers: {
//         Origin: `${process.env.ORIGIN_URL}`,
//         Authorization: `Bearer ${refreshToken}`,
//       },
//     });
//     //if access_token is expired or invalid, generate a new one with the refresh_token
//     const res = await req.json();
//     if (req.status !== 200 || !req.ok) {
//       return null;
//     }
//     const { accessToken = "", refreshToken: rToken = "" } = res.data ?? {};
//     if (typeof accessToken !== "string" || typeof rToken !== "string") {
//       return null;
//     }

//     return {
//       accessToken: accessToken,
//       refreshToken: rToken,
//     };
//   } catch (e) {
//     return null;
//   }
// };

// export const verifySession = async (): Promise<null | UserType> => {
//   console.log("verify session");

//   //get access_token & refresh_token in the cookies
//   const { accessToken = "", refreshToken = "" } = await getAuthTokens();

//   if (!accessToken || !refreshToken) {
//     redirect("/auth/login");
//   }

//   //validate access_token
//   const user = await getUserObject({ accessToken });
//   console.log({ user });
//   if (!user) {
//     console.log("generate new access token");
//     //if user = null, access_token is expired or invalid, generate a new one with the refresh_token
//     const newTokens = await generateAccessToken({ refreshToken });
//     console.log({ newTokens });
//     if (!newTokens) {
//       //if refresh_token is also expired or invalid, redirect. (outside-try-catch)
//     //   await clearAuthCookies();
//       return null;
//     } else {
//       //update cookies
//     //   await setAuthCookies(newTokens);
//       //use NEW access token to get the user
//       const user = await getUserObject({ accessToken: newTokens.accessToken });
//       console.log({ user });
//       return user;
//     }
//   }
//   {
//     return user;
//   }
// };
