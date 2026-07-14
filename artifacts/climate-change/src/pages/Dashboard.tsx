import { useGetMe, useListMyEnrollments, useCompleteEnrollment, useUnenrollFromCampaign, getListMyEnrollmentsQueryKey, getGetMeQueryKey, getGetLeaderboardQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, LogOut, Flame, Target, Zap, Clock } from "lucide-react"
import { Link } from "wouter"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { data: user } = useGetMe()
  const { data: enrollments, isLoading } = useListMyEnrollments()
  const queryClient = useQueryClient()

  const complete = useCompleteEnrollment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() })
      }
    }
  })

  const unenroll = useUnenrollFromCampaign({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() })
    }
  })

  if (!user) return null

  // Calculate next level progress (mock logic: 100 points per level)
  const currentLevelPoints = user.points % 100
  const nextLevelProgress = currentLevelPoints

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-12 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card overflow-hidden">
          <div className="bg-primary text-primary-foreground p-8 relative">
            {/* Noise overlay */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Basecamp</h1>
                <p className="font-mono font-bold text-primary-foreground/80 flex items-center gap-2">
                  <span className="w-3 h-3 bg-solar rounded-full animate-pulse border-2 border-foreground" />
                  Operative: {user.name}
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-background text-foreground border-4 border-foreground p-4 text-center min-w-[120px]">
                  <div className="text-sm font-black uppercase text-muted-foreground">Total PTS</div>
                  <div className="text-3xl font-black font-mono text-primary flex items-center justify-center gap-1">
                    <Zap className="w-5 h-5"/> {user.points}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Level Progress */}
          <div className="p-6 bg-muted/50 border-t-4 border-foreground flex items-center gap-6">
            <div className="w-full">
              <div className="flex justify-between text-sm font-black uppercase mb-2">
                <span>Current Tier</span>
                <span>Next Tier Upgrade</span>
              </div>
              <Progress value={nextLevelProgress} className="h-6 rounded-none border-2 border-foreground" indicatorColor="bg-solar" />
            </div>
          </div>
        </div>

        {/* ACTIVE MISSIONS */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black uppercase flex items-center gap-3">
            <Target className="w-8 h-8 text-destructive" />
            Active Operations
          </h2>
          <Button asChild variant="outline">
            <Link href="/campaigns">Find New Missions</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => <div key={i} className="h-64 bg-muted animate-pulse border-4 border-foreground"></div>)}
          </div>
        ) : enrollments?.length === 0 ? (
          <div className="border-4 border-dashed border-muted-foreground/50 p-16 text-center">
            <Flame className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-black uppercase mb-2 text-muted-foreground">No Active Operations</h3>
            <p className="font-mono font-bold text-muted-foreground mb-6">You are AWOL. Get back in the fight.</p>
            <Button asChild size="lg" className="uppercase font-black tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Link href="/campaigns">Browse Campaigns</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrollments?.map((enrollment, index) => {
              const camp = enrollment.campaign;
              if (!camp) return null;

              // Check if completed today (mock logic based on lastCompletedAt)
              const completedToday = enrollment.lastCompletedAt && 
                new Date(enrollment.lastCompletedAt).toDateString() === new Date().toDateString();

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col border-4 overflow-hidden relative">
                    {completedToday && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rotate-45 translate-x-16 -translate-y-16 flex items-end justify-center pb-4 z-0 pointer-events-none">
                        <span className="text-primary font-black uppercase text-sm -rotate-45">Done</span>
                      </div>
                    )}
                    
                    <div className="p-6 border-b-4 border-foreground bg-muted/30 relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-background text-foreground border-2 border-foreground">
                          {camp.category}
                        </Badge>
                        <button 
                          onClick={() => unenroll.mutate({ id: enrollment.id })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Abort Mission"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="text-2xl font-black uppercase leading-tight mb-2">{camp.title}</h3>
                      <div className="flex gap-4 font-mono text-sm font-bold text-muted-foreground mt-4">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{camp.frequency}</span>
                        <span className="flex items-center gap-1 text-primary"><Zap className="w-4 h-4"/>{camp.pointsReward} PTS</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col justify-between bg-card">
                      <div className="mb-6">
                        <div className="text-sm font-black uppercase text-muted-foreground mb-2">Completions</div>
                        <div className="text-4xl font-black font-mono">{enrollment.completions}</div>
                      </div>
                      
                      <Button 
                        size="lg"
                        className={`w-full h-16 text-xl tracking-widest uppercase font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all ${
                          completedToday ? 'bg-muted text-muted-foreground border-muted-foreground shadow-none translate-x-[6px] translate-y-[6px] pointer-events-none' : 'bg-solar text-foreground border-foreground'
                        }`}
                        onClick={() => complete.mutate({ id: enrollment.id })}
                        disabled={complete.isPending || !!completedToday}
                      >
                        {completedToday ? (
                          <><Check className="mr-2 w-6 h-6"/> Mission Complete</>
                        ) : (
                          "Log Completion"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}