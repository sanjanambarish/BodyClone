import { motion } from "framer-motion";
import { Globe, Volume2, Mic, MessageSquare, Smartphone, Moon, Sun } from "lucide-react";

const languages = [
  { name: "English", native: "English", flag: "🇬🇧" },
  { name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

const features = [
  { icon: Globe, title: "Multi-Language UI", desc: "Complete app translation" },
  { icon: Volume2, title: "TTS Support", desc: "Hear in your language" },
  { icon: Mic, title: "Voice Recognition", desc: "Speak in your language" },
  { icon: Smartphone, title: "Responsive Design", desc: "Mobile-first experience" },
  { icon: Moon, title: "Dark/Light Theme", desc: "Easy on the eyes" },
];

const LanguageSection = () => {
  return (
    <section className="relative py-10 md:py-20 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-10"
        >
          <h2 className="font-heading text-xl md:text-3xl font-bold mb-2">
            <span className="text-foreground">SPEAK YOUR </span>
            <span className="text-gradient">LANGUAGE</span>
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Full translation & voice support.
          </p>
        </motion.div>

        {/* Languages + Features in one row on mobile */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card px-4 py-3 md:p-5 rounded-xl text-center"
            >
              <div className="text-2xl md:text-3xl mb-1">{lang.flag}</div>
              <p className="font-heading text-xs md:text-sm font-bold">{lang.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Features as compact horizontal list */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {features.slice(0, 4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium">{feature.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguageSection;
