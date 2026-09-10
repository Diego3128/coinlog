"use client";

import { createAccount } from "@/app/actions/auth/create-account.action";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { toast, ToastOptions } from "react-toastify";
import ErrorStack from "../shared/ErrorStack";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(createAccount, {
    errors: [],
    success: false,
    fields: {
      email: "",
      firstName: "",
      lastName: "",
      username: "",
    },
  });

  const [checkTerms, setCheckTerms] = useState<boolean>(false);

  const showSuccessNotification = useCallback((text: string, options: ToastOptions) => {
    toast.info(text, options);
  }, []);

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.success) {
      showSuccessNotification(state.message, {});
      showSuccessNotification("Check your email to finish your account verification.", {autoClose: false});
    }
  }, [state]);

  return (
    <form
      action={ formAction}
      className="space-y-4 @container"
      noValidate
      ref={formRef}
    >
      {!state.success && <ErrorStack errors={state.errors} />}
      {/* 2 Column Grid for Inputs */}
      <div className="grid grid-cols-1 @xs:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">First Name</span>
          </label>
          <input
            type="text"
            placeholder="John"
            className="input input-bordered w-full focus:input-primary"
            required
            name="firstName"
            defaultValue={state?.fields?.firstName}
          />
        </div>

        {/* Last Name */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Last Name</span>
          </label>
          <input
            type="text"
            placeholder="Doe"
            className="input input-bordered w-full focus:input-primary"
            required
            name="lastName"
            defaultValue={state?.fields?.lastName}
          />
        </div>

        {/* Username */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Username</span>
          </label>
          <input
            type="text"
            placeholder="johndoe"
            className="input input-bordered w-full focus:input-primary"
            required
            name="username"
            defaultValue={state?.fields?.username}
          />
        </div>

        {/* Email */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Email Address</span>
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            className="input input-bordered w-full focus:input-primary"
            required
            name="email"
            defaultValue={state?.fields?.email}
          />
        </div>

        {/* Password */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full focus:input-primary"
            required
            name="password"
          />
        </div>

        {/* Confirm Password */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Confirm Password</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full focus:input-primary"
            required
            name="passwordConfirmation"
          />
        </div>
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            required
            checked={checkTerms}
            onChange={(e) => {
              setCheckTerms(e.target.checked);
            }}
          />
          <span className="label-text text-xs">
            I agree to the{" "}
            <a href="#" className="link link-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="link link-primary">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button
          disabled={isPending || state.success || !checkTerms}
          type="submit"
          className="btn btn-primary w-full text-white"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}
