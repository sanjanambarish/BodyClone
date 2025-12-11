import { motion } from "framer-motion";
import { 
  Users, 
  Heart, 
  Bell, 
  Calendar, 
  Shield, 
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";

const familyFeatures = [
  { icon: Users, title: "Family Groups", desc: "Create and manage family health circles" },
  { icon: Shield, title: "Role Permissions", desc: "Parents, children, and elder roles" },
  { icon: Activity, title: "Shared Timeline", desc: "View health events for all members" },
  { icon: Bell, title: "Family Reminders", desc: "Medicine reminders for everyone" },
  { icon: Calendar, title: "Appointments", desc: "Track family appointments" },
  { icon: Heart, title: "Health Alerts", desc: "Get notified of vital anomalies" },
];

const FamilySection = () => {
  return (
    <section className="relative py-12 md:py-24 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-10"
        >
          <span className="inline-block px-3 py-1.5 rounded-full glass-card text-secondary text-xs md:text-sm font-medium mb-3">
            Family Health Cloud
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">CARE FOR YOUR </span>
            <span className="text-gradient">FAMILY</span>
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Manage health for everyone you love.
          </p>
        </motion.div>

        {/* Compact grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {familyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl glass-card"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-heading text-xs md:text-sm font-bold">{feature.title}</h4>
                <p className="hidden md:block text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FamilySection;
