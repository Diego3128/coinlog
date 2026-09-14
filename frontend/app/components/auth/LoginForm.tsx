"use client";

import { LoginUser } from "@/app/actions/auth/log-in.action";
import { SubmitEvent, useState } from "react";
import ErrorStack from "../shared/ErrorStack";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [loginForm, setLoginForm] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });

  const [errors, setErrors] = useState<string[]>([]);

  const router = useRouter();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    const formData = new FormData();
    formData.set("email", loginForm.email);
    formData.set("password", loginForm.password);

    const res = await LoginUser(formData);

    if (!res.success) {
      setErrors(res.errors);
    } else {
      //redirect
      router.replace("/admin");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && <ErrorStack errors={errors} />}

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
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm((prev) => ({ ...prev, email: e.target.value }))
          }
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
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        />
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary w-full text-white">
          Sign Up
        </button>
      </div>
    </form>
  );
}
