import { AlertTriangle, CheckCircle, Clock, Phone, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SymptomAnalysis } from "@/types/health";
import { URGENCY_LEVELS } from "@/lib/healthData";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  analysis: SymptomAnalysis;
  onBookAppointment: () => void;
  onStartOver: () => void;
}

export function AnalysisResult({
  analysis,
  onBookAppointment,
  onStartOver,
}: AnalysisResultProps) {
  const urgencyConfig = URGENCY_LEVELS[analysis.urgencyLevel];

  // Emergency screen
  if (analysis.urgencyLevel === "emergency") {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card variant="emergency" className="overflow-hidden">
          <div className="bg-gradient-emergency p-6 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-destructive-foreground mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-destructive-foreground mb-2">
              Emergency Alert
            </h2>
            <p className="text-destructive-foreground/90">
              Based on your symptoms, you should seek immediate medical attention
            </p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-foreground">{analysis.summary}</p>
              <div className="flex justify-center gap-4">
                <Button variant="emergency" size="xl" asChild>
                  <a href="tel:911">
                    <Phone className="w-5 h-5" />
                    Call 911
                  </a>
                </Button>
              </div>
            </div>

            <div className="p-4 bg-destructive/10 rounded-xl">
              <h3 className="font-semibold mb-3 text-destructive">
                Warning Signs to Watch
              </h3>
              <ul className="space-y-2">
                {analysis.warningSignsToWatch.map((sign, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" className="w-full" onClick={onStartOver}>
              Start New Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Urgency Banner */}
      <Card
        variant={analysis.urgencyLevel === "urgent" ? "urgent" : "success"}
        className="overflow-hidden"
      >
        <div className={cn("p-6", urgencyConfig.bgClass)}>
          <div className="flex items-center gap-4">
            {analysis.urgencyLevel === "urgent" ? (
              <Clock className="w-10 h-10 text-urgent-foreground" />
            ) : (
              <CheckCircle className="w-10 h-10 text-success-foreground" />
            )}
            <div>
              <h2 className={cn("text-xl font-bold", urgencyConfig.textClass)}>
                {urgencyConfig.title}
              </h2>
              <p className={cn("text-sm opacity-90", urgencyConfig.textClass)}>
                {urgencyConfig.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Possible Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.possibleConditions.map((condition, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1.5">
                {condition}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            ⚕️ These are possible conditions, not a diagnosis. Please consult a healthcare professional.
          </p>
        </CardContent>
      </Card>

      {/* Home Remedies (for routine cases) */}
      {analysis.urgencyLevel === "routine" && analysis.homeRemedies.length > 0 && (
        <Card variant="success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Home Remedies & Self-Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.homeRemedies.map((remedy, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-success">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-foreground">{remedy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Precautions */}
      {analysis.precautions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Precautions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.precautions.map((precaution, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {precaution}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warning Signs */}
      {analysis.warningSignsToWatch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Watch For These Warning Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Seek medical attention if you experience:
            </p>
            <ul className="space-y-2">
              {analysis.warningSignsToWatch.map((sign, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                  {sign}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Specialist */}
      <Card variant="interactive" onClick={onBookAppointment}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Specialist</p>
                <h3 className="text-lg font-semibold">{analysis.recommendedSpecialist}</h3>
              </div>
            </div>
            <Button variant="hero">
              Book Appointment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onStartOver}>
          Start New Assessment
        </Button>
      </div>

      {/* Medical Disclaimer */}
      <p className="text-xs text-muted-foreground text-center p-4 bg-muted/50 rounded-xl">
        ⚕️ <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and 
        is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the 
        advice of your physician or other qualified health provider with any questions you may have 
        regarding a medical condition.
      </p>
    </div>
  );
}
