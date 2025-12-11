import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Zap, Shield, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bodycloneLogo from "@/assets/bodyclone-logo.jpg";
import ParticleField from "./ParticleField";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden circuit-pattern pt-16 md:pt-0">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full border border-primary/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[1000px] h-[1000px] rounded-full border border-secondary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <ParticleField />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Logo with glow effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse-slow" />
            <motion.img
              src={bodycloneLogo}
              alt="BodyClone Logo"
              className="relative w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-primary/50 shadow-glow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6"
          >
            <span className="text-foreground">BODY</span>
            <span className="text-gradient">CLONE</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-body text-base md:text-2xl text-muted-foreground max-w-2xl mb-6 md:mb-8 leading-relaxed px-2"
          >
            AI-Powered <span className="text-primary neon-text">Health Management</span> for 
            Patients, Doctors & Families.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-10"
          >
            {[
              { icon: Zap, text: "AI Scanner" },
              { icon: Shield, text: "HIPAA" },
              { icon: Activity, text: "Reminders" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="glass-card px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" }}
              >
                <item.icon className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" onClick={() => navigate('/auth?mode=signup')}>
              Get Started Free
            </Button>
            <Button variant="glow" size="xl" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </motion.div>

          {/* Scroll indicator - hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center text-muted-foreground cursor-pointer hover:text-primary transition-colors"
            >
              <span className="text-sm font-medium mb-2">Discover More</span>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
