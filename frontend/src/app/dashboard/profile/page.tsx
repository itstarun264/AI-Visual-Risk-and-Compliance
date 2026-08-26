"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { RefreshCw, CheckCircle, AlertCircle, Save } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Fetching Profiling Settings...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">User Risk Profile & Behavioral Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage user attributes, risk tolerance levels, and compliance preferences.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-200">
            Profile saved successfully. Central risk profile calculations synced.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm text-red-200">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-6 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Age
              </label>
              <input
                type="number"
                placeholder="29"
                className="form-input w-full"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="mt-1 text-xs text-red-400">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Risk Tolerance Threshold
              </label>
              <select className="form-input w-full bg-slate-950" {...register("risk_tolerance")}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {errors.risk_tolerance && (
                <p className="mt-1 text-xs text-red-400">{errors.risk_tolerance.message}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Occupation / Student Description
              </label>
              <input
                type="text"
                placeholder="Senior HSE Inspector"
                className="form-input w-full"
                {...register("occupation")}
              />
              {errors.occupation && (
                <p className="mt-1 text-xs text-red-400">{errors.occupation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Compliance Policy Level
              </label>
              <select className="form-input w-full bg-slate-950" {...register("compliance_policy")}>
                <option value="Basic Compliance">Basic Compliance</option>
                <option value="Standard Compliance">Standard Compliance</option>
                <option value="Strict Compliance">Strict Compliance</option>
                <option value="Enterprise Compliance">Enterprise Compliance</option>
              </select>
              {errors.compliance_policy && (
                <p className="mt-1 text-xs text-red-400">{errors.compliance_policy.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Full Width */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Bio / Profile Notes
          </label>
          <textarea
            rows={4}
            placeholder="Log any additional context, policy exclusions, or details about the supervisor profile..."
            className="form-input w-full resize-none"
            {...register("bio")}
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
