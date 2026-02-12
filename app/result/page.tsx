"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { generatePlan, PlanResult } from "@/lib/plan-data";

export default function ResultPage() {
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("planMixer.latestPlan");
    if (!raw) return;
    try {
      setPlan(JSON.parse(raw) as PlanResult);
    } catch {
      setPlan(null);
    }
  }, []);

  const summary = useMemo(() => {
    if (!plan) return "No plan generated yet.";
    const place = plan.city ? `${plan.city} • ` : "";
    return `${place}${plan.food} + ${plan.activity} + ${plan.twist}`;
  }, [plan]);

  function regenerate() {
    if (!plan) return;
    const next = generatePlan(plan.city || "", plan.groupSize);
    sessionStorage.setItem("planMixer.latestPlan", JSON.stringify(next));
    setPlan(next);
    setMessage("");
  }

  async function sharePlan() {
    if (!plan) return;
    const text = `PLAN MIXER: ${summary} (group: ${plan.groupSize})`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "PLAN MIXER",
          text
        });
      } else {
        await navigator.clipboard.writeText(text);
        setMessage("Plan copied to clipboard.");
      }
    } catch {
      setMessage("Share failed.");
    }
  }

  function lockPlan() {
    if (!plan) return;
    const locked = { ...plan, lockedAt: new Date().toISOString() };
    sessionStorage.setItem("planMixer.latestPlan", JSON.stringify(locked));
    setPlan(locked);
    setMessage("Plan locked.");
  }

  return (
    <main>
      <h1>Your Plan</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{summary}</h2>
        {plan ? <p className="small">Group size: {plan.groupSize}</p> : null}
        {plan?.lockedAt ? <p className="small">Locked ✅</p> : null}
      </div>

      <div className="card">
        <div className="row">
          <button className="btn-primary" onClick={regenerate} disabled={!plan || !!plan.lockedAt}>
            Regenerate
          </button>
          <button className="btn-neutral" onClick={sharePlan} disabled={!plan}>
            Share plan
          </button>
          <button className="btn-danger" onClick={lockPlan} disabled={!plan || !!plan.lockedAt}>
            Lock plan
          </button>
        </div>
        {message ? <p className="small">{message}</p> : null}
      </div>

      <p>
        <Link href="/">Back</Link>
      </p>
    </main>
  );
}
