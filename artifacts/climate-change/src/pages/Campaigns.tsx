import { useState } from "react"
import { useListCampaigns, useListMyEnrollments, useEnrollInCampaign, getListMyEnrollmentsQueryKey, getGetStatsSummaryQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { Flame, Leaf, Wind, Zap } from "lucide-react"

const FREQUENCY_TABS = [
  { value: "all", label: "All Ops" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "awareness", label: "Awareness" },
]

export default function Campaigns() {
  const [filter, setFilter] = useState<string>("all")
  const [freq, setFreq] = useState<string>("all")
  const { data: campaigns, isLoading } = useListCampaigns()
  const { data: enrollments } = useListMyEnrollments()
  const queryClient = useQueryClient()
  const enroll = useEnrollInCampaign({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyEnrollmentsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() })
      }
    }
  })

  const enrolledIds = new Set(enrollments?.map(e => e.campaignId) || [])

  const categories = ["all", ...new Set(campaigns?.map(c => c.category) || [])]

  const filteredCampaigns = campaigns
    ?.filter(c => filter === "all" || c.category === filter)
    ?.filter(c => freq === "all" || c.frequency === freq)

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-primary text-primary-foreground'
      case 'medium': return 'bg-solar text-foreground'
      case 'hard': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getFallbackImage = (title: string) => {
    if (title.toLowerCase().includes("tree")) return "/missions/plant-a-tree.jpg"
    if (title.toLowerCase().includes("plastic")) return "/missions/no-plastic.jpg"
    if (title.toLowerCase().includes("bike") || title.toLowerCase().includes("transport")) return "/missions/bike-to-work.jpg"
    return "/missions/zero-waste-challenge.jpg"
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        
        <div className="mb-16 border-l-8 border-primary pl-8">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">Operations</h1>
          <p className="text-2xl font-bold max-w-2xl">
            Select your front. High-impact habits that move the needle.
          </p>
        </div>

        {/* Frequency tabs: daily / weekly / monthly / awareness */}
        <div className="flex flex-wrap gap-2 mb-6 border-4 border-foreground p-2 bg-foreground">
          {FREQUENCY_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFreq(t.value)}
              className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                freq === t.value
                  ? 'bg-solar text-foreground'
                  : 'bg-transparent text-background hover:bg-background/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-4 mb-12 border-4 border-foreground p-4 bg-card">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider border-2 border-foreground transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${
                filter === c 
                  ? 'bg-foreground text-background shadow-none translate-x-[4px] translate-y-[4px]' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-96 bg-muted animate-pulse border-4 border-foreground"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns?.map((campaign, index) => {
              const isEnrolled = enrolledIds.has(campaign.id)
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden group">
                    <div className="h-48 relative border-b-4 border-foreground overflow-hidden">
                      <img 
                        src={campaign.imageUrl || getFallbackImage(campaign.title)} 
                        alt={campaign.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge className="bg-background text-foreground uppercase border-2 border-foreground">{campaign.category}</Badge>
                        <Badge className={`${getDifficultyColor(campaign.difficulty)} border-2 border-foreground uppercase`}>
                          {campaign.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="border-b-0 pb-2">
                      <CardTitle className="text-2xl leading-none">{campaign.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <p className="font-bold text-sm line-clamp-2">{campaign.description}</p>
                      
                      <div className="mt-auto pt-4 grid grid-cols-2 gap-4 font-mono text-sm border-t-2 border-foreground border-dashed">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Reward</span>
                          <span className="font-black text-primary flex items-center gap-1">
                            <Zap className="w-4 h-4" /> {campaign.pointsReward} PTS
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Freq.</span>
                          <span className="font-black uppercase">{campaign.frequency}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4 border-t-4 border-foreground bg-background">
                      <div className="w-full flex items-center justify-between gap-4">
                        <span className="font-mono text-sm font-bold">
                          {campaign.enrolledCount} Active
                        </span>
                        
                        {isEnrolled ? (
                          <Button disabled variant="outline" className="w-1/2 opacity-50 bg-muted">
                            Enrolled
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => enroll.mutate({ data: { campaignId: campaign.id } })}
                            disabled={enroll.isPending}
                            className="w-1/2"
                          >
                            Enlist
                          </Button>
                        )}
                      </div>
                    </CardFooter>
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