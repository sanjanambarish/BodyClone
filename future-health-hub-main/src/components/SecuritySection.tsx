import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Fingerprint, 
  Server,
  CheckCircle
} from "lucide-react";

const securityFeatures = [
  { icon: Lock, title: "Row-Level Security", desc: "Database-level access control" },
  { icon: Shield, title: "HIPAA Compliant", desc: "Healthcare data standards" },
  { icon: Key, title: "Encrypted Storage", desc: "256-bit encryption at rest" },
  { icon: Eye, title: "Role-Based Access", desc: "Patients see only their data" },
  { icon: Fingerprint, title: "Secure Auth", desc: "Email & multi-factor auth" },
  { icon: Server, title: "Private Cloud", desc: "Secure Supabase backend" },
];

const SecuritySection = () => {
  return (
    <section className="relative py-10 md:py-20 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-5 md:p-8 neon-border"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h2 className="font-heading text-xl md:text-3xl font-bold">
              <span className="text-foreground">ENTERPRISE </span>
              <span className="text-gradient">SECURITY</span>
            </h2>
          </div>

          {/* Grid of features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 md:gap-3"
              >
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-medium">{feature.title}</p>
                  <p className="hidden md:block text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
