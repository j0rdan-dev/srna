export interface QuizQuestion {
  Question: string;
  OptionA: string;
  OptionB: string;
  OptionC: string;
  OptionD: string;
  CorrectAnswer: "OptionA" | "OptionB" | "OptionC" | "OptionD";
}

export interface QuizData {
  Questions: QuizQuestion[];
}

export type OptionKey = "OptionA" | "OptionB" | "OptionC" | "OptionD";

export interface AnswerRecord {
  question: QuizQuestion;
  selectedAnswer: OptionKey | null;
  isCorrect: boolean;
}
