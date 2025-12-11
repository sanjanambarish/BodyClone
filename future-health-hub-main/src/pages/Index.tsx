import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PortalsSection from "@/components/PortalsSection";
import FeaturesSection from "@/components/FeaturesSection";
import AIFeaturesSection from "@/components/AIFeaturesSection";
import MedicineSection from "@/components/MedicineSection";
import FamilySection from "@/components/FamilySection";
import SecuritySection from "@/components/SecuritySection";
import LanguageSection from "@/components/LanguageSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <PortalsSection />
        <FeaturesSection />
        <AIFeaturesSection />
        <MedicineSection />
        <FamilySection />
        <SecuritySection />
        <LanguageSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
