"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuth } from "@/context/AuthContext";
import { Activity, Lock, Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-canvas">
      
      {/* Background Animated Blobs */}
      <motion.div
        animate={{ x: [-50, 50, -50], y: [-20, 30, -20] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[20%] w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [50, -50, 50], y: [30, -20, 30] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] right-[20%] w-[30rem] h-[30rem] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] px-6 z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-2 group mb-8">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-xl shadow-brand/20">
            <Activity size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-ink">Intelligence</span>
        </Link>

        <div className="glass-panel p-8 sm:p-10 border border-line/50 rounded-3xl shadow-2xl bg-surface/80 backdrop-blur-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">Welcome back</h2>
            <p className="text-muted text-sm">Sign in to your account to continue</p>
          </div>

          {apiError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full h-11 pl-10 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink">Password</label>
                <Link href="#" className="text-xs font-medium text-brand hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              variant="glow"
              className="w-full mt-2 h-12 text-[15px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}