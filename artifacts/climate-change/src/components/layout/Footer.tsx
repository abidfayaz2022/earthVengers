import { Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-4 border-foreground bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-black text-xl uppercase tracking-tighter">
          <Globe className="w-6 h-6" />
          <span>earthVENGERS</span>
        </div>
        <div className="flex gap-8 text-sm font-bold uppercase">
          <a href="#" className="hover:text-primary underline-offset-4 hover:underline">Manifesto</a>
          <a href="#" className="hover:text-primary underline-offset-4 hover:underline">Privacy</a>
          <a href="#" className="hover:text-primary underline-offset-4 hover:underline">Terms</a>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          © {new Date().getFullYear()} Not a charity. A movement.
        </div>
      </div>
    </footer>
  )
}