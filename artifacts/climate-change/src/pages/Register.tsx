import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(2, "Codename required"),
  email: z.string().min(1, "Email required"),
  password: z.string().min(6, "Must be 6+ chars"),
})

export default function Register() {
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const register = useRegister({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        setLocation("/dashboard")
      },
      onError: (error) => {
        toast({
          title: "Enlistment Failed",
          description: error.data?.error || "Unknown error",
          variant: "destructive"
        })
      }
    }
  })

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-primary-foreground p-4 relative overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="mb-10 text-center">
          <div className="inline-flex justify-center items-center w-20 h-20 bg-background text-foreground border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Globe className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Enlist</h1>
          <p className="font-mono text-primary-foreground/80 uppercase text-sm font-bold bg-foreground text-background inline-block px-3 py-1">Join the resistance</p>
        </div>

        <form 
          onSubmit={form.handleSubmit((d) => register.mutate({ data: d }))} 
          className="bg-background p-8 border-4 border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-foreground flex flex-col gap-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Operative Name</label>
            <Input 
              {...form.register("name")} 
              className="h-14 font-mono text-lg border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="e.g. EcoWarrior99"
            />
            {form.formState.errors.name && (
              <p className="text-destructive font-bold text-sm uppercase">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Base</label>
            <Input 
              {...form.register("email")} 
              className="h-14 font-mono text-lg border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="agent@earth.org"
            />
            {form.formState.errors.email && (
              <p className="text-destructive font-bold text-sm uppercase">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Passcode (6+ chars)</label>
            <Input 
              type="password"
              {...form.register("password")} 
              className="h-14 font-mono text-lg border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="text-destructive font-bold text-sm uppercase">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            variant="default"
            disabled={register.isPending}
            className="w-full h-16 mt-4 text-xl tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-solar text-foreground hover:bg-solar/80 border-foreground"
          >
            {register.isPending ? "Connecting..." : "Commit"} <ArrowRight className="ml-2 w-6 h-6" />
          </Button>

          <div className="text-center mt-4 border-t-2 border-dashed border-muted-foreground/30 pt-6">
            <span className="font-mono text-sm text-muted-foreground mr-2">Already active?</span>
            <Link href="/login" className="font-black uppercase text-primary hover:underline underline-offset-4">
              Identify Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
