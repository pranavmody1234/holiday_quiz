"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function QuizPage(props: any) {
  const router = useRouter();
  const { section } = use(props.params);
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/questions/${section}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Quiz not found");
        return res.json();
      })
      .then((data) => {
        setAllQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Quiz not found or unavailable.");
        setLoading(false);
      });
  }, [section]);

  useEffect(() => {
    if (allQuestions && !questions) {
      setQuestions(getRandomQuestions(allQuestions, 5));
    }
  }, [allQuestions, questions]);

  useEffect(() => {
    if (selected && questions && questions.length === 5) {
      const timeout = setTimeout(() => {
        if (selected === questions[current].answer) setScore((s) => s + 1);
        setSelected(null);
        if (current + 1 < questions.length) setCurrent((c) => c + 1);
        else router.push(`/result?score=${score + (selected === questions[current].answer ? 1 : 0)}&total=${questions.length}&section=${section}`);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [selected, questions, current, router, score, section]);

  if (loading || !questions || questions.length !== 5) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  const q = questions[current];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Question {current + 1} of {questions.length}</h2>
        <p className="mb-6 text-lg">{q.question}</p>
        <div className="space-y-3 mb-6">
          {q.options.map((option) => (
            <button
              key={option}
              className={`w-full px-4 py-2 rounded border text-left transition-all duration-150 ${selected ? (option === q.answer ? "bg-green-200 border-green-500" : selected === option ? "bg-red-200 border-red-500" : "bg-gray-100 border-gray-300") : "bg-gray-100 border-gray-300 hover:bg-blue-100"}`}
              onClick={() => !selected && setSelected(option)}
              disabled={!!selected}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
} 