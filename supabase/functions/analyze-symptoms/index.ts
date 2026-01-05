import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, followUpResponses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing symptoms:", symptoms);
    console.log("Follow-up responses:", followUpResponses);

    const systemPrompt = `You are an AI health assistant (not a doctor). Your role is to help users understand their symptoms and provide guidance on next steps. You must:

1. NEVER provide medical diagnoses - only suggest possible conditions that warrant professional evaluation
2. Always recommend consulting a healthcare professional for proper diagnosis
3. Be empathetic and clear in your communication
4. Classify urgency appropriately:
   - EMERGENCY: Life-threatening symptoms (chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness)
   - URGENT: Symptoms needing same-day medical attention (high fever, severe pain, worsening symptoms)
   - ROUTINE: Common symptoms manageable with home care or scheduled appointment

Respond with a JSON object (no markdown) containing:
{
  "urgencyLevel": "emergency" | "urgent" | "routine",
  "possibleConditions": ["condition1", "condition2", ...],
  "symptomCategories": ["respiratory" | "gastrointestinal" | "cardiac" | "neurological" | "musculoskeletal" | "dermatological" | "general"],
  "followUpQuestions": ["question1", "question2", ...] (max 3 questions if symptoms are vague),
  "homeRemedies": ["remedy1", "remedy2", ...] (only for routine cases),
  "recommendedSpecialist": "General Practitioner" | "Pulmonologist" | "Cardiologist" | "Gastroenterologist" | "Neurologist" | "Emergency Medicine" | "Dermatologist" | "Orthopedist",
  "summary": "Brief empathetic summary of the analysis",
  "precautions": ["precaution1", "precaution2", ...],
  "warningSignsToWatch": ["sign1", "sign2", ...]
}`;

    const userMessage = followUpResponses 
      ? `Initial symptoms: ${symptoms.join(", ")}\n\nAdditional information from follow-up questions:\n${JSON.stringify(followUpResponses, null, 2)}\n\nPlease provide your analysis based on all this information.`
      : `The user reports the following symptoms: ${symptoms.join(", ")}\n\nAnalyze these symptoms and provide your assessment. If the symptoms are vague or need clarification, include follow-up questions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI response:", content);

    // Parse the JSON response, handling potential markdown code blocks
    let analysis;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide a default response if parsing fails
      analysis = {
        urgencyLevel: "routine",
        possibleConditions: ["Unable to analyze - please consult a healthcare professional"],
        symptomCategories: ["general"],
        followUpQuestions: [],
        homeRemedies: ["Rest", "Stay hydrated", "Monitor symptoms"],
        recommendedSpecialist: "General Practitioner",
        summary: "I couldn't fully analyze your symptoms. Please consult with a healthcare professional for proper evaluation.",
        precautions: ["Seek medical attention if symptoms worsen"],
        warningSignsToWatch: ["Worsening of symptoms", "New symptoms developing"],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-symptoms function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
