import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const stats = [
  { value: 15, suffix: "+", label: "Core Features" },
  { value: 3, suffix: "", label: "User Portals" },
  { value: 3, suffix: "", label: "Languages Supported" },
  { value: 24, suffix: "/7", label: "AI Assistant" },
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  return (
    <span className="text-gradient">
      {Number.isInteger(value) ? formatNumber(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="relative py-10 md:py-20 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        <div className="glass-card rounded-2xl p-4 md:p-8 neon-border">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="text-center"
              >
                <div className="font-heading text-xl md:text-4xl font-black mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="font-body text-muted-foreground text-[10px] md:text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
