"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navbar/page";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");

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
        setSuccess("");
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }

        setSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 900));
            setSuccess("Successfully signed in. Welcome back!");
            setForm({ email: "", password: "" });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#020205] text-slate-100 flex items-center justify-center px-4 py-10">
            <Navbar />
            <div className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-white/10 bg-slate-950/85 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-r from-blue-600/30 via-purple-500/20 to-cyan-400/20 blur-3xl" />
                <div className="relative p-8 sm:p-10">
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-200/20">
                            <span className="h-2 w-2 rounded-full bg-blue-400" />
                            Login to FLP
                        </span>
                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Welcome back.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                            Enter your email and password to access your courses, profile, and learning dashboard.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-300">Email</span>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="mt-3 w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="you@example.com"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-300">Password</span>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                className="mt-3 w-full rounded-3xl border border-slate-700/90 bg-slate-900/90 px-4 py-3 text-base text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="••••••••"
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
                        </label>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center rounded-3xl bg-linear-to-r from-blue-600 to-purple-600 px-5 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {success ? (
                        <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            {success}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            Need an account? <Link href="/pages/auth/signup" className="font-semibold text-cyan-300 hover:text-cyan-200">Create one</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
