"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function shuffle<T>(array: T[]): T[] {
  return array
    .map((a) => [Math.random(), a] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([, a]) => a);
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function ClientQuiz({ section }: { section: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
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
        // Limit to 5 questions, shuffle if more than 5
        const limited = data.length > 5 ? shuffle(data).slice(0, 5) : data;
        setQuestions(limited);
        setLoading(false);
      })
      .catch(() => {
        setError("Quiz not found or unavailable.");
        setLoading(false);
      });
  }, [section]);

  useEffect(() => {
    if (selected !== null) {
      const timer = setTimeout(() => {
        if (selected === questions[current].answer) {
          setScore((s) => s + 1);
        }
        setSelected(null);
        if (current + 1 < questions.length) {
          setCurrent((c) => c + 1);
        } else {
          // Pass section for leaderboard
          router.push(`/result?score=${score + (selected === questions[current].answer ? 1 : 0)}&total=${questions.length}&section=${section}`);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [selected, current, questions, router, score, section]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!questions.length) return null;

  const q = questions[current];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Question {current + 1} of {questions.length}</h2>
        <p className="mb-6 text-lg">{q.question}</p>
        <div className="space-y-3 mb-6">
          {q.options.map((option) => {
            let btnClass = "w-full px-4 py-2 rounded border text-left transition-all duration-150 ";
            if (selected !== null) {
              if (option === selected && option !== q.answer) {
                // Wrong answer selected
                btnClass += "bg-red-200 border-red-500 ";
              } else if (option === q.answer) {
                // Show correct answer in green
                btnClass += "bg-green-200 border-green-500 ";
              } else {
                btnClass += "bg-gray-100 border-gray-300 ";
              }
            } else {
              btnClass += "bg-gray-100 border-gray-300 hover:bg-blue-100 ";
            }
            return (
              <button
                key={option}
                className={btnClass}
                onClick={() => selected === null && setSelected(option)}
                disabled={!!selected}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
