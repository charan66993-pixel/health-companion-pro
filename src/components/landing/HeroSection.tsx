import { Heart, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium animate-fade-in">
            <Shield className="w-4 h-4" />
            AI-Powered Health Guidance
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight animate-slide-up">
            Your Health,{" "}
            <span className="text-gradient-primary">Understood</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Describe your symptoms and get instant AI-powered health insights. 
            Connect with the right specialist when you need care.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate(user ? "/symptom-checker" : "/auth")}
            >
              Start Symptom Check
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <TrustIndicator
              icon={Shield}
              title="Secure & Private"
              description="End-to-end encryption"
            />
            <TrustIndicator
              icon={Clock}
              title="24/7 Available"
              description="Check anytime"
            />
            <TrustIndicator
              icon={Heart}
              title="Expert Backed"
              description="Medical AI models"
            />
            <TrustIndicator
              icon={Users}
              title="50k+ Users"
              description="Trust our platform"
            />
          </div>
        </div>
      </div>

      {/* Medical disclaimer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground max-w-lg mx-auto px-4">
          ⚕️ This is not a medical diagnosis. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </section>
  );
}

function TrustIndicator({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
