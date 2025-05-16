import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 shadow-sm hover:shadow-md transition-all duration-200",
        outline:
          "border-2 border-slate-700/20 bg-background hover:bg-slate-100 hover:text-slate-800 hover:border-slate-700/40 transition-all duration-200",
        secondary:
          "bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm hover:shadow-md transition-all duration-200",
        ghost: "hover:bg-slate-100 hover:text-slate-800 transition-all duration-200",
        link: "text-slate-700 underline-offset-4 hover:underline hover:text-slate-900 transition-colors duration-200",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 rounded-md px-4 py-2",
        lg: "h-11 rounded-md px-8 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
