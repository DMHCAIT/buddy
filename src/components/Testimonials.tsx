import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Our DR went from 13 to 36 in 4 months, our traffic doubled.",
    name: "Lorenzo Nicolini",
    role: "Founder, Moonb",
  },
  {
    quote: "The biggest visible shift: our brand started getting picked up in AI answers.",
    name: "Aidan Cramer",
    role: "Co-Founder, AIApply",
  },
  {
    quote: "Cutting client SEO time from 40-50 hours to a streamlined content process.",
    name: "Olaf van Gastel",
    role: "Founder, Bright Brands",
  },
];

const Testimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="section-label">CLIENT SUCCESS</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">The BlitzNova Effect</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
              className="card-elevated p-8 flex flex-col"
            >
              <Quote size={24} className="text-primary/20 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                ))}
              </div>
              <blockquote className="text-foreground font-medium leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
