"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./checklist.css";

type Step = {
  id: string;
  question: string;
  type: "single" | "multi";
  options: string[];
  help?: string;
};

type Questionnaire = {
  title: string;
  steps: Step[];
  recommendations?: Record<string, { music: string[]; decor: string[]; activities: string[] }>;
};

type Venue = {
  name: string;
  locations: string[]; // cities
  types: string[]; // venue types
  themes: string[]; // suitable themes
  holidays: string[]; // suitable holidays
  capacity: ("Under 10"|"10-20"|"20-40"|"40-75"|"75-120"|"120+")[];
  priceTier: "low"|"mid"|"high"; // rough pricing bucket
  notes?: string;
};

type Product = {
  name: string;
  tags: string[]; // decor, activities, food, music
  themes: string[];
  holidays: string[];
  priceTier: "low"|"mid"|"high";
  notes?: string;
};

const ALL_VENUES: Venue[] = [
  { name: "Dallas Garden Hall", locations: ["Dallas"], types: ["Community Hall", "Event Space"], themes: ["Cozy Winter Wonderland","Rustic Harvest","Festival of Lights"], holidays: ["Christmas","Thanksgiving","Diwali"], capacity: ["20-40","40-75","75-120"], priceTier: "mid" },
  { name: "NYC Rooftop Loft", locations: ["New York"], types: ["Rooftop","Event Space"], themes: ["Glam Gold & Black","Neon Glow"], holidays: ["New Year’s Eve","Halloween"], capacity: ["20-40","40-75","75-120","120+"], priceTier: "high" },
  { name: "Seattle Waterfront Pavilion", locations: ["Seattle"], types: ["Event Space"], themes: ["Spring Garden","Cozy Winter Wonderland"], holidays: ["Easter","Christmas"], capacity: ["20-40","40-75"], priceTier: "high" },
  { name: "Vegas Neon Lounge", locations: ["Las Vegas"], types: ["Restaurant Private Room","Event Space"], themes: ["Neon Glow","Glam Gold & Black"], holidays: ["New Year’s Eve","Halloween"], capacity: ["20-40","40-75","75-120"], priceTier: "high" },
  { name: "Austin Backyard Venue", locations: ["Austin"], types: ["Backyard/Patio"], themes: ["Rustic Harvest","Spring Garden"], holidays: ["Thanksgiving","Easter"], capacity: ["10-20","20-40","40-75"], priceTier: "low" },
  { name: "Florida Beach House", locations: ["Florida"], types: ["Home","Backyard/Patio"], themes: ["Spring Garden","Neon Glow"], holidays: ["New Year’s Eve","Easter"], capacity: ["10-20","20-40","40-75"], priceTier: "mid" },
  { name: "Chicago Riverfront Loft", locations: ["Chicago"], types: ["Event Space"], themes: ["Glam Gold & Black","Cozy Winter Wonderland"], holidays: ["New Year’s Eve","Christmas"], capacity: ["20-40","40-75","75-120"], priceTier: "mid" },
  { name: "SF Skyline Terrace", locations: ["San Francisco"], types: ["Rooftop"], themes: ["Neon Glow","Spring Garden"], holidays: ["New Year’s Eve","Easter"], capacity: ["20-40","40-75"], priceTier: "high" },
  { name: "Community Hall Classic", locations: ["Dallas","New York","Seattle","Las Vegas","Florida","Austin","Chicago","San Francisco"], types: ["Community Hall"], themes: ["Cozy Winter Wonderland","Rustic Harvest","Festival of Lights"], holidays: ["Christmas","Thanksgiving","Diwali"], capacity: ["20-40","40-75","75-120"], priceTier: "low" },
  { name: "Cozy Home Setup", locations: ["Dallas","New York","Seattle","Las Vegas","Florida","Austin","Chicago","San Francisco"], types: ["Home"], themes: ["Cozy Winter Wonderland","Spring Garden"], holidays: ["Christmas","Easter"], capacity: ["Under 10","10-20","20-40"], priceTier: "low" },
  { name: "Rooftop Social NYC", locations: ["New York"], types: ["Rooftop"], themes: ["Glam Gold & Black"], holidays: ["New Year’s Eve"], capacity: ["40-75","75-120","120+"], priceTier: "high" },
  { name: "Austin Rustic Barn", locations: ["Austin"], types: ["Event Space"], themes: ["Rustic Harvest"], holidays: ["Thanksgiving"], capacity: ["40-75","75-120"], priceTier: "mid" },
  { name: "Seattle Community Room", locations: ["Seattle"], types: ["Community Hall"], themes: ["Festival of Lights","Cozy Winter Wonderland"], holidays: ["Diwali","Christmas"], capacity: ["20-40","40-75"], priceTier: "low" },
  { name: "Vegas Private Dining", locations: ["Las Vegas"], types: ["Restaurant Private Room"], themes: ["Glam Gold & Black","Neon Glow"], holidays: ["New Year’s Eve"], capacity: ["10-20","20-40","40-75"], priceTier: "high" },
  { name: "Florida Garden Patio", locations: ["Florida"], types: ["Backyard/Patio"], themes: ["Spring Garden"], holidays: ["Easter"], capacity: ["10-20","20-40"], priceTier: "mid" },
  { name: "Chicago Historic Hall", locations: ["Chicago"], types: ["Community Hall","Event Space"], themes: ["Cozy Winter Wonderland","Festival of Lights"], holidays: ["Christmas","Diwali"], capacity: ["40-75","75-120"], priceTier: "mid" }
];

