"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navbar/page";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!/^[+0-9\s()-]{7,20}$/.test(form.phone || "")) errs.phone = "Enter a valid phone number";
    if (form.password.length < 8) errs.password = "Password must be ≥ 8 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        const message = data?.message || "Signup failed. Please try again.";
        setErrors({ form: message });
        toast.error(message);
        return;
      }

      // Persist the JWT as a cookie so the user stays verified across visits
      if (data?.token) {
        Cookies.set("flp_token", data.token, { expires: 7, sameSite: "lax" });
        localStorage.setItem("flp_token", data.token);
      }

      toast.success(data?.message || "Account created successfully.");
      setSuccess(data?.message || "Account created successfully.");
      setForm({ name: "", email: "", phone: "", password: "" });

      // Send the user home; the navbar reads the cookie on mount
      router.push("/");
      router.refresh();
    } catch {
      const message = "Network error. Please try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 flex items-center justify-center px-4 pt-20">
      <Navbar />
      <div className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-white/10 bg-slate-950/85 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-r from-blue-600/30 via-purple-500/20 to-cyan-400/20 blur-3xl" />
        <div className="relative p-8 sm:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/20">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Create your account
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create your account</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Join us — it only takes a minute.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Phone</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="+8801XXXXXXXXX"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
            </label>

            <div className="grid gap-4 sm:grid-cols-1">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Password</span>
                <div className="relative mt-3">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 pr-12 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/3 text-slate-100 hover:bg-white/6 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10 0-1.03.158-2.02.45-2.94M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-3xl bg-linear-to-r from-blue-600 to-purple-600 px-5 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>

          {errors.form && (
            <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errors.form}</div>
          )}

          {success ? (
            <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Already have an account? <Link href="/pages/auth/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Log in</Link></div>
          )}
        </div>
      </div>
    </div>
  );
}
