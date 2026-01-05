import { useState } from "react";
import { Navigate } from "react-router-dom";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import {
  Activity,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Heart,
  Brain,
  Pill,
  Thermometer,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SymptomSession, SymptomAnalysis } from "@/types/health";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const URGENCY_COLORS = {
  emergency: "#ef4444",
  urgent: "#f97316",
  routine: "#22c55e",
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  respiratory: Activity,
  cardiac: Heart,
  neurological: Brain,
  gastrointestinal: Pill,
  general: Thermometer,
};

export default function HealthHistory() {
  const { user, loading } = useAuth();
  const [selectedSession, setSelectedSession] = useState<SymptomSession | null>(null);

  // Fetch symptom sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["symptom-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("symptom_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Map the data to match our SymptomSession type
      return (data || []).map((session: any) => ({
        ...session,
        ai_analysis: session.ai_analysis as SymptomAnalysis | null,
        user_responses: session.user_responses as Record<string, string> | null,
      })) as SymptomSession[];
    },
    enabled: !!user,
  });

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Calculate statistics
  const totalSessions = sessions.length;
  const emergencyCount = sessions.filter((s) => s.urgency_level === "emergency").length;
  const urgentCount = sessions.filter((s) => s.urgency_level === "urgent").length;
  const routineCount = sessions.filter((s) => s.urgency_level === "routine").length;

  // Get symptom frequency
  const symptomFrequency = sessions.reduce((acc, session) => {
    session.symptoms.forEach((symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get category distribution
  const categoryDistribution = sessions.reduce((acc, session) => {
    (session.symptom_categories || []).forEach((category) => {
      acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const PIE_COLORS = ["#14b8a6", "#3b82f6", "#ef4444", "#8b5cf6", "#f97316", "#22c55e"];

  // Sessions over time (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const sessionsOverTime = last30Days.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const count = sessions.filter(
      (s) => format(new Date(s.created_at), "yyyy-MM-dd") === dateStr
    ).length;
    return {
      date: format(date, "MMM dd"),
      sessions: count,
    };
  });

  // Urgency distribution for bar chart
  const urgencyData = [
    { name: "Emergency", count: emergencyCount, fill: URGENCY_COLORS.emergency },
    { name: "Urgent", count: urgentCount, fill: URGENCY_COLORS.urgent },
    { name: "Routine", count: routineCount, fill: URGENCY_COLORS.routine },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health History</h1>
            <p className="text-muted-foreground mt-2">
              Track your symptom patterns and health trends over time
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-4">Loading health history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Health Records Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking your symptoms to see your health history and trends.
                </p>
                <Button variant="hero" onClick={() => (window.location.href = "/symptom-checker")}>
                  Start Symptom Check
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalSessions}</p>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="emergency" className="border-destructive/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{emergencyCount}</p>
                        <p className="text-sm text-muted-foreground">Emergency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="urgent" className="border-urgent/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-urgent/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-urgent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{urgentCount}</p>
                        <p className="text-sm text-muted-foreground">Urgent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="success" className="border-success/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{routineCount}</p>
                        <p className="text-sm text-muted-foreground">Routine</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different views */}
              <Tabs defaultValue="trends" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-6">
                  {/* Sessions Over Time Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Sessions Over Time (Last 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sessionsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sessions"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Urgency Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Urgency Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={urgencyData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {urgencyData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Symptom Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                          {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1 text-xs">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                              {entry.name}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Sessions Tab */}
                <TabsContent value="sessions" className="space-y-4">
                  {sessions.map((session) => (
                    <Card
                      key={session.id}
                      variant="interactive"
                      className="cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full",
                                session.urgency_level === "emergency" && "bg-destructive",
                                session.urgency_level === "urgent" && "bg-urgent",
                                session.urgency_level === "routine" && "bg-success"
                              )}
                            />
                            <div>
                              <p className="font-medium">
                                {session.symptoms.slice(0, 3).join(", ")}
                                {session.symptoms.length > 3 && ` +${session.symptoms.length - 3} more`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(session.created_at), "PPP 'at' p")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              className={cn(
                                session.urgency_level === "emergency" && "bg-destructive",
                                session.urgency_level === "urgent" && "bg-urgent",
                                session.urgency_level === "routine" && "bg-success"
                              )}
                            >
                              {session.urgency_level}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  {/* Top Symptoms */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Frequent Symptoms</CardTitle>
                      <CardDescription>
                        Symptoms you've reported most often
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topSymptoms.map(([symptom, count], index) => (
                          <div key={symptom} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{symptom}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} times
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(count / topSymptoms[0][1]) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalized Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {emergencyCount > 0 && (
                        <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                          <h4 className="font-medium text-destructive mb-1">
                            Emergency Sessions Detected
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            You've had {emergencyCount} emergency-level symptom session(s). 
                            Consider discussing these patterns with your primary care physician.
                          </p>
                        </div>
                      )}

                      {topSymptoms.length > 0 && (
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                          <h4 className="font-medium text-primary mb-1">
                            Recurring Symptom Pattern
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            "{topSymptoms[0][0]}" is your most frequently reported symptom. 
                            If this persists, consider scheduling a consultation with a specialist.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                        <h4 className="font-medium text-success mb-1">
                          Keep Tracking
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Regular symptom tracking helps identify patterns and enables 
                          more informed conversations with healthcare providers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Session Detail Modal */}
              {selectedSession && (
                <div
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedSession(null)}
                >
                  <Card
                    className="max-w-lg w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Session Details</CardTitle>
                        <Badge
                          className={cn(
                            selectedSession.urgency_level === "emergency" && "bg-destructive",
                            selectedSession.urgency_level === "urgent" && "bg-urgent",
                            selectedSession.urgency_level === "routine" && "bg-success"
                          )}
                        >
                          {selectedSession.urgency_level}
                        </Badge>
                      </div>
                      <CardDescription>
                        {format(new Date(selectedSession.created_at), "PPP 'at' p")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Symptoms Reported</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSession.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedSession.possible_conditions && selectedSession.possible_conditions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Possible Conditions</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSession.possible_conditions.map((condition) => (
                              <Badge key={condition} variant="outline">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedSession.recommended_specialist && (
                        <div>
                          <h4 className="font-medium mb-2">Recommended Specialist</h4>
                          <p className="text-muted-foreground">
                            {selectedSession.recommended_specialist}
                          </p>
                        </div>
                      )}

                      {selectedSession.home_remedies && selectedSession.home_remedies.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Home Remedies</h4>
                          <ul className="space-y-1">
                            {selectedSession.home_remedies.map((remedy, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                {remedy}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedSession(null)}
                      >
                        Close
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
