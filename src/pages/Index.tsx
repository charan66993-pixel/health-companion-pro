import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { EmergencyCallCard } from "@/components/landing/EmergencyCallCard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <HeroSection />
        
        {/* Emergency Call Section */}
        <section className="container mx-auto px-4 py-8 -mt-8 relative z-10">
          <EmergencyCallCard />
        </section>
        
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
