import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: "Register"
}

export default function Page() {

  return (
      <div className="card w-full">
        <div className="card-body">
          {/* Header */}
          <h2 className="card-title text-xl font-semibold mb-2">
            Create an account
          </h2>

          <RegisterForm  />

          {/* Divider */}
          <div className="divider text-xs text-base-content/50 my-4">OR</div>

          {/* Redirect to Login */}
          <p className="text-center text-sm text-base-content/70">
            Already have a CoinLog account?{" "}
            <Link href="/auth/login" className="link link-primary font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
  );
}
