"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MessageSquare } from "lucide-react"
import { Button } from "./ui/Button"

export function FinalCTA() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-32 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand/20 bg-brand/5 backdrop-blur-3xl p-12 md:p-20 text-center shadow-2xl">
          
          {/* Animated Background Elements inside CTA */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand/20 via-violet-500/20 to-cyan-500/20 rounded-full blur-[100px] mix-blend-screen"
            />
            
            {/* Particles - Only render on client to avoid hydration mismatch */}
            {mounted && Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 1000 - 500, 
                  y: Math.random() * 500 - 250,
                  opacity: Math.random() * 0.5 + 0.1
                }}
                animate={{ 
                  y: [null, Math.random() * -200 - 100],
                  opacity: [null, 0]
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]"
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-extrabold text-ink mb-6 tracking-tight leading-[1.1]">
              Ready to eliminate <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-violet-500 to-cyan-400">personal risk?</span>
            </h2>
            
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Join the operators building disciplined futures on our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="glow" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-2">
                Deploy Dashboard
                <ArrowRight size={20} />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-2 bg-surface">
                <MessageSquare size={20} />
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
