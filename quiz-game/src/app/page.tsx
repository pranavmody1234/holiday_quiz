"use client";
import Link from "next/link";

const sections = [
  { key: "recipe", label: "Holiday Recipe Quiz" },
  { key: "travelling", label: "Holiday Travelling Quiz" },
  { key: "gk", label: "Holiday General Knowledge Quiz" },
  // { key: "party-checklist", label: "Holiday Party Checklist" }, // temporarily hidden
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
            className={`quiz-btn${section.key === "movies" ? " disabled" : ""}`}
            disabled={section.key === "movies"}
            onClick={() => {
              if (section.key !== "movies") {
                window.location.href = section.key === "party-checklist" ? "/party-checklist" : `/quiz/${section.key}`;
              }
            }}
            style={{
              cursor: section.key === "movies" ? "not-allowed" : "pointer",
              backgroundColor: section.key === "movies" ? "#e2e8f0" : "#3b82f6",
              color: section.key === "movies" ? "#a0aec0" : "#ffffff",
            }}
            tabIndex={section.key === "movies" ? -1 : 0}
            aria-disabled={section.key === "movies"}
          >
            {section.label}
          </button>
        ))}
      </div>
    </main>
  );
}
