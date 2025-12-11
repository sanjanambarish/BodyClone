import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl font-bold"
          >
            <span className="text-foreground">BODY</span>
            <span className="text-gradient">CLONE</span>
          </motion.div>

          {/* Links */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 font-body text-sm text-muted-foreground"
          >
            {["Features", "Pricing", "About", "Blog", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-primary transition-colors uppercase tracking-wider"
              >
                {link}
              </a>
            ))}
          </motion.nav>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            {[
              { icon: Twitter, href: "#" },
              { icon: Github, href: "#" },
              { icon: Linkedin, href: "#" },
              { icon: Mail, href: "#" },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-glow-sm transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground"
        >
          <p>© 2024 BodyClone. All rights reserved. Pioneering the future of health.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
