"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, AlertCircle, Save, User as UserIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

const profileSchema = zod.object({
  age: zod.number({ error: "Age must be a number" }).min(0, "Age cannot be negative").max(120, "Age must be realistic").optional(),
  risk_tolerance: zod.enum(["Low", "Medium", "High", "Critical"]),
  occupation: zod.string().max(255, "Occupation must be shorter").optional().or(zod.literal("")),
  compliance_policy: zod.enum(["Basic Compliance", "Standard Compliance", "Strict Compliance", "Enterprise Compliance"]),
  bio: zod.string().optional().or(zod.literal("")),
});

type ProfileForm = zod.infer<typeof profileSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      risk_tolerance: "Medium",
      compliance_policy: "Standard Compliance",
      age: 30,
      occupation: "",
      bio: "",
    }
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await axios.get(`${API_URL}/profile`);
        const data = res.data;
        if (data) {
          setValue("age", data.age ?? 30);
          setValue("risk_tolerance", data.risk_tolerance);
          setValue("occupation", data.occupation ?? "");
          setValue("compliance_policy", data.compliance_policy);
          setValue("bio", data.bio ?? "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await axios.put(`${API_URL}/profile`, data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile. Make sure the backend server is running.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-brand animate-pulse">Syncing User Matrix...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="relative glass-panel p-8 md:p-12 overflow-hidden bg-gradient-to-br from-pink-500/10 to-transparent border-none ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 text-xs font-bold uppercase tracking-widest mb-4">
              <UserIcon className="w-4 h-4" /> Operator Settings
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-2">User Profile</h1>
            <p className="text-muted text-lg max-w-xl">
              Manage risk tolerance parameters, compliance level settings, and behavioral identity.
            </p>
          </div>
        </div>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Profile Synced</h4>
            <p className="text-xs font-medium text-muted">Central risk profile calculations updated successfully.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Sync Failed</h4>
            <p className="text-xs font-medium text-muted">{error}</p>
          </div>
        </motion.div>
      )}

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)} 
        className="glass-panel p-8 space-y-8 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold text-ink">Parameters</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Age</label>
              <input
                type="number"
                placeholder="29"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.age.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Risk Tolerance Threshold</label>
              <select 
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("risk_tolerance")}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {errors.risk_tolerance && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.risk_tolerance.message}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold text-ink">Identity Attributes</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Occupation</label>
              <input
                type="text"
                placeholder="Senior Architect"
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("occupation")}
              />
              {errors.occupation && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.occupation.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Compliance Policy</label>
              <select 
                className="w-full h-11 pl-4 pr-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50"
                {...register("compliance_policy")}
              >
                <option value="Basic Compliance">Basic Compliance</option>
                <option value="Standard Compliance">Standard Compliance</option>
                <option value="Strict Compliance">Strict Compliance</option>
                <option value="Enterprise Compliance">Enterprise Compliance</option>
              </select>
              {errors.compliance_policy && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.compliance_policy.message}</p>}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">Bio / Profile Notes</label>
          <textarea
            rows={4}
            placeholder="Log any additional context, policy exclusions, or details..."
            className="w-full p-4 bg-canvas/50 border border-line rounded-xl text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all hover:border-brand/50 resize-none"
            {...register("bio")}
          />
          {errors.bio && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{errors.bio.message}</p>}
        </div>

        <div className="relative z-10 flex justify-end pt-4">
          <Button type="submit" disabled={saving} variant="glow" className="w-full md:w-auto px-8">
            {saving ? "Syncing Identity..." : "Save Identity Matrix"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
