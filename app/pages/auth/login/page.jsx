"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { FiArrowRight, FiMail, FiLock } from "react-icons/fi";
import Navbar from "@/app/components/navbar/page";
import PageHero from "@/app/components/ui/PageHero";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function validate() {
        const nextErrors = {};
        if (!form.email.trim()) {
            nextErrors.email = "Enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = "Enter a valid email";
        }
        if (!form.password.trim()) {
            nextErrors.password = "Enter your password";
        }
        return nextErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const data = await res.json();

            if (!res.ok || !data?.success) {
                const message = data?.message || "Login failed. Please try again.";
                setErrors({ form: message });
                toast.error(message);
                return;
            }

            if (data?.token) {
                Cookies.set("flp_token", data.token, { expires: 7, sameSite: "lax" });
                localStorage.setItem("flp_token", data.token);
            }

            toast.success(data?.message || "Logged in successfully.");
            setForm({ email: "", password: "" });

            const isStaff = ["admin", "superadmin", "teacher"].includes(data?.user?.role);
            let dest = isStaff ? "/pages/dashboard/admin" : "/";
            if (typeof window !== "undefined") {
                const param = new URLSearchParams(window.location.search).get("redirect");
                if (param && param.startsWith("/")) dest = param;
            }
            router.push(dest);
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
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                                </span>
                                Login to GHL Learning
                            </span>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                                Welcome back — আবার স্বাগত।
                            </h1>
                            <p className="mt-3 text-base leading-6 text-text-muted">
                                Email আর password দিয়ে login করুন — courses, profile আর dashboard access করতে।
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-elevated sm:p-10">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
                            <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl dark:bg-accent/20" />

                            <form className="relative space-y-5" onSubmit={handleSubmit} noValidate>
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
                                            placeholder="you@example.com"
                                            aria-invalid={!!errors.email}
                                            autoComplete="email"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-2 text-sm text-danger">{errors.email}</p>}
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-text">Password</span>
                                    <div className="relative mt-2">
                                        <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle" />
                                        <input
                                            name="password"
                                            type="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-border bg-surface px-11 py-3 text-base text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            placeholder="••••••••"
                                            aria-invalid={!!errors.password}
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    {errors.password && <p className="mt-2 text-sm text-danger">{errors.password}</p>}
                                </label>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {submitting ? "Logging in..." : "Login"}
                                    {!submitting && (
                                        <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    )}
                                </button>
                            </form>

                            {errors.form ? (
                                <div className="relative mt-6 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
                                    {errors.form}
                                </div>
                            ) : (
                                <div className="relative mt-6 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-center text-sm text-text-muted">
                                    Need an account?{' '}
                                    <Link
                                        href="/pages/auth/signup"
                                        className="cursor-pointer font-semibold text-primary transition-colors hover:text-primary-hover"
                                    >
                                        Create one
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
