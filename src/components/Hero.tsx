import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-bg-gradient relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-10 right-[8%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium border border-primary/15">
            <Sparkles size={14} />
            AI-Powered SEO Content Generator
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] text-foreground">
              Daily Blog Posts,{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient">Automatically</span>{" "}
              <br className="hidden sm:block" />
              Optimized
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Our AI analyzes the top 10 Google results for your keywords and creates comprehensive, SEO-optimized blog posts daily.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => navigate("/get-started")}
                className="hero-btn-primary flex items-center gap-2 text-base"
              >
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate("/seo-analysis")}
                className="hero-btn-secondary text-base"
              >
                Try Demo
              </button>
            </div>
          </motion.div>

          {/* Right: Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-[hsl(222,47%,11%)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[hsl(222,47%,9%)] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--warning))]/60" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-white/30 font-mono">analytics-dashboard</span>
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-4 font-semibold">
                  Users: Last 7 Days Using Median ▾
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-white/40 mb-2">Load Time vs Bounce Rate</div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 50, 80, 35, 70, 55, 90, 45, 60, 75, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            background: i % 3 === 0
                              ? 'hsl(170, 60%, 50%)'
                              : 'hsl(243, 75%, 60%)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-white/40 mb-2">Start Render vs Bounce Rate</div>
                    <div className="h-20 flex items-center justify-center">
                      <svg viewBox="0 0 120 40" className="w-full h-full">
                        <polyline
                          points="0,35 15,28 30,30 45,20 60,15 75,18 90,10 105,12 120,8"
                          fill="none"
                          stroke="hsl(340, 65%, 55%)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="0,30 15,32 30,25 45,28 60,22 75,20 90,25 105,18 120,15"
                          fill="none"
                          stroke="hsl(243, 75%, 65%)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Page Load", value: "0.7s", positive: true },
                    { label: "Page Views", value: "2.7M", positive: true },
                    { label: "Bounce Rate", value: "40.6%", positive: false },
                    { label: "Sessions", value: "479K", positive: true },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                      <div className="text-xs text-white/40">{m.label}</div>
                      <div className={`text-sm font-bold ${m.positive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--chart-3))]'}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card: Daily Post Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-4 -right-4 float-card bg-background z-10 shadow-lg"
            >
              <div className="text-xs text-muted-foreground font-medium">Daily Post Status</div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Generated at 6:00 AM</span>
              </div>
            </motion.div>

            {/* Floating card: SEO Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-6 left-4 float-card bg-background z-10 shadow-lg"
            >
              <div className="text-xs text-muted-foreground font-medium">SEO Score</div>
              <div className="text-2xl font-bold text-primary mt-1">97/100</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-24 pt-10 border-t border-border/60 flex flex-wrap gap-16"
        >
          {[
            { value: "10K+", label: "Posts Generated" },
            { value: "500+", label: "Active Users" },
            { value: "98%", label: "SEO Score Avg" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
