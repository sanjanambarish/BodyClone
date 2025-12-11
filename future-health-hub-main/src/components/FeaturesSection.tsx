import { motion } from "framer-motion";
import { 
  Camera, 
  Pill, 
  Activity, 
  MessageSquare, 
  Calendar, 
  FileText 
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Prescription Scanner",
    description: "AI-powered OCR extracts medicine names, dosages, and instructions from any prescription image.",
    color: "primary",
  },
  {
    icon: Pill,
    title: "Medicine Management",
    description: "Track all medicines with smart reminders, dosage schedules, and real-time sync across devices.",
    color: "secondary",
  },
  {
    icon: Activity,
    title: "Vitals Tracking",
    description: "Record BP, blood sugar, temperature with voice input and visualize trends with interactive charts.",
    color: "primary",
  },
  {
    icon: MessageSquare,
    title: "AI Health Assistant",
    description: "24/7 medical chatbot that knows your medicines, conditions, and provides contextual health advice.",
    color: "secondary",
  },
  {
    icon: Calendar,
    title: "Appointments & Reminders",
    description: "Book doctor visits, get automated reminders, and never miss a medicine or checkup.",
    color: "primary",
  },
  {
    icon: FileText,
    title: "Document Storage",
    description: "Securely store prescriptions, lab reports, and medical certificates in your health cloud.",
    color: "secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-12 md:py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 circuit-pattern opacity-50" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <span className="inline-block px-3 py-1.5 rounded-full glass-card text-primary text-xs md:text-sm font-medium mb-4">
            Core Capabilities
          </span>
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6">
            <span className="text-foreground">EVERYTHING FOR </span>
            <span className="text-gradient">BETTER HEALTH</span>
          </h2>
          <p className="font-body text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            AI-powered tools for your healthcare journey.
          </p>
        </motion.div>

        {/* Features grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                className="glass-card h-full p-3 md:p-6 rounded-xl md:rounded-2xl group cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 ${
                  feature.color === "primary" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                }`}>
                  <feature.icon className="w-5 h-5 md:w-7 md:h-7" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xs md:text-lg font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="hidden md:block font-body text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
