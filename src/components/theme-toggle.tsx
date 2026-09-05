import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { LiquidGlass } from "./ui/liquid-glass"
import { cn } from "../lib/utils"

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && prefersDark())

  return (
    <LiquidGlass
      as="button"
      variant="control"
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center text-evolw-gray-700 dark:text-white/90",
        className
      )}
    >
      <span className="relative block h-[18px] w-[18px]">
        <Sun
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 ease-out",
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 ease-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
    </LiquidGlass>
  )
}
