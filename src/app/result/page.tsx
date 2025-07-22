"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = Number(searchParams.get("score"));
  const total = Number(searchParams.get("total"));

  useEffect(() => {
    if (score === total && total > 0) {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
        });
      });
    }
  }, [score, total]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl mb-6">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{total}</span></p>
        {score === total && total > 0 && (
          <div className="mb-4 text-green-600 font-bold text-lg">Perfect Score! 🎉</div>
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