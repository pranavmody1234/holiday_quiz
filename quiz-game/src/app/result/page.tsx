"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ClientResult from "./ClientResult";
import { LeaderboardEntry } from "@/types";
import "./result.css";

function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = Number(searchParams.get("score"));
  const total = Number(searchParams.get("total"));
  const section = searchParams.get("section") || "";

  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (submitted) {
      setLoading(true);
      fetch(`/api/leaderboard?category=${section}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.leaderboard) {
            const sorted = data.leaderboard
              .sort((a: LeaderboardEntry, b: LeaderboardEntry) => Number(b.score) - Number(a.score))
              .slice(0, 10);
            setLeaderboard(sorted);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Could not load leaderboard.");
          setLoading(false);
        });
    }
  }, [submitted, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category: section, score }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Could not submit score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="result-main">
      <div className="result-container">
        <h2 className="result-title">Quiz Complete!</h2>
        <p className="result-score">You scored <span style={{fontWeight:'bold'}}>{score}</span> out of <span style={{fontWeight:'bold'}}>{total}</span></p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="result-form">
            <input
              className="result-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={20}
            />
            <button
              className="result-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Score"}
            </button>
            {error && <div className="result-error">{error}</div>}
          </form>
        ) : (
          <>
            <h3 className="result-leaderboard-title">Leaderboard</h3>
            {loading ? (
              <div>Loading leaderboard...</div>
            ) : error ? (
              <div className="result-error">{error}</div>
            ) : leaderboard.length === 0 ? (
              <div>No leaderboard entries for this quiz yet.</div>
            ) : (
              <ol className="result-leaderboard-list">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="result-leaderboard-item">
                    <span>{i + 1}. {entry.name}</span>
                    <span>{entry.score}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
        <button
          className="result-btn"
          style={{marginBottom: '0.75rem'}}
          onClick={() => router.back()}
        >
          Play Again
        </button>
        <button
          className="result-btn secondary"
          onClick={() => router.push("/")}
        >
          Back to Main Menu
        </button>
      </div>
    </main>
  );
}

export default function PageWrapper() {
  return (
    <Suspense fallback={<div className='flex justify-center items-center min-h-screen'>Loading...</div>}>
      <ResultPage />
    </Suspense>
  );
}