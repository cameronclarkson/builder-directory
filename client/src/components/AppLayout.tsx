import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Users, TrendingUp, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme, switchable } = useTheme();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Buyer Directory", href: "/directory", icon: Users },
    { label: "Deal Pipeline", href: "/deals", icon: TrendingUp },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden md:flex md:flex-col w-64 bg-card border-r border-border
          h-screen flex-shrink-0
        `}
        aria-label="Main navigation"
      >
        {/* Logo/Branding */}
        <div className="px-6 py-6 border-b border-border">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CC</span>
              </div>
              <span className="font-bold text-lg text-foreground">Clarkson Capital</span>
            </a>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      active
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            Clarkson Capital
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card shadow-lg z-30 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Main navigation"
      >
        {/* Navigation Items */}
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      active
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Container */}
      <div className="flex flex-col flex-1 w-full md:w-auto overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 w-full">
            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Page Title - Mobile */}
            <div className="md:hidden flex-1 text-center px-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">Builder Directory</h1>
            </div>

            {/* Spacer for desktop */}
            <div className="hidden md:block flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {switchable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
