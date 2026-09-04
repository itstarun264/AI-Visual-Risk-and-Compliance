"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/Button"
import { ArrowRight, Lock, Zap } from "lucide-react"

export function FeatureShowcase() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Showcase 1 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <Zap size={14} />
              Lightning Fast
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-ink mb-6 leading-[1.1]">
              Process millions of data points instantly.
            </h2>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              Our advanced streaming architecture allows you to ingest, analyze, and act upon data without perceptible delay. Leave slow batch processing behind.
            </p>
            
            <ul className="space-y-4 mb-8">
              {['Sub-10ms processing latency', 'Distributed streaming architecture', 'Automatic scaling on demand'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-ink">
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            <Button variant="outline" className="gap-2">
              Learn about performance
              <ArrowRight size={16} />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
            
            {/* UI Mockup */}
            <div className="glass-panel p-2 rounded-2xl bg-surface/80 backdrop-blur-xl border border-line shadow-2xl relative overflow-hidden">
              <div className="bg-canvas border border-line rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-semibold text-ink">Stream Processing</h4>
                  <span className="text-xs font-mono bg-green-500/10 text-green-600 px-2 py-1 rounded">LIVE</span>
                </div>
                
                {/* Fake code / terminal output */}
                <div className="font-mono text-sm space-y-2 text-muted">
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-brand">{'>'}</span> Initializing worker nodes...
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="text-brand">{'>'}</span> Connecting to streams... <span className="text-green-500">OK</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-brand">{'>'}</span> Ingest rate: <span className="text-ink font-bold">14,204</span> events/sec
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-brand">{'>'}</span> Processing latency: <span className="text-ink font-bold">4.2ms</span>
                  </motion.div>
                </div>
                
                <div className="mt-6 h-32 flex items-end gap-1">
                  {mounted && Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "10%" }}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "mirror", 
                        duration: 0.5 + Math.random() * 0.5,
                        delay: i * 0.05
                      }}
                      className="w-full bg-brand/30 hover:bg-brand rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Showcase 2 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl -z-10 rounded-full" />
            
            {/* UI Mockup */}
            <div className="glass-panel p-6 rounded-2xl bg-surface/80 backdrop-blur-xl border border-line shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Lock className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-ink">Access Control</h4>
                  <p className="text-xs text-muted">Role-based permissions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { role: "Administrator", users: 4, access: "Full" },
                  { role: "Analyst", users: 24, access: "Read/Write" },
                  { role: "Viewer", users: 142, access: "Read Only" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center justify-between p-4 rounded-xl border border-line bg-canvas hover:border-brand/30 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-medium text-ink group-hover:text-brand transition-colors">{item.role}</div>
                      <div className="text-xs text-muted">{item.users} users</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface border border-line text-xs font-medium text-ink">
                      {item.access}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
              <Lock size={14} />
              Enterprise Security
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-ink mb-6 leading-[1.1]">
              Built for trust and compliance from day one.
            </h2>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              Protect your data with end-to-end encryption, granular role-based access control, and comprehensive audit logs that satisfy the most stringent compliance requirements.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-3xl font-bold text-ink mb-2">SOC 2</h4>
                <p className="text-sm text-muted">Type II Certified</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-ink mb-2">256-bit</h4>
                <p className="text-sm text-muted">AES Encryption</p>
              </div>
            </div>
            
            <Button variant="outline" className="gap-2">
              View Security Whitepaper
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
        
      </div>
    </section>
  )
}
