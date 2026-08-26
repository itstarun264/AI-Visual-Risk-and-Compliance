"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050B18]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute w-10 h-10 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin-reverse animate-pulse"></div>
      </div>
      <h2 className="mt-8 text-lg font-semibold tracking-wider text-cyan-400 uppercase animate-pulse">
        Initializing Intelligence Platform...
      </h2>
    </div>
  );
}
