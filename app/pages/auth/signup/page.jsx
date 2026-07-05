"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import Navbar from "@/app/components/navbar/page";
import PageHero from "@/app/components/ui/PageHero";

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

      if (data?.token) {
        Cookies.set("flp_token", data.token, { expires: 7, sameSite: "lax" });
        localStorage.setItem("flp_token", data.token);
      }

      toast.success(data?.message || "Account created successfully.");
      setSuccess(data?.message || "Account created successfully.");
      setForm({ name: "", email: "", phone: "", password: "" });

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
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <PageHero variant="minimal" parallax={false}>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Create your account
              </span>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Start learning today — এক মিনিটেই।
              </h1>
              <p className="mt-3 text-base leading-6 text-text-muted">
                12,400+ Bangladeshi learners এর সাথে যোগ দিন — first lesson free।
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-elevated sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl dark:bg-accent/20" />

              <form className="relative space-y-5" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="text-sm font-medium text-text">Full name</span>
                  <div className="relative mt-2">
                    <FiUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-surface px-11 py-3 text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="Jane Doe"
                      aria-invalid={!!errors.name}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-danger">{errors.name}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text">Email</span>
                  <div className="relative mt-2">
                    <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-surface px-11 py-3 text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="you@company.com"
                      aria-invalid={!!errors.email}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-danger">{errors.email}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text">Phone</span>
                  <div className="relative mt-2">
                    <FiPhone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-surface px-11 py-3 text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="+8801XXXXXXXXX"
                      aria-invalid={!!errors.phone}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-sm text-danger">{errors.phone}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text">Password</span>
                  <div className="relative mt-2">
                    <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-surface px-11 py-3 pr-12 text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="Minimum 8 characters"
                      aria-invalid={!!errors.password}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-muted transition-colors hover:bg-surface hover:text-text"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-danger">{errors.password}</p>}
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Creating..." : "Create account"}
                  {!submitting && (
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {errors.form && (
                <div className="relative mt-6 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {errors.form}
                </div>
              )}

              {success ? (
                <div className="relative mt-6 rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                  {success}
                </div>
              ) : (
                <div className="relative mt-6 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-center text-sm text-text-muted">
                  Already have an account?{' '}
                  <Link
                    href="/pages/auth/login"
                    className="cursor-pointer font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageHero>
    </div>
  );
}
