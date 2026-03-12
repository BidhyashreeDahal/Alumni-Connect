import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", {
        email,
        password,
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6">

      {/* subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_45%)]"></div>
      <div className="relative min-h-screen overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_40%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-50/80 to-transparent" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 text-center">
          <img
            src="Images/logo.svg"
            alt="Alumni Connect"
            className="mx-auto h-16 w-auto"
          />

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Alumni Connect
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure platform connecting students, alumni, and faculty
          </p>
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <img
                  src="/Images/logo.svg"
                  alt="Alumni Connect"
                  className="mx-auto h-30 w-auto"
              />
            </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Sign in to your account
              </h2>
              <p className="text-sm text-slate-500">
                Use your university credentials
              </p>
              
            </div>
          </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.20)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Sign in
                  </h2>
                  <p className="text-sm text-slate-500">
                    Access your platform workspace
                  </p>
                </div>
              </div>

          {/* Form */}
          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <input
                  type="email"
                  placeholder="your-email@university.edu"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                        type="email"
                        placeholder="your-email@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm">
                <label className="font-medium text-slate-700">
                  Password
                </label>

                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

            {/* Remember */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300"/>
                Remember me
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
            >
              Sign in
            </button>
          </form>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Need access? Contact your administrator.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Alumni Connect • Authorized platform access only
        </p>

      </div>
    </div>
  )
              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Access is managed through invite-based onboarding.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Authorized platform access only
            </p>
          </div>
        </div>
      </div>
  );
}