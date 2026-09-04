"use client"

import { motion } from "framer-motion"

const companies = [
  { name: "Acme Corp", logo: "ACME" },
  { name: "GlobalTech", logo: "GLOBAL" },
  { name: "Nexus", logo: "NEXUS" },
  { name: "Quantum", logo: "QUANTUM" },
  { name: "Horizon", logo: "HORIZON" },
  { name: "Apex", logo: "APEX" },
]

export function TrustLogos() {
  return (
    <section className="py-12 border-y border-line/50 bg-canvas/30 backdrop-blur-sm relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold text-muted mb-8 uppercase tracking-widest"
        >
          Trusted by innovative teams
        </motion.p>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            >
              {/* Replace with actual SVG logos in production */}
              <span className="font-bold text-xl md:text-2xl text-ink/40 group-hover:text-ink transition-colors tracking-tighter">
                {company.logo}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
