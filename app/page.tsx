"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePlan } from "@/lib/plan-data";

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [groupSize, setGroupSize] = useState("4");
  const [error, setError] = useState("");

  function onGenerate() {
    setError("");
    const size = Number(groupSize);

    if (!Number.isFinite(size) || size < 2 || size > 50) {
      setError("Group size must be between 2 and 50.");
      return;
    }

    const plan = generatePlan(city, size);
    sessionStorage.setItem("planMixer.latestPlan", JSON.stringify(plan));
    router.push("/result");
  }

  return (
    <main>
      <h1>PLAN MIXER</h1>
      <p className="small">Instant group plans in one tap.</p>

      <div className="card">
        <label>City (optional)</label>
        <input
          placeholder="Istanbul"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <div style={{ height: 12 }} />

        <label>Group Size</label>
        <input
          type="number"
          min={2}
          max={50}
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
        />

        <div style={{ height: 14 }} />

        <button className="btn-primary" onClick={onGenerate}>
          Generate Plan
        </button>

        {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
      </div>
    </main>
  );
}
