import { motion } from "framer-motion";
import { Pill, Bell, Activity, Mic } from "lucide-react";

const medicineFeatures = [
  { icon: Pill, title: "Medicines Dashboard" },
  { icon: Bell, title: "Smart Reminders" },
  { icon: Activity, title: "Vitals Tracking" },
  { icon: Mic, title: "Voice Input" },
];

const MedicineSection = () => {
  return (
    <section className="relative py-10 md:py-20 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="inline-block px-3 py-1.5 rounded-full glass-card text-secondary text-xs font-medium mb-3">
            Medicine Management
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">NEVER MISS A </span>
            <span className="text-gradient">DOSE</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {medicineFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-3 md:p-4 rounded-xl flex items-center gap-2"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              </div>
              <h4 className="font-heading text-xs md:text-sm font-bold">{feature.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MedicineSection;