"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Ingest",
    description: "Input daily routines, study habits, and financial logs into the central hub.",
  },
  {
    number: "02",
    title: "Analyze",
    description: "Our system calculates conformity scores across all behavioral matrices.",
  },
  {
    number: "03",
    title: "Detect",
    description: "Automatically flag behavioral anomalies and monetary risk factors.",
  },
  {
    number: "04",
    title: "Optimize",
    description: "Continuously improve operations as you refine your personal baselines.",
  },
]

export function ProcessSteps() {
  return (
    <section className="py-24 relative z-10 bg-canvas/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            How it works
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[52px] left-0 w-full h-0.5 bg-line z-0" />
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="hidden md:block absolute top-[52px] left-0 h-0.5 bg-gradient-to-r from-brand to-cyan-500 z-0"
          />

          <div className="grid md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.5 }}
                className="relative"
              >
                <div className="w-24 h-24 mx-auto md:mx-0 bg-surface border-4 border-canvas rounded-full shadow-xl flex items-center justify-center mb-6 relative z-10 group">
                  <div className="absolute inset-0 rounded-full bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-2xl font-bold text-brand">{step.number}</span>
                </div>
                
                <h3 className="text-xl font-bold text-ink mb-3 text-center md:text-left">{step.title}</h3>
                <p className="text-muted text-center md:text-left leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
