"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ScanEye, Lock, Mail, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const registerSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  confirm_password: zod.string().min(6, "Confirm password must match"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterForm = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    setApiError(null);
    try {
      await axios.post(`${API_URL}/auth/register`, data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError("Registration failed. Email might already be in use or backend is offline.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden border border-cyan-500/20">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-cyan-950 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-3">
            <ScanEye className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1 text-center font-medium">
            Join the AI Risk & Compliance Platform
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-200">{apiError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-emerald-200">
              Account created successfully! Redirecting to login...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Arjun Mehta"
                className="form-input w-full pl-10"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="email"
                placeholder="inspector@compliance.ai"
                className="form-input w-full pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input w-full pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input w-full pl-10"
                {...register("confirm_password")}
              />
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-400">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
