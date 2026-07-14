import { useListFundraisers } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { ArrowUpRight, DollarSign, Users } from "lucide-react"

export default function Crowdfunding() {
  const { data: fundraisers, isLoading } = useListFundraisers()

  const getFallbackImage = (title: string) => {
    if (title.toLowerCase().includes("forest") || title.toLowerCase().includes("amazon")) return "/attached_assets/generated_images/fund-amazon.jpg"
    if (title.toLowerCase().includes("ocean") || title.toLowerCase().includes("reef")) return "/attached_assets/generated_images/fund-ocean.jpg"
    return "/attached_assets/generated_images/fund-solar.jpg"
  }

  return (
    <div className="min-h-screen bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        
        <div className="mb-16 border-l-8 border-solar pl-8">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-solar to-destructive">
            War Chest
          </h1>
          <p className="text-2xl font-bold max-w-2xl text-background/80">
            Fund the resistance. Direct capital to verified frontline projects.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-[500px] bg-background/10 animate-pulse border-4 border-background"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {fundraisers?.map((fund, index) => {
              const progress = Math.min(100, Math.round((fund.raisedAmount / fund.goalAmount) * 100))
              
              return (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="h-full flex flex-col bg-background text-foreground border-4 border-background overflow-hidden rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                    <div className="h-64 relative border-b-4 border-foreground overflow-hidden group">
                      <img 
                        src={fund.imageUrl || getFallbackImage(fund.title)} 
                        alt={fund.title}
                        className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-background">
                        <div className="font-mono font-bold uppercase text-sm border-2 border-background px-3 py-1 bg-foreground">
                          {Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days Left
                        </div>
                        <div className="font-black text-3xl flex items-center">
                          {progress}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-3xl font-black uppercase leading-none tracking-tight mb-4">{fund.title}</h3>
                      <p className="font-bold mb-8 text-muted-foreground line-clamp-3 flex-1">{fund.description}</p>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between font-mono font-bold text-sm mb-2">
                            <span className="text-primary flex items-center gap-1"><DollarSign className="w-4 h-4"/>{fund.raisedAmount.toLocaleString()} Raised</span>
                            <span>{fund.goalAmount.toLocaleString()} Goal</span>
                          </div>
                          <Progress value={progress} className="h-4 bg-muted border-2 border-foreground" indicatorColor="bg-primary" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t-2 border-foreground border-dashed">
                          <div className="flex items-center gap-2 font-mono font-bold">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            {fund.donorCount} Donors
                          </div>
                          <Button size="lg" className="uppercase font-black tracking-widest gap-2">
                            Donate <ArrowUpRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
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