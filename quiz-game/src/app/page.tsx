"use client";
import Link from "next/link";

const sections = [
  { key: "recipe", label: "Holiday Recipe Quiz" },
  { key: "travelling", label: "Holiday Travelling Quiz" },
  { key: "gk", label: "Holiday General Knowledge Quiz" },
  { key: "music", label: "Holiday Music Quiz (Coming Soon)" },
  { key: "movies", label: "Holiday Movies Quiz (Coming Soon)" }
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Holiday Quiz Game</h1>
      <div className="w-full max-w-md space-y-4">
        {sections.map((section) => (
          <Link
            key={section.key}
            href={section.key === "music" || section.key === "movies" ? "#" : `/quiz/${section.key}`}
            className={`block w-full px-6 py-4 rounded-lg text-lg font-semibold text-center shadow-md transition-all duration-200 ${section.key === "music" || section.key === "movies" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            tabIndex={section.key === "music" || section.key === "movies" ? -1 : 0}
            aria-disabled={section.key === "music" || section.key === "movies"}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
