import { AnswerRecord, OptionKey } from "@/types/quiz";
import { Check, X, RotateCcw, Trophy, Target, Clock } from "lucide-react";

interface ResultsScreenProps {
  answers: AnswerRecord[];
  timeElapsed: number;
  onRestart: () => void;
}

const optionLabels: Record<OptionKey, string> = {
  OptionA: "А",
  OptionB: "Б",
  OptionC: "В",
  OptionD: "Г",
};

const ResultsScreen = ({ answers, timeElapsed, onRestart }: ResultsScreenProps) => {
  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((correct / total) * 100);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const getMessage = () => {
    if (percentage === 100) return "Совршено! 🎉";
    if (percentage >= 80) return "Одлично! 👏";
    if (percentage >= 60) return "Добро! 👍";
    if (percentage >= 40) return "Може подобро 💪";
    return "Пробај повторно 📚";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Score header */}
        <div className="text-center mb-8 opacity-0 animate-fade-up">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{getMessage()}</h2>
          <p className="text-muted-foreground">Резултати од квизот</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Target className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{correct}/{total}</span>
            <span className="text-xs text-muted-foreground">Точни</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Trophy className="h-5 w-5 text-secondary mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
            <span className="text-xs text-muted-foreground">Успешност</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-card border border-border p-4 shadow-sm">
            <Clock className="h-5 w-5 text-muted-foreground mb-1.5" />
            <span className="text-2xl font-bold text-foreground">{minutes}:{seconds.toString().padStart(2, "0")}</span>
            <span className="text-xs text-muted-foreground">Време</span>
          </div>
        </div>

        {/* Review */}
        <div className="space-y-3 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Преглед</h3>
          {answers.map((record, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 p-4 ${
                record.isCorrect
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  record.isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                }`}>
                  {record.isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed mb-1.5">
                    {record.question.Question}
                  </p>
                  {!record.isCorrect && record.selectedAnswer && (
                    <p className="text-xs text-muted-foreground">
                      Твој одговор: <span className="text-destructive font-medium">{optionLabels[record.selectedAnswer]} — {record.question[record.selectedAnswer]}</span>
                    </p>
                  )}
                  {!record.isCorrect && !record.selectedAnswer && (
                    <p className="text-xs text-destructive font-medium">
                      ⏱ Времето истече
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Точен одговор: <span className="text-success font-medium">{optionLabels[record.question.CorrectAnswer]} — {record.question[record.question.CorrectAnswer]}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Restart */}
        <div className="text-center opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Играј повторно
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
