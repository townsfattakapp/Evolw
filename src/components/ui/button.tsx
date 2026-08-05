import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolw-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-evolw-black text-white hover:bg-evolw-gray-800 hover:shadow-lg dark:bg-white dark:text-evolw-black dark:hover:bg-evolw-gray-200": variant === "default",
            "bg-evolw-accent text-white hover:bg-evolw-accent-dark hover:shadow-lg hover:shadow-evolw-accent/20": variant === "accent",
            "border border-evolw-gray-200 bg-transparent hover:bg-evolw-gray-50 dark:border-evolw-gray-800 dark:hover:bg-evolw-gray-900": variant === "outline",
            "hover:bg-evolw-gray-100 hover:text-evolw-black dark:hover:bg-evolw-gray-800 dark:hover:text-white": variant === "ghost",
            "text-evolw-accent underline-offset-4 hover:underline": variant === "link",
            "h-11 px-6 py-2": size === "default",
            "h-9 px-4 text-xs": size === "sm",
            "h-14 px-10 text-base": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
