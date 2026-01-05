import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2, Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SYMPTOM_CATEGORIES } from "@/lib/healthData";
import { VOICE_LANGUAGES, LANGUAGE_GROUPS } from "@/lib/voiceLanguages";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface SymptomInputProps {
  symptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  naturalLanguageInput: string;
  onNaturalLanguageChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

// Common health issues for quick selection
const COMMON_HEALTH_ISSUES = [
  { name: "Common Cold", symptoms: ["Runny nose", "Sore throat", "Sneezing", "Cough"] },
  { name: "Fever", symptoms: ["Fever", "Chills", "Body aches", "Fatigue"] },
  { name: "Headache", symptoms: ["Headache", "Sensitivity to light", "Nausea"] },
  { name: "Stomach Upset", symptoms: ["Nausea", "Stomach pain", "Bloating"] },
  { name: "Allergies", symptoms: ["Sneezing", "Runny nose", "Itchy eyes", "Congestion"] },
  { name: "Muscle Pain", symptoms: ["Muscle pain", "Stiffness", "Limited range of motion"] },
];

export function SymptomInput({
  symptoms,
  onSymptomsChange,
  naturalLanguageInput,
  onNaturalLanguageChange,
  onAnalyze,
  isAnalyzing,
}: SymptomInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [languageSearch, setLanguageSearch] = useState("");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: selectedLanguage,
    continuous: true,
    onTranscript: (text) => {
      const trimmed = text.trim();
      if (trimmed) {
        // Append to natural language input for more context
        onNaturalLanguageChange(
          naturalLanguageInput ? `${naturalLanguageInput}. ${trimmed}` : trimmed
        );
        toast({
          title: "Voice input captured",
          description: `"${trimmed}" has been added.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Input Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [isListening, transcript]);

  const allSymptoms = Object.values(SYMPTOM_CATEGORIES).flatMap(
    (cat) => cat.symptoms
  );

  const filteredSuggestions = allSymptoms.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !symptoms.includes(s)
  );

  const filteredLanguages = VOICE_LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const selectedLangInfo = VOICE_LANGUAGES.find((l) => l.code === selectedLanguage);

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
    if (isListening) {
      stopListening();
      if (inputValue.trim() && !symptoms.includes(inputValue.trim())) {
        addSymptom(inputValue);
      }
    } else {
      if (!isSupported) {
        toast({
          title: "Voice Input Not Supported",
          description: "Your browser doesn't support voice input. Try Chrome or Edge.",
          variant: "destructive",
        });
        return;
      }
      startListening();
    }
  };

  const addCommonIssue = (issue: typeof COMMON_HEALTH_ISSUES[0]) => {
    const newSymptoms = issue.symptoms.filter(s => !symptoms.includes(s));
    onSymptomsChange([...symptoms, ...newSymptoms]);
    toast({
      title: `Added ${issue.name} symptoms`,
      description: `${newSymptoms.length} symptoms added`,
    });
  };

  const canAnalyze = symptoms.length > 0 || naturalLanguageInput.trim().length > 0;

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          How are you feeling today?
        </h2>
        <p className="text-muted-foreground">
          Describe your symptoms in your own words or select from the list
        </p>
      </div>

      {/* Natural language input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Describe how you're feeling:
        </label>
        <Textarea
          value={naturalLanguageInput}
          onChange={(e) => onNaturalLanguageChange(e.target.value)}
          placeholder="E.g., I've had a headache for 2 days and feel tired. I also have a mild fever..."
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Be as specific as possible - include duration, severity, and any other details
        </p>
      </div>

      {/* Language selector for voice */}
      <div className="flex items-center justify-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Voice Language:</span>
        <Popover open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[220px] justify-start gap-2">
              <span>{selectedLangInfo?.flag}</span>
              <span className="truncate">{selectedLangInfo?.name || "Select language"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="center">
            <div className="p-2 border-b">
              <Input
                placeholder="Search languages..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {languageSearch ? (
                  <div className="space-y-1">
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLanguageOpen(false);
                          setLanguageSearch("");
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedLanguage === lang.code
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No languages found
                      </p>
                    )}
                  </div>
                ) : (
                  Object.entries(LANGUAGE_GROUPS).map(([group, languages]) => (
                    <div key={group} className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-1">
                        {group}
                      </p>
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLanguage(lang.code);
                              setIsLanguageOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                              selectedLanguage === lang.code
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent"
                            )}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        {/* Voice button */}
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleRecording}
          className={cn("shrink-0 relative", isListening && "animate-pulse")}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
            </>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Voice listening indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary animate-fade-in">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>Listening in {selectedLangInfo?.name}...</span>
        </div>
      )}

      {/* Common health issues */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Common health issues:
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_HEALTH_ISSUES.map((issue) => (
            <Button
              key={issue.name}
              variant="outline"
              size="sm"
              onClick={() => addCommonIssue(issue)}
              className="text-xs"
            >
              {issue.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Add specific symptoms */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Add specific symptoms:
        </p>
        <div className="relative">
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border transition-all",
              "bg-muted/50 border-border focus-within:border-primary"
            )}
          >
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
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addSymptom(inputValue)}
              disabled={!inputValue.trim()}
              className="shrink-0 h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => addSymptom(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
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
        disabled={!canAnalyze || isAnalyzing}
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

      {!canAnalyze && (
        <p className="text-xs text-center text-muted-foreground">
          Please describe your symptoms or select at least one symptom
        </p>
      )}
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