const ALL_PRODUCTS: Product[] = [
  { name: "String Light Kit (48ft)", tags: ["Lighting","Decor"], themes: ["Cozy Winter Wonderland","Spring Garden"], holidays: ["Christmas","Easter"], priceTier: "low" },
  { name: "Balloon Garland Kit (Gold/Black)", tags: ["Decor"], themes: ["Glam Gold & Black"], holidays: ["New Year’s Eve"], priceTier: "low" },
  { name: "Photo Booth Props Set", tags: ["Photo Booth","Activities"], themes: ["Any"], holidays: ["New Year’s Eve","Christmas","Halloween"], priceTier: "low" },
  { name: "Portable Speaker + Mic", tags: ["Music","Audio"], themes: ["Any"], holidays: ["Any"], priceTier: "mid" },
  { name: "Buffet Chafing Dish Set", tags: ["Food","Catering"], themes: ["Any"], holidays: ["Thanksgiving","Christmas"], priceTier: "mid" },
  { name: "Mocktail Bar Kit", tags: ["Drinks"], themes: ["Any"], holidays: ["Any"], priceTier: "low" },
  { name: "Dessert Bar Stand Pack", tags: ["Dessert","Food"], themes: ["Any"], holidays: ["Any"], priceTier: "low" },
  { name: "Themed Backdrop (8x8ft)", tags: ["Decor","Backdrop"], themes: ["Spooky Chic","Glam Gold & Black","Festival of Lights"], holidays: ["Halloween","New Year’s Eve","Diwali"], priceTier: "mid" },
  { name: "LED Countdown Clock", tags: ["Decor","Lighting"], themes: ["Glam Gold & Black","Neon Glow"], holidays: ["New Year’s Eve"], priceTier: "low" },
  { name: "Sparkler Celebration Pack", tags: ["Activities"], themes: ["Glam Gold & Black"], holidays: ["New Year’s Eve"], priceTier: "low" },
  { name: "Garland & Wreath Set", tags: ["Decor"], themes: ["Cozy Winter Wonderland"], holidays: ["Christmas"], priceTier: "low" },
  { name: "Karaoke Machine", tags: ["Activities","Music"], themes: ["Any"], holidays: ["Any"], priceTier: "mid" },
  { name: "Party Games Bundle", tags: ["Activities"], themes: ["Any"], holidays: ["Any"], priceTier: "low" },
  { name: "Table Centerpiece Kit (Set of 6)", tags: ["Decor"], themes: ["Rustic Harvest","Spring Garden"], holidays: ["Thanksgiving","Easter"], priceTier: "low" },
  { name: "Outdoor Heater (Rental)", tags: ["Comfort"], themes: ["Cozy Winter Wonderland"], holidays: ["Christmas","New Year’s Eve"], priceTier: "high" },
  { name: "Canopy Tent (10x20)", tags: ["Shelter"], themes: ["Any"], holidays: ["Any"], priceTier: "mid" },
  { name: "LED Uplighting Pack (8 units)", tags: ["Lighting"], themes: ["Neon Glow","Glam Gold & Black"], holidays: ["New Year’s Eve","Halloween"], priceTier: "mid" },
  { name: "Diya & Lantern Set", tags: ["Decor","Lighting"], themes: ["Festival of Lights"], holidays: ["Diwali"], priceTier: "low" },
  { name: "Pumpkin Carving Kit (10 pack)", tags: ["Activities"], themes: ["Spooky Chic"], holidays: ["Halloween"], priceTier: "low" }
];

