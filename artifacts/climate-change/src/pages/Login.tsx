import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flame, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  email: z.string().min(1, "Email required"),
  password: z.string().min(1, "Password required"),
})

export default function Login() {
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const login = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        setLocation("/dashboard")
      },
      onError: (error) => {
        toast({
          title: "Access Denied",
          description: error.error || "Invalid credentials",
          variant: "destructive"
        })
      }
    }
  })

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground text-background p-4 relative overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5z%22 fill=%22%23ffffff%22 fill-opacity=%221%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E')" }}></div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="mb-10 text-center">
          <div className="inline-flex justify-center items-center w-20 h-20 bg-background text-foreground border-4 border-background mb-6">
            <Flame className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Identify</h1>
          <p className="font-mono text-muted-foreground uppercase text-sm">Enter operative credentials</p>
        </div>

        <form 
          onSubmit={form.handleSubmit((d) => login.mutate({ data: d }))} 
          className="bg-card p-8 border-4 border-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-foreground flex flex-col gap-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
            <Input 
              {...form.register("email")} 
              className="h-14 font-mono text-lg border-2 border-foreground rounded-none bg-background focus-visible:ring-0 focus-visible:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="agent@earth.org"
            />
            {form.formState.errors.email && (
              <p className="text-destructive font-bold text-sm uppercase">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</label>
            <Input 
              type="password"
              {...form.register("password")} 
              className="h-14 font-mono text-lg border-2 border-foreground rounded-none bg-background focus-visible:ring-0 focus-visible:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={login.isPending}
            className="w-full h-16 mt-4 text-xl tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            {login.isPending ? "Authenticating..." : "Login"} <ArrowRight className="ml-2 w-6 h-6" />
          </Button>

          <div className="text-center mt-4 border-t-2 border-dashed border-muted-foreground/30 pt-6">
            <span className="font-mono text-sm text-muted-foreground mr-2">New recruit?</span>
            <Link href="/register" className="font-black uppercase text-primary hover:underline underline-offset-4">
              Enlist Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}