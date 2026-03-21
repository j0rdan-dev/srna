import { useState, useEffect, useRef, useCallback } from "react";
import { QuizQuestion, OptionKey } from "@/types/quiz";
import { Check, X, Timer } from "lucide-react";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  onAnswer: (answer: OptionKey | null) => void;
}

const optionLabels: Record<OptionKey, string> = {
  OptionA: "А",
  OptionB: "Б",
  OptionC: "В",
  OptionD: "Г",
};

const optionKeys: OptionKey[] = ["OptionA", "OptionB", "OptionC", "OptionD"];

const QuestionCard = ({ question, questionNumber, totalQuestions, timeLimit, onAnswer }: QuestionCardProps) => {
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAnswered = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start countdown
  useEffect(() => {
    setTimeLeft(timeLimit);
    hasAnswered.current = false;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — auto-submit null
          if (!hasAnswered.current) {
            hasAnswered.current = true;
            setTimeout(() => onAnswer(null), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopTimer;
  }, [question, timeLimit, onAnswer, stopTimer]);

  const handleSelect = (key: OptionKey) => {
    if (revealed || hasAnswered.current) return;
    hasAnswered.current = true;
    stopTimer();
    setSelected(key);
    setRevealed(true);

    setTimeout(() => {
      onAnswer(key);
    }, 1400);
  };

  const isCorrect = (key: OptionKey) => key === question.CorrectAnswer;

  const getOptionClasses = (key: OptionKey) => {
    const base =
      "group flex items-start gap-3.5 w-full rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-wrap-break-word";

    if (!revealed) {
      if (selected === key) return `${base} border-primary bg-primary/5`;
      return `${base} border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98] cursor-pointer`;
    }

    if (isCorrect(key)) {
      return `${base} border-success bg-success/10 animate-pulse-success`;
    }
    if (selected === key && !isCorrect(key)) {
      return `${base} border-destructive bg-destructive/10 animate-shake`;
    }
    return `${base} border-border/50 bg-muted/30 opacity-50`;
  };

  const progress = (questionNumber / totalQuestions) * 100;
  const timerPercent = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg opacity-0 animate-fade-up">
        {/* Progress + Timer row */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>Прашање {questionNumber} од {totalQuestions}</span>
            <span className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
              <Timer className={`h-4 w-4 ${isUrgent ? "animate-pulse" : ""}`} />
              {timeLeft}с
            </span>
          </div>
          {/* Question progress bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Timer bar */}
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${isUrgent ? "bg-destructive" : "bg-secondary"}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-semibold text-foreground mb-6 leading-relaxed" style={{ textWrap: "balance" }}>
          {question.Question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {optionKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={revealed}
              className={getOptionClasses(key)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {revealed && isCorrect(key) ? (
                  <Check className="h-4 w-4 text-success" />
                ) : revealed && selected === key && !isCorrect(key) ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  optionLabels[key]
                )}
              </span>
              <span className="pt-1 text-foreground overflow-wrap-break-word">
                {question[key]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
