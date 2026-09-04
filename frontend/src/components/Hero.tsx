"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, ShieldAlert } from "lucide-react"
import { Button } from "./ui/Button"
import { AnimatedText } from "./ui/AnimatedText"

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              PERSONAL RISK INTELLIGENCE
            </motion.div>

            <AnimatedText
              text="Master Your Habits. Control Your Finances. Audit Your Life."
              el="h1"
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-ink mb-6 leading-[1.1]"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              A unified command center for personal telemetry. Track study blocks, financial flux, habit consistency, and overall compliance to eliminate personal risk and optimize daily performance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2">
                Get Started
                <ArrowRight size={18} />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                <Play size={18} />
                Explore Platform
              </Button>
            </motion.div>
          </div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative hidden lg:block"
          >
            {/* 3D/Abstract Dashboard Mockup */}
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-white/20 bg-surface/50 backdrop-blur-xl flex items-center justify-center">
              
              {/* Floating Elements Animation inside Dashboard */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-[10%] right-[10%] w-48 p-4 rounded-xl bg-canvas border border-line shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                      <ShieldAlert size={16} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs text-muted">Risk Score</div>
                      <div className="text-sm font-bold text-ink">Low Risk</div>
                    </div>
                  </div>
                  <div className="status-dot green" />
                </div>
                <div className="h-2 w-full bg-line rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "25%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-[10%] left-[5%] w-56 p-4 rounded-xl bg-canvas border border-line shadow-2xl"
              >
                <div className="text-xs text-muted mb-2">Live Analytics</div>
                <div className="flex items-end gap-2 h-16">
                  {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: 1 + i * 0.1 }}
                      className="w-full bg-brand/80 rounded-t-sm"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Central Glowing Orb */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-64 h-64 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 blur-[60px] mix-blend-screen"
              />

              {/* Grid overlay */}
              <div 
                className="absolute inset-0 opacity-[0.2]"
                style={{
                  backgroundImage: `linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
