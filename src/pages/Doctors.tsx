import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Star, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Pill,
  User,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react";
import { format, addDays } from "date-fns";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  rating: number | null;
  years_experience: number | null;
  consultation_fee: number | null;
  available_slots: Record<string, string[]> | null;
  email: string | null;
  phone: string | null;
  is_available: boolean | null;
}

const specialtyIcons: Record<string, React.ReactNode> = {
  "General Practitioner": <Stethoscope className="h-5 w-5" />,
  "Cardiologist": <Heart className="h-5 w-5" />,
  "Neurologist": <Brain className="h-5 w-5" />,
  "Pulmonologist": <Activity className="h-5 w-5" />,
  "Gastroenterologist": <Pill className="h-5 w-5" />,
};

const specialtyColors: Record<string, string> = {
  "General Practitioner": "bg-blue-100 text-blue-800",
  "Cardiologist": "bg-red-100 text-red-800",
  "Neurologist": "bg-purple-100 text-purple-800",
  "Pulmonologist": "bg-cyan-100 text-cyan-800",
  "Gastroenterologist": "bg-green-100 text-green-800",
};

export default function Doctors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [isBooking, setIsBooking] = useState(false);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data as Doctor[];
    },
  });

  const specialties = doctors 
    ? [...new Set(doctors.map(d => d.specialty))]
    : [];

  const filteredDoctors = doctors?.filter(d => 
    filterSpecialty === "all" || d.specialty === filterSpecialty
  ) || [];

  const getDayName = (date: Date): string => {
    return format(date, 'EEEE').toLowerCase();
  };

  const getAvailableSlots = (doctor: Doctor, date: Date): string[] => {
    if (!doctor.available_slots) return [];
    const dayName = getDayName(date);
    return (doctor.available_slots as Record<string, string[]>)[dayName] || [];
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book an appointment.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        doctor_id: selectedDoctor.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        status: 'scheduled',
        reason: `Consultation with ${selectedDoctor.specialty}`,
      });

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-appointment-email', {
          body: {
            userEmail: user.email,
            doctorName: selectedDoctor.full_name,
            specialty: selectedDoctor.specialty,
            appointmentDate: format(selectedDate, 'MMMM d, yyyy'),
            appointmentTime: selectedTime,
          },
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      toast({
        title: "Appointment booked!",
        description: `Your appointment with ${selectedDoctor.full_name} is confirmed for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}.`,
      });

      setSelectedDoctor(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Our Doctors</h1>
          <p className="text-muted-foreground">
            Find and book appointments with our experienced healthcare professionals
          </p>
        </div>

        {/* Specialty Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterSpecialty === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterSpecialty("all")}
          >
            All Specialties
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              variant={filterSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSpecialty(specialty)}
              className="flex items-center gap-2"
            >
              {specialtyIcons[specialty] || <User className="h-4 w-4" />}
              {specialty}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className={`transition-all hover:shadow-lg cursor-pointer ${
                  selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setSelectedDate(undefined);
                  setSelectedTime(null);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                      <Badge className={`mt-1 ${specialtyColors[doctor.specialty] || 'bg-gray-100 text-gray-800'}`}>
                        {doctor.specialty}
                      </Badge>
                    </div>
                    {doctor.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {doctor.bio}
                  </p>
                  <div className="space-y-2 text-sm">
                    {doctor.years_experience && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Stethoscope className="h-4 w-4" />
                        <span>{doctor.years_experience} years experience</span>
                      </div>
                    )}
                    {doctor.consultation_fee && (
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>${doctor.consultation_fee} consultation fee</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoctor(doctor);
                    }}
                  >
                    Book Appointment
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Book Appointment</CardTitle>
                    <CardDescription>
                      with {selectedDoctor.full_name}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(null);
                      setSelectedDate(undefined);
                      setSelectedTime(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{selectedDoctor.full_name}</p>
                    <Badge className={specialtyColors[selectedDoctor.specialty] || ''}>
                      {selectedDoctor.specialty}
                    </Badge>
                    {selectedDoctor.consultation_fee && (
                      <p className="text-primary font-semibold mt-2">
                        Consultation Fee: ${selectedDoctor.consultation_fee}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Select Date
                  </label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = addDays(today, 30);
                      return date < today || date > maxDate || 
                        getAvailableSlots(selectedDoctor, date).length === 0;
                    }}
                    className="rounded-md border"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Select Time for {format(selectedDate, 'MMMM d, yyyy')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAvailableSlots(selectedDoctor, selectedDate).map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                    {getAvailableSlots(selectedDoctor, selectedDate).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!selectedDate || !selectedTime || isBooking}
                  onClick={handleBookAppointment}
                >
                  {isBooking ? "Booking..." : "Confirm Appointment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
