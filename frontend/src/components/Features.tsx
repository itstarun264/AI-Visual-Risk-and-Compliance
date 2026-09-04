"use client"

import { motion } from "framer-motion"
import { 
  BookOpen, 
  CircleDollarSign, 
  CheckSquare, 
  ShieldCheck, 
  Activity, 
  Target 
} from "lucide-react"

const features = [
  {
    title: "Financial Ledger",
    description: "Track monthly income and expenses. Visualize financial flux to eliminate monetary risk.",
    icon: CircleDollarSign,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Study Blocks",
    description: "Log intensive study sessions and subject mastery. Monitor educational compliance.",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Habit Streaks",
    description: "Build operational discipline by logging daily routines and tracking consistency.",
    icon: CheckSquare,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "System Audits",
    description: "Centralized logging of every action. Stay accountable to your predefined risk parameters.",
    icon: ShieldCheck,
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "Live Telemetry",
    description: "View all your metrics instantly. React to drops in conformity scores in real-time.",
    icon: Activity,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Behavioral Radar",
    description: "Advanced charting combining all modules to assess your overall operational risk.",
    icon: Target,
    color: "from-orange-500 to-amber-500",
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  }

  return (
    <section id="features" className="py-24 relative z-10 bg-canvas/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            Everything you need to optimize yourself.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            A complete intelligence suite designed to monitor personal compliance and reduce behavioral risk.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-surface border border-line rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:border-brand/50 overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-ink mb-3 group-hover:text-brand transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