function mapBudgetToTier(b: string|undefined): "low"|"mid"|"high"|undefined {
  if (!b) return undefined;
  if (b === "$200-$500") return "low";
  if (b === "$500-$1,000" || b === "$1,000-$2,500") return "mid";
  return "high"; // $2,500-$5,000, $5,000+
}

function venueScore(v: Venue, answers: Record<string, any>) {
  let s = 0;
  const loc = answers["location"] as string | undefined;
  const holiday = answers["holiday"] as string | undefined;
  const theme = answers["theme"] as string | undefined;
  const vtype = answers["venue"] as string | undefined;
  const guests = answers["guests"] as string | undefined;
  const budgetTier = mapBudgetToTier(answers["budget"] as string | undefined);
  if (loc && v.locations.includes(loc)) s += 3;
  if (holiday && v.holidays.includes(holiday)) s += 2;
  if (theme && v.themes.includes(theme)) s += 2;
  if (vtype && v.types.includes(vtype)) s += 2;
  if (guests && v.capacity.includes(guests as any)) s += 2;
  if (budgetTier) {
    // low <= mid <= high; penalize when venue is pricier than budget
    const order = { low: 0, mid: 1, high: 2 } as const;
    if (order[v.priceTier] <= order[budgetTier]) s += 1; else s -= 1;
  }
  return s;
}

function productScore(p: Product, answers: Record<string, any>) {
  let s = 0;
  const holiday = answers["holiday"] as string | undefined;
  const theme = answers["theme"] as string | undefined;
  const vtype = answers["venue"] as string | undefined;
  const budgetTier = mapBudgetToTier(answers["budget"] as string | undefined);
  if (holiday && (p.holidays.includes(holiday) || p.holidays.includes("Any"))) s += 2;
  if (theme && (p.themes.includes(theme) || p.themes.includes("Any"))) s += 2;
  // venue type minor bump for outdoor-related gear
  if (vtype && ["Backyard/Patio","Rooftop"].includes(vtype) && p.tags.some(t => ["Lighting","Shelter","Comfort"].includes(t))) s += 1;
  if (budgetTier) {
    const order = { low: 0, mid: 1, high: 2 } as const;
    if (order[p.priceTier] <= order[budgetTier]) s += 1; else s -= 1;
  }
  return s;
}

