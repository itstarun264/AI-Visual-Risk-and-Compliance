"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

function Counter({ from, to, duration = 2, suffix = "" }: { from: number, to: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(from)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null
      
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        
        // Easing function: easeOutExpo
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        
        setCount(Math.floor(easeOutExpo * (to - from) + from))
        
        if (progress < 1) {
          requestAnimationFrame(animateCount)
        }
      }
      
      requestAnimationFrame(animateCount)
    }
  }, [isInView, from, to, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function Statistics() {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="glass-panel rounded-3xl p-8 md:p-16 relative overflow-hidden bg-brand/5 dark:bg-brand/10 border-brand/20">
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-brand mb-2">
                <Counter from={0} to={10} suffix="K+" />
              </div>
              <div className="text-sm font-medium text-ink">Personal Events Logged</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-brand mb-2">
                <Counter from={0} to={99} suffix=".99%" />
              </div>
              <div className="text-sm font-medium text-ink">Action Compliance</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-brand mb-2">
                <Counter from={0} to={100} suffix="%" />
              </div>
              <div className="text-sm font-medium text-ink">Data Transparency</div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-brand mb-2">
                24/7
              </div>
              <div className="text-sm font-medium text-ink">Continuous Auditing</div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
