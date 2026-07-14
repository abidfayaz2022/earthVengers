import * as React from "react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { useGetMe, useLogout } from "@workspace/api-client-react"
import { Activity, Globe, Leaf, Medal, ShieldAlert, User, Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [location] = useLocation()
  const { data: user } = useGetMe()
  const logout = useLogout()
  const [isOpen, setIsOpen] = React.useState(false)

  const navItems = [
    { href: "/campaigns", label: "Campaigns", icon: Leaf },
    { href: "/crowdfunding", label: "Fund", icon: ShieldAlert },
    { href: "/leaderboard", label: "Ranks", icon: Medal },
  ]

  const closeNav = () => setIsOpen(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" onClick={closeNav} className="flex items-center gap-2 font-black text-2xl tracking-tighter text-foreground hover:text-primary transition-colors">
          <Globe className="w-8 h-8" />
          <span>earthVENGERS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 font-bold uppercase tracking-wider text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 hover:text-primary transition-colors",
                location === item.href && "text-primary border-b-2 border-primary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm font-bold font-mono">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {user.points} PTS
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/register">Join the Fight</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b-4 border-foreground shadow-[0_8px_0_0_rgba(0,0,0,1)] dark:shadow-[0_8px_0_0_rgba(255,255,255,1)]">
          <div className="flex flex-col p-4 gap-4 font-bold uppercase text-lg">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeNav}
                className="flex items-center gap-3 p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="h-0.5 bg-foreground w-full my-2" />
            {user ? (
              <Link
                href="/dashboard"
                onClick={closeNav}
                className="flex items-center justify-between p-2 bg-primary text-primary-foreground border-2 border-foreground"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  Dashboard
                </div>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeNav}
                  className="flex justify-center p-3 border-2 border-foreground hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeNav}
                  className="flex justify-center p-3 bg-primary text-primary-foreground border-2 border-foreground"
                >
                  Join the Fight
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}