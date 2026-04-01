import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "10,000+", label: "ChatGPT mentions secured" },
  { value: "50,000+", label: "Articles Created" },
  { value: "25,000+", label: "Backlinks Added" },
];

const Stats = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-5xl mx-auto bg-stats rounded-3xl py-20 px-8 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-3">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
