import { motion } from "framer-motion";
import { User, Stethoscope, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const portals = [
  {
    icon: User,
    title: "Patient Portal",
    description: "Your personal health command center. Track medicines, vitals, and get AI-powered insights about your health.",
    features: ["Personal Health Dashboard", "Medicine Management", "Vital Tracking", "AI Health Assessment"],
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Stethoscope,
    title: "Doctor Portal",
    description: "Comprehensive patient management with AI-assisted prescription validation and health monitoring.",
    features: ["Patient Management", "Prescription Writing", "Drug Interaction Checks", "Assessment Reviews"],
    color: "secondary",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Users,
    title: "Family Dashboard",
    description: "Keep your loved ones healthy. Manage family health data, reminders, and appointments in one place.",
    features: ["Family Health Cloud", "Shared Reminders", "Caregiver Access", "Family Timeline"],
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
  },
];

const PortalsSection = () => {
  return (
    <section className="relative py-12 md:py-24 overflow-hidden">
      <div className="absolute inset-0 circuit-pattern opacity-30" />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-card text-primary text-xs md:text-sm font-medium mb-4 md:mb-6">
            Multi-User System
          </span>
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6">
            <span className="text-foreground">ONE PLATFORM, </span>
            <span className="text-gradient">THREE PORTALS</span>
          </h2>
          <p className="font-body text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            For patients, doctors, and families.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <motion.div
                className="glass-card h-full rounded-2xl p-4 md:p-6 relative overflow-hidden group cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-3 md:block">
                  {/* Icon */}
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center md:mb-4 bg-${portal.color}/20 shrink-0`}>
                    <portal.icon className={`w-6 h-6 md:w-8 md:h-8 text-${portal.color}`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors">
                      {portal.title}
                    </h3>
                    <p className="hidden md:block font-body text-sm text-muted-foreground mb-3 leading-relaxed">
                      {portal.description}
                    </p>
                    
                    {/* Features - hidden on mobile */}
                    <ul className="hidden md:block space-y-1.5">
                      {portal.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs">
                          <div className={`w-1 h-1 rounded-full bg-${portal.color}`} />
                          <span className="text-foreground/70">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalsSection;
