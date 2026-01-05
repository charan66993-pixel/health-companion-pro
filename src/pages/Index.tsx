import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { EmergencyCallCard } from "@/components/landing/EmergencyCallCard";
import { HealthTipsSection } from "@/components/landing/HealthTipsSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Emergency Call at TOP of dashboard */}
        <section className="container mx-auto px-4 py-6">
          <EmergencyCallCard />
        </section>
        
        <HeroSection />
        <HowItWorksSection />
        
        {/* Health Tips at BOTTOM of dashboard */}
        <HealthTipsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
