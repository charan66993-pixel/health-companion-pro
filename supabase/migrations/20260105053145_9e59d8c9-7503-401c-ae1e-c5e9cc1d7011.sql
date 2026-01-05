-- Create profiles table for patient information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[],
  medical_conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create symptom_sessions table to store symptom check sessions
CREATE TABLE public.symptom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  symptom_categories TEXT[],
  ai_analysis JSONB,
  urgency_level TEXT CHECK (urgency_level IN ('emergency', 'urgent', 'routine')),
  possible_conditions TEXT[],
  recommended_specialist TEXT,
  home_remedies TEXT[],
  follow_up_questions TEXT[],
  user_responses JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on symptom_sessions
ALTER TABLE public.symptom_sessions ENABLE ROW LEVEL SECURITY;

-- Symptom sessions RLS policies
CREATE POLICY "Users can view their own sessions" ON public.symptom_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.symptom_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.symptom_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  years_experience INTEGER,
  consultation_fee DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  available_slots JSONB,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on doctors (public read)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.symptom_sessions(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  symptoms_summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments RLS policies
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_symptom_sessions_updated_at BEFORE UPDATE ON public.symptom_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample doctors
INSERT INTO public.doctors (full_name, specialty, email, phone, bio, years_experience, consultation_fee, rating, available_slots) VALUES
('Dr. Sarah Mitchell', 'General Practitioner', 'sarah.mitchell@healthai.com', '+1-555-0101', 'Board-certified family medicine physician with expertise in preventive care and chronic disease management.', 15, 75.00, 4.9, '{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "tuesday": ["09:00", "10:00", "14:00", "15:00", "16:00"], "wednesday": ["10:00", "11:00", "14:00"], "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "friday": ["09:00", "10:00", "11:00"]}'),
('Dr. James Chen', 'Pulmonologist', 'james.chen@healthai.com', '+1-555-0102', 'Specialist in respiratory diseases, asthma, COPD, and sleep disorders. Harvard Medical School graduate.', 12, 150.00, 4.8, '{"monday": ["10:00", "11:00", "14:00"], "tuesday": ["09:00", "10:00", "11:00"], "wednesday": ["14:00", "15:00", "16:00"], "thursday": ["10:00", "11:00"], "friday": ["09:00", "10:00", "14:00", "15:00"]}'),
('Dr. Emily Rodriguez', 'Cardiologist', 'emily.rodriguez@healthai.com', '+1-555-0103', 'Interventional cardiologist specializing in heart disease prevention and treatment. 20+ years of experience.', 20, 200.00, 4.95, '{"monday": ["09:00", "10:00"], "tuesday": ["14:00", "15:00", "16:00"], "wednesday": ["09:00", "10:00", "11:00"], "thursday": ["14:00", "15:00"], "friday": ["10:00", "11:00"]}'),
('Dr. Michael Thompson', 'Gastroenterologist', 'michael.thompson@healthai.com', '+1-555-0104', 'Expert in digestive system disorders, including IBS, Crohn''s disease, and liver conditions.', 10, 175.00, 4.7, '{"monday": ["14:00", "15:00", "16:00"], "tuesday": ["09:00", "10:00", "11:00", "14:00"], "wednesday": ["09:00", "10:00"], "thursday": ["14:00", "15:00", "16:00"], "friday": ["09:00", "10:00", "11:00", "14:00"]}'),
('Dr. Lisa Patel', 'Neurologist', 'lisa.patel@healthai.com', '+1-555-0105', 'Neurologist specializing in headaches, migraines, seizures, and neurodegenerative diseases.', 14, 185.00, 4.85, '{"monday": ["09:00", "10:00", "11:00"], "tuesday": ["14:00", "15:00"], "wednesday": ["09:00", "10:00", "14:00", "15:00"], "thursday": ["10:00", "11:00"], "friday": ["14:00", "15:00", "16:00"]}'),
('Dr. Robert Kim', 'Emergency Medicine', 'robert.kim@healthai.com', '+1-555-0106', 'Emergency medicine specialist available for urgent consultations and emergency triage guidance.', 18, 250.00, 4.9, '{"monday": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"], "tuesday": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"], "wednesday": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"], "thursday": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"], "friday": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]}');