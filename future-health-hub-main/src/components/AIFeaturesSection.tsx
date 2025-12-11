import { motion } from "framer-motion";
import { 
  Camera, 
  Languages, 
  Volume2, 
  Mic, 
  MessageSquare, 
  Sparkles, 
  FileText,
  Brain
} from "lucide-react";

const aiFeatures = [
  {
    icon: Camera,
    title: "AI Prescription Scanner",
    description: "Capture or upload prescriptions. Our OCR extracts medicine names, dosages, timing, and instructions automatically.",
    highlight: "Google Gemini Vision",
  },
  {
    icon: Languages,
    title: "Multi-Language Translation",
    description: "Translate prescriptions instantly to English, Hindi, or Kannada. Breaking language barriers in healthcare.",
    highlight: "3 Languages",
  },
  {
    icon: Volume2,
    title: "Text-to-Speech",
    description: "Listen to your prescription instructions with natural AI voice synthesis. Never misread a prescription again.",
    highlight: "ElevenLabs TTS",
  },
  {
    icon: Mic,
    title: "Voice Health Assessment",
    description: "AI-powered conversational health check with real-time speech recognition in English and Kannada.",
    highlight: "Voice AI",
  },
  {
    icon: MessageSquare,
    title: "24/7 Medical Chatbot",
    description: "Your personal AI health assistant knows your medicines, conditions, and vitals for contextual advice.",
    highlight: "Gemini Powered",
  },
  {
    icon: Sparkles,
    title: "AI Wellness Tips",
    description: "Personalized recommendations based on your health conditions, medicines, and assessments.",
    highlight: "Personalized AI",
  },
  {
    icon: FileText,
    title: "Smart Prescription Validation",
    description: "AI-powered safety checks for drug interactions before prescriptions are finalized.",
    highlight: "Safety First",
  },
  {
    icon: Brain,
    title: "Predictive Insights",
    description: "AI analyzes patterns in your vitals and generates health concerns before they become problems.",
    highlight: "Predictive AI",
  },
];

const AIFeaturesSection = () => {
  return (
    <section id="technology" className="relative py-12 md:py-24 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium">AI-Powered</span>
          </div>
          
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-gradient">AI </span>
            <span className="text-foreground">HEALTHCARE</span>
          </h2>
          <p className="font-body text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            Intelligent assistance for your health.
          </p>
        </motion.div>

        {/* Show only 4 on mobile, all on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {aiFeatures.slice(0, 4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                className="glass-card h-full p-3 md:p-5 rounded-xl group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                {/* Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3 bg-primary/10">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xs md:text-sm font-bold mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="hidden md:block font-body text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Show remaining 4 only on desktop */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
          {aiFeatures.slice(4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                className="glass-card h-full p-5 rounded-xl group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-sm font-bold mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
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

export default AIFeaturesSection;
