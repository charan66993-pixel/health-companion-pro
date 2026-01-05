import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SymptomInput } from "@/components/symptom-checker/SymptomInput";
import { FollowUpQuestions } from "@/components/symptom-checker/FollowUpQuestions";
import { AnalysisResult } from "@/components/symptom-checker/AnalysisResult";
import { DoctorSelection } from "@/components/symptom-checker/DoctorSelection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SymptomAnalysis, Doctor } from "@/types/health";
import { useQuery } from "@tanstack/react-query";

type Step = "input" | "followup" | "result" | "booking";

export default function SymptomChecker() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("input");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_available", true);
      if (error) throw error;
      return data as Doctor[];
    },
  });

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const analyzeSymptoms = async (followUpResponses?: Record<string, string>) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms, followUpResponses },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult = data as SymptomAnalysis;
      setAnalysis(analysisResult);

      // If there are follow-up questions and no responses yet, show follow-up step
      if (
        analysisResult.followUpQuestions &&
        analysisResult.followUpQuestions.length > 0 &&
        !followUpResponses
      ) {
        setStep("followup");
      } else {
        setStep("result");
        
        // Save session to database
        await supabase.from("symptom_sessions").insert({
          user_id: user!.id,
          symptoms,
          symptom_categories: analysisResult.symptomCategories,
          ai_analysis: analysisResult as any,
          urgency_level: analysisResult.urgencyLevel,
          possible_conditions: analysisResult.possibleConditions,
          recommended_specialist: analysisResult.recommendedSpecialist,
          home_remedies: analysisResult.homeRemedies,
          follow_up_questions: analysisResult.followUpQuestions,
          user_responses: followUpResponses || null,
          status: analysisResult.urgencyLevel === "emergency" ? "emergency" : "completed",
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookAppointment = async (doctor: Doctor, date: string, time: string) => {
    setIsBooking(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: user!.id,
        doctor_id: doctor.id,
        appointment_date: date,
        appointment_time: time,
        reason: `Symptom check: ${symptoms.join(", ")}`,
        symptoms_summary: analysis?.summary || "",
        status: "confirmed",
      });

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${doctor.full_name} is confirmed for ${date} at ${time}.`,
      });

      navigate("/appointments");
    } catch (err) {
      console.error("Booking error:", err);
      toast({
        title: "Booking Failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleStartOver = () => {
    setSymptoms([]);
    setAnalysis(null);
    setStep("input");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24 max-w-2xl">
        {step === "input" && (
          <SymptomInput
            symptoms={symptoms}
            onSymptomsChange={setSymptoms}
            onAnalyze={() => analyzeSymptoms()}
            isAnalyzing={isAnalyzing}
          />
        )}

        {step === "followup" && analysis?.followUpQuestions && (
          <FollowUpQuestions
            questions={analysis.followUpQuestions}
            onSubmit={(responses) => analyzeSymptoms(responses)}
            onBack={() => setStep("input")}
            isLoading={isAnalyzing}
          />
        )}

        {step === "result" && analysis && (
          <AnalysisResult
            analysis={analysis}
            onBookAppointment={() => setStep("booking")}
            onStartOver={handleStartOver}
          />
        )}

        {step === "booking" && analysis && (
          <DoctorSelection
            doctors={doctors}
            recommendedSpecialty={analysis.recommendedSpecialist}
            onSelect={handleBookAppointment}
            onBack={() => setStep("result")}
            isLoading={isBooking}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
