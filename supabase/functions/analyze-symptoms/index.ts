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
    const { symptoms, followUpResponses, naturalLanguageInput } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing symptoms:", symptoms);
    console.log("Natural language input:", naturalLanguageInput);
    console.log("Follow-up responses:", followUpResponses);

    const systemPrompt = `You are an AI health assistant (not a doctor). Your role is to help users understand their symptoms and provide guidance on next steps. You must:

1. NEVER provide medical diagnoses - only suggest possible conditions that warrant professional evaluation
2. Always recommend consulting a healthcare professional for proper diagnosis
3. Be empathetic and clear in your communication
4. Handle both structured symptom lists AND natural language descriptions
5. For common issues like cold, flu, fever - provide helpful routine care advice
6. When symptoms are vague (like "I don't feel well", "something is wrong"), ask clarifying questions

Classify urgency appropriately:
- EMERGENCY: Life-threatening symptoms (chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness)
- URGENT: Symptoms needing same-day medical attention (high fever >103°F, severe pain, worsening symptoms, dehydration)
- ROUTINE: Common symptoms manageable with home care or scheduled appointment (cold, mild fever, headache, minor aches)

For ROUTINE cases, always include practical home remedies and routine care tips like:
- Stay hydrated (drink 8+ glasses of water daily)
- Get adequate rest (7-9 hours of sleep)
- Take over-the-counter medications as appropriate
- Monitor symptoms and their progression

When symptoms are vague, set needsClarification to true and ask about:
- Duration: "How long have you been experiencing this?"
- Location: "Where exactly do you feel discomfort?"
- Severity: "On a scale of 1-10, how severe is it?"
- Associated symptoms: "Are you experiencing any other symptoms?"
- Triggers: "Did anything specific trigger this?"

Respond with a JSON object (no markdown) containing:
{
  "urgencyLevel": "emergency" | "urgent" | "routine",
  "possibleConditions": ["condition1", "condition2", ...],
  "symptomCategories": ["respiratory" | "gastrointestinal" | "cardiac" | "neurological" | "musculoskeletal" | "dermatological" | "general"],
  "followUpQuestions": ["question1", "question2", ...] (max 3-5 questions if symptoms are vague),
  "homeRemedies": ["remedy1", "remedy2", ...] (for routine cases, be specific and actionable),
  "routineCare": ["tip1", "tip2", ...] (general wellness advice),
  "recommendedSpecialist": "General Practitioner" | "Pulmonologist" | "Cardiologist" | "Gastroenterologist" | "Neurologist" | "Emergency Medicine" | "Dermatologist" | "Orthopedist",
  "summary": "Brief empathetic summary of the analysis",
  "precautions": ["precaution1", "precaution2", ...],
  "warningSignsToWatch": ["sign1", "sign2", ...],
  "needsClarification": true/false,
  "clarificationMessage": "Friendly message asking for more details if symptoms are vague"
}`;

    let userMessage = "";
    
    // Handle natural language input
    if (naturalLanguageInput && naturalLanguageInput.trim()) {
      userMessage = `The user describes their health concern in their own words: "${naturalLanguageInput}"

Please analyze this input carefully:
1. Extract any symptoms mentioned (explicit or implied)
2. If the description is vague or unclear, set needsClarification to true and provide helpful follow-up questions
3. Provide appropriate guidance based on what you can understand
4. For common issues like cold, flu, fever - provide specific home remedies`;
    } 
    // Handle structured symptom list
    else if (symptoms && symptoms.length > 0) {
      userMessage = `The user has reported the following symptoms: ${symptoms.join(", ")}

Please analyze these symptoms and provide your assessment. If they seem related to common conditions like cold, flu, or fever, provide specific home remedies and routine care advice.`;
    }
    // Handle both together
    if (naturalLanguageInput && symptoms && symptoms.length > 0) {
      userMessage = `The user has described their condition as: "${naturalLanguageInput}"
Additionally, they selected these specific symptoms: ${symptoms.join(", ")}

Please analyze all this information together.`;
    }

    // Add follow-up responses if provided
    if (followUpResponses && Object.keys(followUpResponses).length > 0) {
      userMessage += `\n\nThe user has provided additional information from follow-up questions:\n`;
      for (const [question, answer] of Object.entries(followUpResponses)) {
        userMessage += `- Question: "${question}"\n  Answer: "${answer}"\n`;
      }
      userMessage += `\nBased on this additional information, provide a more accurate assessment. Set needsClarification to false since we now have more details.`;
    }

    console.log("User message to AI:", userMessage);

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
      
      // Ensure routineCare exists
      if (!analysis.routineCare) {
        analysis.routineCare = [
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Get plenty of rest - aim for 7-9 hours of sleep",
          "Eat nutritious foods to support your immune system",
          "Monitor your symptoms and note any changes"
        ];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide a default response if parsing fails
      analysis = {
        urgencyLevel: "routine",
        possibleConditions: ["Unable to analyze - please provide more details or consult a healthcare professional"],
        symptomCategories: ["general"],
        followUpQuestions: [
          "Can you describe your symptoms in more detail?",
          "When did you first notice these symptoms?",
          "How severe would you rate your discomfort on a scale of 1-10?"
        ],
        homeRemedies: ["Rest and stay hydrated", "Monitor your symptoms"],
        routineCare: [
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Get plenty of rest - aim for 7-9 hours of sleep",
          "Eat nutritious foods to support your immune system"
        ],
        recommendedSpecialist: "General Practitioner",
        summary: "I need more information to provide accurate guidance. Please describe your symptoms in more detail.",
        precautions: ["Seek medical attention if symptoms worsen"],
        warningSignsToWatch: ["Worsening of symptoms", "New symptoms developing"],
        needsClarification: true,
        clarificationMessage: "I'd like to help you better. Could you please describe what you're experiencing in more detail?"
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
