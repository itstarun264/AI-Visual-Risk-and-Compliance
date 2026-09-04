import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/Hero"
import { TrustLogos } from "@/components/TrustLogos"
import { Features } from "@/components/Features"
import { FeatureShowcase } from "@/components/FeatureShowcase"
import { InteractiveDashboard } from "@/components/InteractiveDashboard"
import { Statistics } from "@/components/Statistics"
import { ProcessSteps } from "@/components/ProcessSteps"
import { Testimonials } from "@/components/Testimonials"
import { FAQ } from "@/components/FAQ"
import { FinalCTA } from "@/components/FinalCTA"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      <Hero />
      <TrustLogos />
      <Features />
      <FeatureShowcase />
      <InteractiveDashboard />
      <Statistics />
      <ProcessSteps />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
