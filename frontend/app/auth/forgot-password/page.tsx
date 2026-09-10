import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function Page() {
  // form to request a token to reset the password
  return (
    <div className="card  w-full">
      <div className="card-body">
        <h2 className="card-title text-xl font-semibold mb-2">Forgot Password</h2>

        <ForgotPasswordForm />

        {/* Divider */}
        <div className="divider text-xs text-base-content/50 my-4">OR</div>

        {/* Redirect to Login */}
        <p className="text-center text-sm text-base-content/70">
          Need a CoinLog account?{" "}
          <Link
            href="/auth/register"
            className="link link-primary font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
