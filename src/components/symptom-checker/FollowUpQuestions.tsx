import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FollowUpQuestionsProps {
  questions: string[];
  onSubmit: (responses: Record<string, string>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function FollowUpQuestions({
  questions,
  onSubmit,
  onBack,
  isLoading,
}: FollowUpQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleResponse = (response: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion]: response,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onSubmit(responses);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      onBack();
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Follow-up Questions</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-lg font-medium text-foreground">
            {currentQuestion}
          </p>
          <Textarea
            value={responses[currentQuestion] || ""}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Type your answer..."
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handlePrev} disabled={isLoading}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={handleNext}
            disabled={!responses[currentQuestion]?.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : isLastQuestion ? (
              <>
                Complete Assessment
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
