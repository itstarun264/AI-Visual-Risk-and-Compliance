"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Alex V.",
    role: "Software Engineer",
    content: "This platform completely transformed my daily discipline. Tracking my study hours alongside my financial health exposed patterns I never realized I had.",
    rating: 5,
  },
  {
    name: "Dr. Marcus Chen",
    role: "Research Scientist",
    content: "An absolute game-changer. The interface is stunning and having a centralized audit log for my habits keeps my compliance strictly in check.",
    rating: 5,
  },
  {
    name: "Elena R.",
    role: "Medical Student",
    content: "I evaluated dozens of productivity apps before settling here. The real-time behavioral radar capabilities are unmatched. I finally feel in control.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            Don't just take our word for it.
          </motion.h2>
        </div>

        <div className="flex overflow-x-auto pb-12 -mx-6 px-6 gap-6 snap-x hide-scrollbar">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[320px] md:min-w-[400px] snap-center glass-panel p-8 rounded-3xl"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-lg text-ink mb-8 leading-relaxed font-medium">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand/20 to-violet-500/20 border border-brand/10" />
                <div>
                  <div className="font-bold text-ink">{testimonial.name}</div>
                  <div className="text-sm text-muted">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
