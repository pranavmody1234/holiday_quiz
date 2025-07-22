"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  name: string;
  category: string;
  score: string;
}

export default function ResultPage() {
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl mb-6">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{total}</span></p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center mb-4">
            <input
              className="mb-2 px-4 py-2 border rounded w-full"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={20}
            />
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Score"}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        ) : (
          <>
            <h3 className="text-2xl font-semibold mb-2">Leaderboard</h3>
            {loading ? (
              <div>Loading leaderboard...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : leaderboard.length === 0 ? (
              <div>No leaderboard entries for this quiz yet.</div>
            ) : (
              <ol className="w-full mb-4">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="flex justify-between border-b py-1">
                    <span>{i + 1}. {entry.name}</span>
                    <span>{entry.score}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
        <button
          className="mb-3 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.back()}
        >
          Play Again
        </button>
        <button
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => router.push("/")}
        >
          Back to Main Menu
        </button>
      </div>
    </main>
  );
} 