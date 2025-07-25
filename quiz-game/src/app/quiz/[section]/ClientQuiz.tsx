"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./quiz.css";

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
  explanation?: string;
}

export default function ClientQuiz({ section }: { section: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`/questions/${section}.json`, { cache: 'no-store' })
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
      setShowExplanation(true);
      setProgress(0);
      const duration = 5000; // 5 seconds
      const interval = 50;
      let elapsed = 0;
      const progressTimer = setInterval(() => {
        elapsed += interval;
        setProgress(Math.min(100, (elapsed / duration) * 100));
      }, interval);
      const timer = setTimeout(() => {
        clearInterval(progressTimer);
        setShowExplanation(false);
        setProgress(0);
        if (selected === questions[current].answer) {
          setScore((s) => s + 1);
        }
        setSelected(null);
        if (current + 1 < questions.length) {
          setCurrent((c) => c + 1);
        } else {
          router.push(`/result?score=${score + (selected === questions[current].answer ? 1 : 0)}&total=${questions.length}&section=${section}`);
        }
      }, duration);
      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [selected, current, questions, router, score, section]);

  if (loading) return <div className="quiz-loading">Loading...</div>;
  if (error) return <div className="quiz-error">{error}</div>;
  if (!questions.length) return null;

  const q = questions[current];

  return (
    <main>
      <div className="quiz-container">
        <h2 className="quiz-question">Question {current + 1} of {questions.length}</h2>
        <p className="quiz-text">{q.question}</p>
        <div className="quiz-options">
          {q.options.map((option) => {
            let btnClass = "quiz-option-btn ";
            if (selected !== null) {
              if (option === selected && option !== q.answer) {
                btnClass += "quiz-option-wrong ";
              } else if (option === q.answer) {
                btnClass += "quiz-option-correct ";
              } else {
                btnClass += "quiz-option-default ";
              }
            } else {
              btnClass += "quiz-option-default ";
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
        {showExplanation && (
          <div className="quiz-explanation-box">
            <div className="quiz-explanation">
              <strong>Correct Answer:</strong> {q.answer}<br />
              <span>{q.explanation}</span>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="quiz-next-label">Next question in {Math.ceil((100 - progress) / 50)}s...</div>
          </div>
        )}
      </div>
    </main>
  );
}
