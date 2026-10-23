import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useAppTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent/15 hover:text-accent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
