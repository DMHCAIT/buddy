import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bot, Clock, TrendingUp, FileText, Link, Crosshair } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Research",
    description: "Our AI analyzes top 10 Google results to understand what ranks and creates superior content.",
  },
  {
    icon: Clock,
    title: "Daily Automation",
    description: "Set your keywords and schedule. Wake up to fresh, SEO-optimized content every morning.",
  },
  {
    icon: TrendingUp,
    title: "SEO Optimized",
    description: "Every post is optimized with the right keywords, meta tags, and structure to rank higher.",
  },
  {
    icon: FileText,
    title: "Quality Content",
    description: "Well-researched, comprehensive articles that provide real value to your readers.",
  },
  {
    icon: Link,
    title: "Smart References",
    description: "Automatic citations and references to authoritative sources from top-ranking content.",
  },
  {
    icon: Crosshair,
    title: "Keyword Targeting",
    description: "Target multiple keywords simultaneously and build topical authority in your niche.",
  },
];

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-28 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="section-label">FEATURES</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Everything You Need for SEO Success
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to automate your content creation and boost your search rankings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              className="card-elevated p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/15">
                <feature.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
