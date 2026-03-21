import { useState, useEffect, useCallback, useRef } from "react";
import { QuizData, QuizQuestion, OptionKey, AnswerRecord } from "@/types/quiz";
import { Category } from "@/data/categories";
import CategorySelect from "./CategorySelect";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";

type Screen = "categories" | "quiz" | "results";

const QUESTIONS_PER_QUIZ = 5;
const TIME_PER_QUESTION = 30;

function shuffleAndPick(questions: QuizQuestion[], count: number): QuizQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const QuizApp = () => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [screen, setScreen] = useState<Screen>("categories");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startQuiz = useCallback(async (category: Category) => {
    setLoading(true);
    try {
      const res = await fetch(category.file);
      const data: QuizData = await res.json();
      const picked = shuffleAndPick(data.Questions, QUESTIONS_PER_QUIZ);
      setQuizQuestions(picked);
      setCurrentIndex(0);
      setAnswers([]);
      setTimeElapsed(0);
      setScreen("quiz");

      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswer = useCallback(
    (selected: OptionKey | null) => {
      const question = quizQuestions[currentIndex];
      const record: AnswerRecord = {
        question,
        selectedAnswer: selected,
        isCorrect: selected !== null && selected === question.CorrectAnswer,
      };

      const newAnswers = [...answers, record];
      setAnswers(newAnswers);

      if (currentIndex + 1 < quizQuestions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setScreen("results");
      }
    },
    [quizQuestions, currentIndex, answers]
  );

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("categories");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  switch (screen) {
    case "categories":
      return <CategorySelect onSelect={startQuiz} />;
    case "quiz":
      return (
        <QuestionCard
          key={currentIndex}
          question={quizQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={quizQuestions.length}
          timeLimit={TIME_PER_QUESTION}
          onAnswer={handleAnswer}
        />
      );
    case "results":
      return <ResultsScreen answers={answers} timeElapsed={timeElapsed} onRestart={handleRestart} />;
  }
};

export default QuizApp;
