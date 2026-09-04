"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "./ui/Button"

const plans = [
  {
    name: "Starter",
    description: "For individuals and small teams.",
    price: { monthly: 49, yearly: 39 },
    features: ["10,000 requests/mo", "Standard Analytics", "Community Support", "API Access"],
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing teams needing scale.",
    price: { monthly: 149, yearly: 119 },
    features: ["100,000 requests/mo", "Advanced Analytics", "Priority Support", "Custom Webhooks", "Team Collaboration"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with custom needs.",
    price: { monthly: "Custom", yearly: "Custom" },
    features: ["Unlimited requests", "Real-time Processing", "24/7 Dedicated Support", "Custom Integrations", "SLA Guarantee", "On-premise option"],
    highlighted: false,
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-24 relative z-10 bg-canvas/30">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            Simple, transparent pricing.
          </motion.h2>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-ink' : 'text-muted'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 rounded-full bg-line relative flex items-center px-1"
            >
              <motion.div
                animate={{ x: isYearly ? 28 : 0 }}
                className="w-5 h-5 rounded-full bg-brand shadow-md"
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-ink' : 'text-muted'}`}>
              Yearly <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-full text-xs ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted 
                  ? 'bg-surface border-2 border-brand shadow-2xl shadow-brand/20 z-10' 
                  : 'bg-canvas border border-line shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  RECOMMENDED
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-ink mb-2">{plan.name}</h3>
              <p className="text-muted text-sm mb-6 h-10">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-ink">
                  {typeof plan.price.monthly === 'number' ? '$' : ''}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? "yearly" : "monthly"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {isYearly ? plan.price.yearly : plan.price.monthly}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {typeof plan.price.monthly === 'number' && (
                  <span className="text-muted font-medium">/mo</span>
                )}
              </div>
              
              <Button 
                variant={plan.highlighted ? "glow" : "outline"} 
                className="w-full mb-8"
              >
                {plan.price.monthly === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </Button>
              
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-brand shrink-0 mt-0.5" size={18} />
                    <span className="text-ink text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
