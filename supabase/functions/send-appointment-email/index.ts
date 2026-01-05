import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentEmailRequest {
  userEmail: string;
  userName: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send appointment email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { 
      userEmail, 
      userName, 
      doctorName, 
      specialty, 
      appointmentDate, 
      appointmentTime,
      reason 
    }: AppointmentEmailRequest = await req.json();

    console.log("Sending appointment confirmation to:", userEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f0f9f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .appointment-card { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .detail-row { display: flex; margin: 10px 0; }
          .label { color: #64748b; width: 120px; font-weight: 500; }
          .value { color: #1e293b; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { color: #0d9488; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Great news! Your appointment has been successfully scheduled. Here are the details:</p>
            
            <div class="appointment-card">
              <h2 style="margin: 0 0 15px 0;">Appointment Details</h2>
              <div class="detail-row">
                <span class="label">Doctor:</span>
                <span class="value">${doctorName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Specialty:</span>
                <span class="value">${specialty}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${appointmentDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${appointmentTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Reason:</span>
                <span class="value">${reason}</span>
              </div>
            </div>
            
            <p><strong>Reminder:</strong> Please arrive 10-15 minutes before your scheduled time.</p>
            
            <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            
            <div class="footer">
              <p>Thank you for choosing HealthCheck for your healthcare needs.</p>
              <p style="color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HealthCheck <onboarding@resend.dev>",
        to: [userEmail],
        subject: "Your Appointment is Confirmed!",
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending appointment email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
