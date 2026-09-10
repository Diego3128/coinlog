"use server";

type ConfirmAccountResult =
  | { success: false; error: string }
  | { success: true; message: string };

export const confirmAccount = async (
  code: string,
): Promise<ConfirmAccountResult> => {
  try {
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(true);
    //   }, 5000);
    // });

    //remove passwordConfirmation
    const URL = `${process.env.API_URL}/auth/confirm-account`;
    const req = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const res = await req.json();
    // console.log(req);
    // console.log(res);
    if (req.ok) {
      return {
        success: true,
        message: "Account verified! You can now log in with your credentials",
      };
    } else {
      //validate error response
      let errorMessage = "Error verifing your account.";
      if (typeof res.error === "string") errorMessage = res.error;
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error verifing your account. Try again",
    };
  }
};
