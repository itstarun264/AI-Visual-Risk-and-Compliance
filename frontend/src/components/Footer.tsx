"use client"

import Link from "next/link"
import { Activity, Globe, MessageSquare, Mail, MessageCircle } from "lucide-react"

const footerLinks = {
  Product: [
    { name: "Features", href: "#" },
    { name: "Solutions", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Integrations", href: "#" },
    { name: "Changelog", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Partners", href: "#" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Community", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Status", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-line pt-20 pb-10 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white transform group-hover:scale-105 transition-transform">
                <Activity size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-ink">Intelligence</span>
            </Link>
            
            <p className="text-muted text-sm mb-8 pr-12 leading-relaxed">
              Powering the next generation of software with advanced intelligence monitoring, risk scoring, and real-time analytics.
            </p>
            
            <div className="flex gap-4">
              {[Globe, MessageSquare, Mail, MessageCircle].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/5 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-ink mb-6">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-muted text-sm hover:text-brand transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
        </div>

        <div className="border-t border-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} Intelligence Platform Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
