"use client";

export default function LoginForm() {
  return (
    <form className="space-y-4">

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
