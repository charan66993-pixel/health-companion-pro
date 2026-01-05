import { Navigate } from "react-router-dom";
import { Calendar, Clock, User, X, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Appointments() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments with doctor info
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors (
            full_name,
            specialty,
            phone,
            email
          )
        `)
        .eq("user_id", user!.id)
        .order("appointment_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(a.appointment_date) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === "cancelled" || new Date(a.appointment_date) < new Date()
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-2">
              Manage your upcoming and past medical appointments
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-4">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start a symptom check to get recommendations and book appointments.
                </p>
                <Button variant="hero" onClick={() => window.location.href = "/symptom-checker"}>
                  Start Symptom Check
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Upcoming Appointments */}
              {upcomingAppointments.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Upcoming Appointments
                  </h2>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id} variant="elevated">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                👨‍⚕️
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {(appointment.doctors as any)?.full_name || "Doctor"}
                                </h3>
                                <p className="text-muted-foreground">
                                  {(appointment.doctors as any)?.specialty}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {appointment.appointment_time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(appointment.status)}
                              {appointment.status !== "cancelled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => cancelMutation.mutate(appointment.id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                          {appointment.reason && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground">
                                <strong>Reason:</strong> {appointment.reason}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Past/Cancelled Appointments */}
              {pastAppointments.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Past Appointments
                  </h2>
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <Card key={appointment.id} className="opacity-70">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                                👨‍⚕️
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {(appointment.doctors as any)?.full_name || "Doctor"}
                                </h3>
                                <p className="text-muted-foreground">
                                  {(appointment.doctors as any)?.specialty}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(appointment.appointment_date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    {appointment.appointment_time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
