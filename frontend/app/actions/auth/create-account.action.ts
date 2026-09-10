"use server";
import { validateData } from "@/src/lib/validation";
import { RegisterSchema, RegisterType } from "@/src/schemas/auth/RegisterSchema";

export type FormFields = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
};

type CreateAccountResult =
  | {
      success: false;
      errors: string[];
      fields: FormFields;
    }
  | { success: true; message: string; fields: FormFields };

export const createAccount = async (
  previousState: CreateAccountResult,
  formData: FormData,
): Promise<CreateAccountResult> => {
  //validation with valibot
  const result = await validateData<RegisterType>({
    valibotSchema: RegisterSchema,
    formData: formData,
  });

  const rawFields = Object.fromEntries(formData) as Record<string, string>;

  const fields: FormFields = {
    firstName: rawFields.firstName ?? "",
    lastName: rawFields.lastName ?? "",
    username: rawFields.username ?? "",
    email: rawFields.email ?? "",
  };

  if (!result.success) {
    return {
      success: false,
      errors: result.errors,
      fields: fields,
    };
  }

  try {
    //remove passwordConfirmation
    const { passwordConfirmation: _, ...userData } = result.object;
    const body = JSON.stringify(userData);
    const URL = `${process.env.API_URL}/auth/create-account`;
    const req = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const res = await req.json();

    if (req.ok) {
      return {
        success: true,
        fields,
        message: "Account created successfully"
      };
    } else {
      //validate error response
      let errorMessage = "Error creating your account.";
      if(typeof res.error === "string") errorMessage = res.error;
      return {
        success: false,
        errors: [errorMessage],
        fields: fields,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ["Unexpected error creating account. Try again"],
      fields: fields,
    };
  }
};
