import { confirmAccount } from "@/app/actions/auth/confirm-account.action";
import { TokenSchema } from "@/src/schemas/auth/TokenSchema";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeParse } from "valibot";

export const metadata: Metadata = {
  title: "Confirm Account",
};

interface Props {
  searchParams: Promise<{ t: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { t = "" } = await searchParams;

  const isValidToken = safeParse(TokenSchema, t);

  if (!isValidToken.success) {
    redirect("/auth/register");
  }

  const verificationResult = await confirmAccount(t);

  return (
    <div className="card  w-full">
      <div className="card-body">
        <h2 className="card-title text-xl font-semibold mb-2">
          Confirm Account
        </h2>

        <div className="rounded-lg overflow-hidden my-10 text-center font-medium">
          {verificationResult.success ? (
            <Link href="/auth/login" className="p-2 bg-success block underline">
              {verificationResult.message}
            </Link>
          ) : (
            <p className="p-2 bg-error text-error-content">
              {verificationResult.error}
            </p>
          )}
        </div>

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
