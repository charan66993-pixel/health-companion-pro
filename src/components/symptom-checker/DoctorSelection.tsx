import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Star, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Doctor } from "@/types/health";
import { cn } from "@/lib/utils";

interface DoctorSelectionProps {
  doctors: Doctor[];
  recommendedSpecialty: string;
  onSelect: (doctor: Doctor, date: string, time: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function DoctorSelection({
  doctors,
  recommendedSpecialty,
  onSelect,
  onBack,
  isLoading,
}: DoctorSelectionProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Filter doctors by recommended specialty
  const filteredDoctors = doctors.filter(
    (d) =>
      d.specialty.toLowerCase().includes(recommendedSpecialty.toLowerCase()) ||
      recommendedSpecialty.toLowerCase().includes(d.specialty.toLowerCase()) ||
      d.specialty === "General Practitioner"
  );

  // Get next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return days;
  };

  const getAvailableSlots = (doctor: Doctor, dateStr: string) => {
    if (!doctor.available_slots) return [];
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return (doctor.available_slots as Record<string, string[]>)[dayName] || [];
  };

  const handleBooking = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      onSelect(selectedDoctor, selectedDate, selectedTime);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Book Appointment</h2>
          <p className="text-muted-foreground">
            Recommended: {recommendedSpecialty}
          </p>
        </div>
      </div>

      {/* Doctor Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Select a Doctor</h3>
        <div className="grid gap-4">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              variant={selectedDoctor?.id === doctor.id ? "outline" : "interactive"}
              className={cn(
                "cursor-pointer",
                selectedDoctor?.id === doctor.id && "border-primary border-2"
              )}
              onClick={() => {
                setSelectedDoctor(doctor);
                setSelectedDate("");
                setSelectedTime("");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{doctor.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                      {selectedDoctor?.id === doctor.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {doctor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                      )}
                      {doctor.years_experience && (
                        <span className="text-sm text-muted-foreground">
                          {doctor.years_experience} years exp.
                        </span>
                      )}
                      {doctor.consultation_fee && (
                        <Badge variant="secondary">
                          ${doctor.consultation_fee}
                        </Badge>
                      )}
                    </div>
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      {selectedDoctor && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Select Date
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getNextDays().map((day) => (
              <button
                key={day.date}
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedTime("");
                }}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border min-w-[70px] transition-all",
                  selectedDate === day.date
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary"
                )}
              >
                <span className="text-xs uppercase">{day.day}</span>
                <span className="text-xl font-bold">{day.dayNum}</span>
                <span className="text-xs">{day.month}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time Selection */}
      {selectedDoctor && selectedDate && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-medium flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Select Time
          </h3>
          <div className="flex flex-wrap gap-2">
            {getAvailableSlots(selectedDoctor, selectedDate).length > 0 ? (
              getAvailableSlots(selectedDoctor, selectedDate).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "px-4 py-2 rounded-lg border transition-all",
                    selectedTime === time
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary"
                  )}
                >
                  {time}
                </button>
              ))
            ) : (
              <p className="text-muted-foreground">
                No available slots for this date. Please select another date.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirm Button */}
      {selectedDoctor && selectedDate && selectedTime && (
        <Button
          variant="hero"
          size="lg"
          className="w-full animate-fade-in"
          onClick={handleBooking}
          disabled={isLoading}
        >
          {isLoading ? "Booking..." : "Confirm Appointment"}
        </Button>
      )}
    </div>
  );
}
