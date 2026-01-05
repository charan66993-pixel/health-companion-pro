import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SYMPTOM_CATEGORIES } from "@/lib/healthData";
import { cn } from "@/lib/utils";

interface SymptomInputProps {
  symptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function SymptomInput({
  symptoms,
  onSymptomsChange,
  onAnalyze,
  isAnalyzing,
}: SymptomInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allSymptoms = Object.values(SYMPTOM_CATEGORIES).flatMap(
    (cat) => cat.symptoms
  );

  const filteredSuggestions = allSymptoms.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !symptoms.includes(s)
  );

  const addSymptom = (symptom: string) => {
    const trimmed = symptom.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      onSymptomsChange([...symptoms, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeSymptom = (symptom: string) => {
    onSymptomsChange(symptoms.filter((s) => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSymptom(inputValue);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulated voice recording - in production, use Web Speech API
      setTimeout(() => {
        setIsRecording(false);
        addSymptom("Headache"); // Simulated transcription
      }, 2000);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          How are you feeling today?
        </h2>
        <p className="text-muted-foreground">
          Describe your symptoms or select from common options below
        </p>
      </div>

      {/* Input area */}
      <div className="relative">
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-xl border border-border focus-within:border-primary transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type a symptom..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className="shrink-0"
          >
            {isRecording ? (
              <MicOff className="w-5 h-5 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addSymptom(inputValue)}
            disabled={!inputValue.trim()}
            className="shrink-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 6).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addSymptom(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected symptoms */}
      {symptoms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <Badge
              key={symptom}
              variant="secondary"
              className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => removeSymptom(symptom)}
            >
              {symptom}
              <span className="ml-2">×</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Quick symptom categories */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          Or select from categories:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(SYMPTOM_CATEGORIES).map(([key, category]) => (
            <CategoryButton
              key={key}
              category={category}
              selectedSymptoms={symptoms}
              onAddSymptom={addSymptom}
            />
          ))}
        </div>
      </div>

      {/* Analyze button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={onAnalyze}
        disabled={symptoms.length === 0 || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Symptoms...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Analyze My Symptoms
          </>
        )}
      </Button>
    </Card>
  );
}

function CategoryButton({
  category,
  selectedSymptoms,
  onAddSymptom,
}: {
  category: (typeof SYMPTOM_CATEGORIES)[keyof typeof SYMPTOM_CATEGORIES];
  selectedSymptoms: string[];
  onAddSymptom: (symptom: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = category.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 p-3 rounded-xl border transition-all",
          isOpen
            ? "bg-accent border-primary"
            : "bg-card border-border hover:border-primary/50"
        )}
      >
        <div className={cn("p-2 rounded-lg", category.bgColor)}>
          <Icon className={cn("w-4 h-4", category.color)} />
        </div>
        <span className="text-sm font-medium">{category.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-20 p-2 max-h-48 overflow-y-auto">
          {category.symptoms.map((symptom) => (
            <button
              key={symptom}
              onClick={() => {
                onAddSymptom(symptom);
                setIsOpen(false);
              }}
              disabled={selectedSymptoms.includes(symptom)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors",
                selectedSymptoms.includes(symptom)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent"
              )}
            >
              {symptom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
