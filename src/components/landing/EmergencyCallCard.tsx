import { Phone, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmergencyCallCard() {
  const emergencyNumber = "911"; // US emergency number - can be made configurable

  const handleEmergencyCall = () => {
    window.location.href = `tel:${emergencyNumber}`;
  };

  return (
    <Card variant="emergency" className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full animate-pulse">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Emergency?</h3>
                <p className="text-red-100 text-sm">
                  Call emergency services immediately
                </p>
              </div>
            </div>
            <Button
              onClick={handleEmergencyCall}
              size="lg"
              className="bg-white text-red-600 hover:bg-red-50 font-bold gap-2 shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Call {emergencyNumber}
            </Button>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 px-6 py-3">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>When to call:</strong> Chest pain, difficulty breathing, severe bleeding, 
            stroke symptoms, loss of consciousness, or any life-threatening situation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
