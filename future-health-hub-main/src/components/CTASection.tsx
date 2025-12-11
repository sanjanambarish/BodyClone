import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative py-12 md:py-24 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-2xl md:text-4xl font-black mb-4">
            <span className="text-foreground">READY TO START?</span>
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground mb-6">
            Transform your health journey with AI.
          </p>
          <Button variant="hero" size="lg" className="group" onClick={() => navigate('/auth?mode=signup')}>
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>No Credit Card</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
