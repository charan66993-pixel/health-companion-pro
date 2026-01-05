export interface SymptomAnalysis {
  urgencyLevel: "emergency" | "urgent" | "routine";
  possibleConditions: string[];
  symptomCategories: string[];
  followUpQuestions: string[];
  homeRemedies: string[];
  recommendedSpecialist: string;
  summary: string;
  precautions: string[];
  warningSignsToWatch: string[];
}

export interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  years_experience: number | null;
  consultation_fee: number | null;
  is_available: boolean | null;
  available_slots: Record<string, string[]> | null;
  rating: number | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  session_id: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  symptoms_summary: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SymptomSession {
  id: string;
  user_id: string;
  symptoms: string[];
  symptom_categories: string[] | null;
  ai_analysis: SymptomAnalysis | null;
  urgency_level: "emergency" | "urgent" | "routine" | null;
  possible_conditions: string[] | null;
  recommended_specialist: string | null;
  home_remedies: string[] | null;
  follow_up_questions: string[] | null;
  user_responses: Record<string, string> | null;
  status: "active" | "completed" | "emergency";
  created_at: string;
  updated_at: string;
}