export default function PartyChecklist() {
  const [data, setData] = useState<Questionnaire | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/questions/theme_questionaire.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((j: Questionnaire) => {
        setData(j);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load checklist.");
        setLoading(false);
      });
  }, []);

  const step = data?.steps[stepIdx];

  const canNext = useMemo(() => {
    if (!step) return false;
    const val = answers[step.id];
    if (step.type === "single") return typeof val === "string" && val.length > 0;
    return Array.isArray(val) && val.length > 0;
  }, [answers, step]);

  function toggleOption(opt: string) {
    if (!step) return;
    setAnswers((prev) => {
      const curr = prev[step.id];
      if (step.type === "single") return { ...prev, [step.id]: opt };
      const arr = Array.isArray(curr) ? curr.slice() : [];
      const i = arr.indexOf(opt);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(opt);
      return { ...prev, [step.id]: arr };
    });
  }

  function next() {
    if (!data) return;
    setStepIdx((i) => Math.min(i + 1, data.steps.length));
  }
  function back() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }
  function restart() {
    setAnswers({});
    setStepIdx(0);
  }

  const summary = useMemo(() => {
    if (!data) return null;
    const holiday = (answers["holiday"] as string) || "";
    const rec = (holiday && data.recommendations && data.recommendations[holiday]) || null;
    return { holiday, rec };
  }, [answers, data]);

  const suggestions = useMemo(() => {
    const venues = [...ALL_VENUES].map(v => ({ v, s: venueScore(v, answers) }))
      .sort((a,b)=>b.s-a.s)
      .slice(0,4)
      .map(x=>x.v);
    const products = [...ALL_PRODUCTS].map(p => ({ p, s: productScore(p, answers) }))
      .sort((a,b)=>b.s-a.s)
      .slice(0,4)
      .map(x=>x.p);
    return { venues, products };
  }, [answers]);

  if (loading) return <div className="pc-container"><div className="pc-card">Loading...</div></div>;
  if (error || !data) return <div className="pc-container"><div className="pc-card">{error}</div></div>;

  const done = stepIdx >= data.steps.length;

  return (
    <main className="pc-container">
      <div className="pc-card">
        <div className="pc-step">Step {Math.min(stepIdx + 1, data.steps.length)} of {data.steps.length}</div>
        <h1 className="pc-title">{data.title}</h1>
        {!done ? (
          <div>
            <p className="pc-help">{step?.question}</p>
            {step?.help && <div className="pc-help">{step.help}</div>}
            <div className="pc-options">
              {step?.options.map((opt) => {
                const val = answers[step.id];
                const selected = step.type === "single" ? val === opt : Array.isArray(val) && val.includes(opt);
                return (
                  <button key={opt} className={`pc-btn ${selected ? "sel" : ""}`} onClick={() => toggleOption(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="pc-actions">
              <button className="pc-nav" onClick={back} disabled={stepIdx === 0}>Back</button>
              <button className="pc-nav" onClick={next} disabled={!canNext}>{stepIdx === data.steps.length - 1 ? "Finish" : "Next"}</button>
            </div>
          </div>
        ) : (
          <div className="pc-summary">
            <h2 className="pc-title">Your Party Plan</h2>
            <div>
              {data.steps.map((s) => (
                <div key={s.id} style={{ marginBottom: 8 }}>
                  <strong>{s.question}</strong>
                  <div>
                    {Array.isArray(answers[s.id])
                      ? (answers[s.id] as string[]).map((v) => <span key={v} className="pc-chip">{v}</span>)
                      : <span className="pc-chip">{String(answers[s.id] || "-")}</span>}
                  </div>
                </div>
              ))}
            </div>
            {summary?.rec && (
              <div style={{ marginTop: 12 }}>
                <h3 className="pc-title">Suggested Add‑ons for {summary.holiday}</h3>
                <div>
                  <strong>Music:</strong> {summary.rec.music.map((m) => <span key={m} className="pc-chip">{m}</span>)}
                </div>
                <div>
                  <strong>Decor:</strong> {summary.rec.decor.map((d) => <span key={d} className="pc-chip">{d}</span>)}
                </div>
                <div>
                  <strong>Activities:</strong> {summary.rec.activities.map((a) => <span key={a} className="pc-chip">{a}</span>)}
                </div>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <h3 className="pc-title">Based on your responses, here are a few venues you might love</h3>
              <div className="pc-grid">
                {suggestions.venues.map(v => (
                  <div key={v.name} className="pc-item">
                    <div className="pc-item-title">{v.name}</div>
                    <div className="pc-item-sub">{v.locations.join(", ")} • {v.types.join(", ")}</div>
                    <div className="pc-item-tags">
                      {v.themes.slice(0,2).map(t => <span key={t} className="pc-chip">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <h3 className="pc-title">Products from our marketplace to elevate the party</h3>
              <div className="pc-grid">
                {suggestions.products.map(p => (
                  <div key={p.name} className="pc-item">
                    <div className="pc-item-title">{p.name}</div>
                    <div className="pc-item-sub">{p.tags.join(" • ")}</div>
                    <div className="pc-item-tags">
                      {p.themes.slice(0,2).map(t => <span key={t} className="pc-chip">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pc-actions" style={{ marginTop: 12 }}>
              <button className="pc-nav" onClick={restart}>Start Over</button>
              <Link className="pc-nav" href="/">Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
