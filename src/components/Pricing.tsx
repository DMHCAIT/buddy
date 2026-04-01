import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    subtitle: "Perfect for individual bloggers",
    price: 49,
    buttonText: "Start Free Trial",
    features: [
      "1 daily blog post",
      "Up to 3 keywords",
      "Basic SEO optimization",
      "Top 10 search results analysis",
      "Standard support",
      "Export to markdown",
    ],
  },
  {
    name: "Professional",
    subtitle: "For growing businesses",
    price: 99,
    buttonText: "Start Free Trial",
    popular: true,
    features: [
      "3 daily blog posts",
      "Up to 10 keywords",
      "Advanced SEO optimization",
      "Top 10 search results analysis",
      "Priority support",
      "Export to markdown & HTML",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For large organizations",
    price: 249,
    buttonText: "Contact Sales",
    features: [
      "Unlimited daily blog posts",
      "Unlimited keywords",
      "Premium SEO optimization",
      "Top 10 search results analysis",
      "Dedicated support",
      "All export formats",
    ],
  },
];

const Pricing = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section id="pricing" ref={ref} className="py-28 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="section-label">PRICING</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose the perfect plan for your content needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 z-10 md:-my-4 md:py-12 p-8"
                  : "card-elevated p-8"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] text-xs font-bold py-1.5 px-5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <h3 className={`text-xl font-bold ${plan.popular ? "" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.subtitle}
              </p>

              <div className="mt-6 mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className={`text-sm ml-2 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  per month
                </span>
              </div>

              <button
                onClick={() => navigate("/auth")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-8 ${
                  plan.popular
                    ? "bg-background text-primary hover:bg-background/90 shadow-sm"
                    : "btn-primary"
                }`}
              >
                {plan.buttonText}
              </button>

              <ul className="space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`shrink-0 ${plan.popular ? "text-primary-foreground/70" : "text-[hsl(var(--success))]"}`}
                    />
                    <span className={plan.popular ? "text-primary-foreground/90" : "text-foreground"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
