"use server";

import { setAuthCookies } from "@/src/lib/sessions";
import { validateData } from "@/src/lib/validation";
import { LoginSchema, LoginType } from "@/src/schemas/auth/LoginSchema";

type LoginResult =
  | { success: false; errors: string[] }
  | {
      success: true;
    };

export const LoginUser = async (formData: FormData): Promise<LoginResult> => {
  try {
    //validate email & password
    const result = await validateData<LoginType>({
      formData,
      valibotSchema: LoginSchema,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    const URL = `${process.env.API_URL}/auth/login`;
    const req = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: `${process.env.ORIGIN_URL ?? ""}`,
      },
      body: JSON.stringify({
        email: result.object.email,
        password: result.object.password,
      }),
    });
    const res = await req.json();
    if (req.ok) {
      const tokens = {
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };

      if (
        typeof tokens.accessToken !== "string" ||
        typeof tokens.refreshToken !== "string"
      ) {
        throw new Error("Missing tokens");
      }

      await setAuthCookies(tokens);
      return {
        success: true,
      };
    } else {
      //validate error response
      let errorMessage = "Something went wront trying to log you in";
      if (typeof res.error === "string") errorMessage = res.error;
      return {
        success: false,
        errors: [errorMessage],
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ["Unexpected error while logging into your account. Try again"],
    };
  }
};
