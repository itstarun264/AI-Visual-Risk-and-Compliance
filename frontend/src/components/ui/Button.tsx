import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-brand text-white hover:bg-brand/90 hover:shadow-lg hover:scale-[1.02]",
      outline: "border border-line bg-surface hover:bg-canvas text-ink",
      ghost: "hover:bg-canvas text-ink",
      glow: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-[1.02] border border-white/10"
    }
    
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-14 rounded-xl px-8 text-base",
      icon: "h-11 w-11",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
