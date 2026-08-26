"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuth } from "@/context/AuthContext";
import { ScanEye, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

const loginSchema = zod.object({
  email: zod.string().email("Enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, data);
      await login(res.data.access_token);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError("Authentication failed. Please verify credentials or server status.");
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
          <h2 className="text-2xl font-bold tracking-tight text-white font-manrope">Operator Sign In</h2>
          <p className="text-sm text-slate-400 mt-1 text-center font-medium">
            AI Risk & Compliance Intelligence Platform
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-200">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Need an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}