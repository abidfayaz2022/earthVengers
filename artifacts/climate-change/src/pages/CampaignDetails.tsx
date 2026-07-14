import { useGetCampaign, useListMyEnrollments, useEnrollInCampaign, useUnenrollFromCampaign, getListMyEnrollmentsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useParams, Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Flame, ShieldAlert, Target, Users, Zap } from "lucide-react"

export default function CampaignDetails() {
  const params = useParams()
  const id = Number(params.id)
  
  const { data: campaign, isLoading } = useGetCampaign(id, { query: { enabled: !!id } })
  const { data: enrollments } = useListMyEnrollments()
  const queryClient = useQueryClient()

  const enroll = useEnrollInCampaign({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() })
    }
  })

  const unenroll = useUnenrollFromCampaign({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() })
    }
  })

  const isEnrolled = enrollments?.some(e => e.campaignId === id)
  const enrollment = enrollments?.find(e => e.campaignId === id)

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-primary text-primary-foreground'
      case 'medium': return 'bg-solar text-foreground'
      case 'hard': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getFallbackImage = (title: string) => {
    if (!title) return "/missions/zero-waste-challenge.jpg"
    if (title.toLowerCase().includes("tree")) return "/missions/plant-a-tree.jpg"
    if (title.toLowerCase().includes("plastic")) return "/missions/no-plastic.jpg"
    if (title.toLowerCase().includes("bike") || title.toLowerCase().includes("transport")) return "/missions/bike-to-work.jpg"
    return "/missions/zero-waste-challenge.jpg"
  }

  const frequencyLabel: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    awareness: "Awareness",
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-16 h-16 border-8 border-foreground border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (!campaign) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-8 text-2xl font-black uppercase">Operation Not Found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-64 md:h-96 relative border-b-4 border-foreground">
        <img 
          src={campaign.imageUrl || getFallbackImage(campaign.title)} 
          alt={campaign.title}
          className="w-full h-full object-cover grayscale-[0.2]"
        />
        <div className="absolute inset-0 bg-foreground/60 mix-blend-multiply" />
        
        <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between container mx-auto">
          <Button asChild variant="outline" size="sm" className="w-fit bg-background/20 text-background border-background backdrop-blur-md hover:bg-background hover:text-foreground">
            <Link href="/campaigns"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Operations</Link>
          </Button>
          
          <div className="text-background">
            <div className="flex gap-2 mb-4">
              <Badge className="bg-background text-foreground uppercase border-2 border-background font-black tracking-widest">{campaign.category}</Badge>
              <Badge className={`${getDifficultyColor(campaign.difficulty)} uppercase border-2 border-background font-black tracking-widest`}>
                {campaign.difficulty}
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter shadow-black drop-shadow-lg leading-none">{campaign.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="lg:w-2/3">
            <div className="prose dark:prose-invert prose-lg font-bold text-foreground/80 max-w-none mb-12">
              <p className="text-2xl leading-relaxed">{campaign.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-4 border-foreground p-6 bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground uppercase font-black text-xs tracking-widest flex items-center gap-2"><Target className="w-4 h-4" /> Category</span>
                <span className="font-black text-xl uppercase">{campaign.category}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground uppercase font-black text-xs tracking-widest flex items-center gap-2"><Flame className="w-4 h-4" /> Threat Lvl</span>
                <span className={`font-black text-xl uppercase ${
                  campaign.difficulty.toLowerCase() === 'hard' ? 'text-destructive' : 
                  campaign.difficulty.toLowerCase() === 'medium' ? 'text-solar' : 'text-primary'
                }`}>{campaign.difficulty}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground uppercase font-black text-xs tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> Freq</span>
                <span className="font-black text-xl uppercase">{frequencyLabel[campaign.frequency] || campaign.frequency}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground uppercase font-black text-xs tracking-widest flex items-center gap-2"><Zap className="w-4 h-4" /> Reward</span>
                <span className="font-black text-xl text-primary">{campaign.pointsReward} PTS</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-24 border-4 border-foreground p-8 bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-4 border-foreground pb-4">
                <ShieldAlert className="w-6 h-6" /> Mission Status
              </h3>
              
              <div className="flex items-center gap-4 mb-8 font-mono font-bold text-lg">
                <Users className="w-6 h-6 text-muted-foreground" />
                <span><span className="text-primary font-black">{campaign.enrolledCount.toLocaleString()}</span> Operatives Active</span>
              </div>
              
              {isEnrolled ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-primary/20 text-primary border-4 border-primary p-4 text-center font-black uppercase tracking-widest mb-4 flex flex-col gap-2">
                    <span>Enlisted</span>
                    <span className="text-sm text-foreground/60">{enrollment?.completions || 0} Completions Logged</span>
                  </div>
                  
                  <Button asChild size="lg" className="w-full text-xl h-16 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full uppercase tracking-widest text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive"
                    onClick={() => {
                      if(confirm("Are you sure you want to abort this mission?")) {
                        unenroll.mutate({ id: enrollment!.id })
                      }
                    }}
                    disabled={unenroll.isPending}
                  >
                    Abort Mission
                  </Button>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full text-2xl h-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all uppercase tracking-widest"
                  onClick={() => enroll.mutate({ data: { campaignId: id } })}
                  disabled={enroll.isPending}
                >
                  {enroll.isPending ? "Connecting..." : "Enlist Now"}
                </Button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}