import { motion } from "framer-motion"
import { ArrowRight, Flame, Leaf, Wind, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { useGetStatsSummary } from "@workspace/api-client-react"

export default function Home() {
  const { data: stats } = useGetStatsSummary()

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          {/* We use a placeholder image if generation isn't ready, but map to the generated path */}
          <img 
            src="/attached_assets/generated_images/hero-bg.jpg" 
            alt="Earth Emergency" 
            className="w-full h-full object-cover grayscale-[0.5]"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&q=80&w=2000"
            }}
          />
        </div>
        
        {/* Noise overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

        <div className="container mx-auto px-4 z-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-background font-mono text-sm font-bold uppercase mb-8 bg-destructive text-destructive-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
              Global Emergency Protocol Active
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black uppercase leading-[0.85] tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-background via-muted to-primary">
              Not A <br/><span className="text-destructive">Drill.</span>
            </h1>
            
            <p className="text-xl md:text-3xl font-bold max-w-2xl mb-12 border-l-4 border-solar pl-6 py-2">
              The planet is burning. We are the generation that puts out the fire. Join the movement.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button asChild size="lg" className="text-xl h-16 px-10 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px]">
                <Link href="/register">Join The Fight <ArrowRight className="ml-2 w-6 h-6" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-xl h-16 px-10 text-background border-background shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:bg-background hover:text-foreground">
                <Link href="/campaigns">View Operations</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS MARQUEE */}
      <div className="bg-solar text-foreground border-y-4 border-foreground py-6 overflow-hidden flex whitespace-nowrap">
        <div className="animate-[marquee_20s_linear_infinite] flex gap-16 font-black uppercase text-4xl tracking-tighter items-center">
          <span>{stats?.totalUsers?.toLocaleString() || "10,482"} Activists</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.totalCompletions?.toLocaleString() || "42,091"} Actions Taken</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.treesPlanted?.toLocaleString() || "15,820"} Trees Planted</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.totalCO2Saved?.toLocaleString() || "8,402"}kg CO2 Saved</span>
          <Activity className="w-8 h-8" />
        </div>
        <div className="animate-[marquee_20s_linear_infinite] flex gap-16 font-black uppercase text-4xl tracking-tighter items-center ml-16" aria-hidden="true">
          <span>{stats?.totalUsers?.toLocaleString() || "10,482"} Activists</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.totalCompletions?.toLocaleString() || "42,091"} Actions Taken</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.treesPlanted?.toLocaleString() || "15,820"} Trees Planted</span>
          <Activity className="w-8 h-8" />
          <span>{stats?.totalCO2Saved?.toLocaleString() || "8,402"}kg CO2 Saved</span>
          <Activity className="w-8 h-8" />
        </div>
      </div>

      {/* ABOUT THE CRISIS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3 sticky top-24">
              <h2 className="text-5xl font-black uppercase leading-none tracking-tighter mb-6">
                The<br/>Reality.
              </h2>
              <div className="w-24 h-4 bg-destructive mb-6"></div>
              <p className="font-mono font-bold text-muted-foreground uppercase text-sm">
                Understand the enemy to defeat the enemy. The timeline is accelerating.
              </p>
            </div>
            
            <div className="md:w-2/3 flex flex-col gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card"
              >
                <div className="flex gap-4 items-start mb-6">
                  <div className="p-4 bg-destructive text-destructive-foreground">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">The Causes</h3>
                  </div>
                </div>
                <p className="text-lg font-bold">Unchecked industrial emissions, catastrophic deforestation, and reliance on fossil fuels are suffocating the atmosphere. We are extracting more than the planet can regenerate.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card ml-0 md:ml-12"
              >
                <div className="flex gap-4 items-start mb-6">
                  <div className="p-4 bg-secondary text-secondary-foreground">
                    <Wind className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">The Effects</h3>
                  </div>
                </div>
                <p className="text-lg font-bold">Rising sea levels, extreme weather events, mass extinction, and resource scarcity. The poorest communities bear the heaviest burden. Inaction is complicity.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground ml-0 md:ml-24"
              >
                <div className="flex gap-4 items-start mb-6">
                  <div className="p-4 bg-background text-foreground border-2 border-background">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">Prevention</h3>
                  </div>
                </div>
                <p className="text-lg font-bold">Systemic change driven by grassroots action. Divestment from carbon, relentless adoption of renewables, zero-waste lifestyles, and funding front-line conservation.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION GRID */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-16 text-transparent bg-clip-text bg-gradient-to-b from-background to-muted">
            Choose Your Weapon
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/campaigns">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="group cursor-pointer relative h-96 border-4 border-background overflow-hidden flex flex-col justify-end p-8 text-left bg-primary"
              >
                <div className="absolute inset-0 z-0">
                  <img src="/attached_assets/generated_images/campaign-tree.jpg" alt="Campaigns" className="w-full h-full object-cover opacity-50 mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="relative z-10">
                  <div className="text-5xl font-black uppercase mb-4 text-solar group-hover:translate-x-2 transition-transform">01.</div>
                  <h3 className="text-4xl font-black uppercase tracking-tight mb-2">Campaigns</h3>
                  <p className="font-mono font-bold text-background/80">Boots on the ground. Daily habits. Tangible impact.</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/crowdfunding">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="group cursor-pointer relative h-96 border-4 border-background overflow-hidden flex flex-col justify-end p-8 text-left bg-secondary"
              >
                <div className="absolute inset-0 z-0">
                  <img src="/attached_assets/generated_images/fund-solar.jpg" alt="Fundraisers" className="w-full h-full object-cover opacity-50 mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="relative z-10">
                  <div className="text-5xl font-black uppercase mb-4 text-solar group-hover:translate-x-2 transition-transform">02.</div>
                  <h3 className="text-4xl font-black uppercase tracking-tight mb-2">Fund Frontlines</h3>
                  <p className="font-mono font-bold text-background/80">Deploy capital where it hurts the most.</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/leaderboard">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="group cursor-pointer relative h-96 border-4 border-background overflow-hidden flex flex-col justify-end p-8 text-left bg-destructive"
              >
                <div className="absolute inset-0 bg-background/10 z-0 group-hover:bg-background/0 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black uppercase mb-4 text-solar group-hover:translate-x-2 transition-transform">03.</div>
                  <h3 className="text-4xl font-black uppercase tracking-tight mb-2">Rank Up</h3>
                  <p className="font-mono font-bold text-background/80">Compete. Influence. Climb the ranks of resistance.</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-solar border-b-4 border-foreground">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-8 text-foreground">
            Zero <br/>Excuses.
          </h2>
          <Button asChild size="lg" variant="default" className="text-2xl h-20 px-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Link href="/register">Start Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}