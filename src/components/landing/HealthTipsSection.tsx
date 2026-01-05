import { Card, CardContent } from "@/components/ui/card";
import { 
  Droplets, 
  Moon, 
  Apple, 
  Footprints, 
  Heart, 
  Sun,
  Leaf,
  Smile
} from "lucide-react";

const healthTips = [
  {
    icon: Droplets,
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain optimal body function",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Moon,
    title: "Quality Sleep",
    description: "Aim for 7-9 hours of sleep each night for better health and immunity",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    icon: Apple,
    title: "Balanced Diet",
    description: "Include fruits, vegetables, and whole grains in your daily meals",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Footprints,
    title: "Regular Exercise",
    description: "Get at least 30 minutes of physical activity most days of the week",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Heart,
    title: "Heart Health",
    description: "Monitor your blood pressure and cholesterol levels regularly",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Sun,
    title: "Vitamin D",
    description: "Get 10-15 minutes of sunlight daily for natural vitamin D",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: Leaf,
    title: "Stress Management",
    description: "Practice mindfulness, meditation, or deep breathing exercises",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    icon: Smile,
    title: "Mental Wellness",
    description: "Stay connected with loved ones and seek help when needed",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
];

export function HealthTipsSection() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Daily Health Tips
          </h2>
          <p className="text-muted-foreground">
            Simple habits for a healthier lifestyle
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthTips.map((tip, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-md transition-all duration-300 border-none"
            >
              <CardContent className="p-4 text-center">
                <div className={`${tip.bgColor} ${tip.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <tip.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {tip.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
