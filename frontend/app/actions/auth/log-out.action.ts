"use server";

import { clearAuthCookies } from "@/src/lib/sessions";
import { redirect } from "next/navigation";

export const logOutAction = async()=> {
    //delete auth tokens in cookies
    await clearAuthCookies();
    redirect("/auth/login");
}