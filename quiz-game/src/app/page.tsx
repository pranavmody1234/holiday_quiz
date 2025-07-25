"use client";
import Link from "next/link";

const sections = [
  { key: "recipe", label: "Holiday Recipe Quiz" },
  { key: "travelling", label: "Holiday Travelling Quiz" },
  { key: "gk", label: "Holiday General Knowledge Quiz" },
  { key: "music", label: "Holiday Music Quiz (Coming Soon)" },
  { key: "movies", label: "Holiday Movies Quiz (Coming Soon)" },
];

export default function Home() {
  return (
    <main>
      <h1 className="main-title">Holiday Quiz Game</h1>
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        {sections.map((section) => (
          <button
            key={section.key}
            className={`quiz-btn${section.key === "music" || section.key === "movies" ? " disabled" : ""}`}
            disabled={section.key === "music" || section.key === "movies"}
            onClick={() => {
              if (section.key !== "music" && section.key !== "movies") {
                window.location.href = `/quiz/${section.key}`;
              }
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </main>
  );
}
