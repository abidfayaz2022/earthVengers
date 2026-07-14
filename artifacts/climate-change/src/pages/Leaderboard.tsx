import { useState } from "react"
import { useGetLeaderboard, useGetMyRank, useGetMe } from "@workspace/api-client-react"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Gem, Shield, ShieldAlert, Sparkles, Sprout, Trophy } from "lucide-react"

const TABS = [
  { value: undefined, label: "Overall" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "awareness", label: "Awareness" },
] as const

export default function Leaderboard() {
  const [category, setCategory] = useState<"daily" | "weekly" | "monthly" | "awareness" | undefined>(undefined)

  const { data: leaderboard, isLoading } = useGetLeaderboard(category ? { category } : undefined)
  const { data: myRank } = useGetMyRank(category ? { category } : undefined)
  const { data: user } = useGetMe()

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'seedling': return <Sprout className="w-5 h-5 text-green-400" />
      case 'sprout': return <Sprout className="w-5 h-5 text-primary" />
      case 'sapling': return <Shield className="w-5 h-5 text-blue-400" />
      case 'guardian': return <ShieldAlert className="w-5 h-5 text-solar" />
      case 'champion': return <Crown className="w-5 h-5 text-destructive" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="mb-12 border-l-8 border-destructive pl-8">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">Rankings</h1>
          <p className="text-2xl font-bold max-w-2xl">
            The most lethal defenders of the planet. Top 5 in each front earn an Avengers title.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-12 border-4 border-foreground p-2 bg-foreground">
          {TABS.map(t => (
            <button
              key={t.label}
              onClick={() => setCategory(t.value)}
              className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
                category === t.value
                  ? 'bg-solar text-foreground'
                  : 'bg-transparent text-background hover:bg-background/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {user && myRank && myRank.rank > 0 && (
          <div className="mb-12 bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Background noise/pattern for personal rank */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-foreground to-transparent"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-foreground text-background flex items-center justify-center text-4xl font-black font-mono border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                #{myRank.rank}
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Your Status</h2>
                <div className="text-3xl font-black uppercase">{myRank.name}</div>
                <div className="flex items-center gap-2 mt-2 font-mono font-bold">
                  {getLevelIcon(myRank.level)}
                  <span className="uppercase text-sm">{myRank.level}</span>
                  {myRank.title && (
                    <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs uppercase tracking-wider">{myRank.title}</span>
                  )}
                  {myRank.isStoneCollector && (
                    <span className="ml-2 bg-gradient-to-r from-purple-600 to-yellow-500 text-white px-2 py-0.5 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Gem className="w-3 h-3" /> Stone Collector
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-8 relative z-10 w-full md:w-auto border-t-4 md:border-t-0 md:border-l-4 border-foreground pt-6 md:pt-0 md:pl-8">
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase text-muted-foreground">Points</span>
                <span className="text-4xl font-black text-primary">{myRank.points}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase text-muted-foreground">Ops</span>
                <span className="text-4xl font-black">{myRank.completions}</span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <AnimatePresence mode="wait">
        <motion.div
          key={category ?? "overall"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="border-4 border-foreground bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-foreground bg-muted font-black uppercase tracking-widest text-sm">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Operative</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right hidden md:block">Ops</div>
          </div>
          
          {isLoading ? (
            <div className="divide-y-2 divide-foreground">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-20 bg-muted/50 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="divide-y-2 divide-foreground border-dashed">
              {leaderboard?.map((entry, index) => {
                const isTop3 = index < 3;
                const isMe = user?.id === entry.userId;
                
                return (
                  <motion.div 
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-muted/50 transition-colors ${
                      isMe ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="col-span-2 flex justify-center">
                      {isTop3 ? (
                        <div className={`w-12 h-12 flex items-center justify-center font-black text-xl border-4 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          index === 0 ? 'bg-solar text-foreground' : 
                          index === 1 ? 'bg-muted text-foreground' : 
                          'bg-[#cd7f32] text-white'
                        }`}>
                          {entry.rank}
                        </div>
                      ) : (
                        <div className="font-mono font-bold text-2xl text-muted-foreground">
                          {entry.rank}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-8 md:col-span-6 flex flex-col">
                      <div className="font-black text-xl uppercase truncate flex items-center gap-2 flex-wrap">
                        {entry.name}
                        {isMe && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5">YOU</span>}
                        {entry.isStoneCollector && (
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-yellow-500 text-white px-2 py-0.5 flex items-center gap-1">
                            <Gem className="w-3 h-3" /> Stone Collector
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm font-bold text-muted-foreground uppercase mt-1 flex-wrap">
                        <span className="flex items-center gap-1">{getLevelIcon(entry.level)} {entry.level}</span>
                        {entry.title && (
                          <span className="flex items-center gap-1 text-solar normal-case">
                            <Trophy className="w-4 h-4" /> {entry.title}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-right font-black text-2xl text-primary font-mono flex items-center justify-end">
                      {entry.points}
                    </div>
                    
                    <div className="col-span-2 text-right font-bold text-xl font-mono text-muted-foreground hidden md:flex items-center justify-end">
                      {entry.completions}
                    </div>
                  </motion.div>
                )
              })}
              {leaderboard?.length === 0 && (
                <div className="p-12 text-center font-black uppercase text-muted-foreground">No operatives ranked yet. Be the first.</div>
              )}
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
