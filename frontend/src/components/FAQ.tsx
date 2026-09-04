"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "What is Risk Intelligence?",
    answer: "It's a unified dashboard for personal telemetry. By tracking your finances, study hours, habits, and compliance logs in one place, you can identify behavioral anomalies before they become critical risks."
  },
  {
    question: "How do I log my data?",
    answer: "You manually log entries into the system via the interactive dashboards. Over time, the platform calculates a 'Conformity Score' based on your consistency against your predefined goals."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, this is a local-first deployment running on your machine. Your SQLite database is isolated, and no telemetry is sent to external servers."
  },
  {
    question: "What is a Conformity Score?",
    answer: "The Conformity Score measures how closely your actual behavior aligns with your stated goals (like study hours or budget limits). A score of 100% means perfect alignment."
  },
  {
    question: "Can I export my audits?",
    answer: "Yes, the system generates comprehensive audit logs covering every action, which you can export for deep personal review."
  },
  {
    question: "How does the Behavioral Radar work?",
    answer: "The Behavioral Radar chart aggregates your compliance across different life sectors (finance, study, habit) to give you an immediate visual representation of where you are excelling and where you are exposed to risk."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-line rounded-2xl bg-surface overflow-hidden transition-colors hover:border-brand/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-ink text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${openIndex === index ? 'bg-brand text-white' : 'bg-canvas text-muted'}`}
                >
                  <Plus size={18} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
