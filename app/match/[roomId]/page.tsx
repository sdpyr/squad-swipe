"use client";

import Link from "next/link";

export default function LegacyMatchPage() {
  return (
    <main>
      <h1>PLAN MIXER</h1>
      <div className="card">
        <p>This route is no longer used in this MVP.</p>
        <Link href="/">Go to home</Link>
      </div>
    </main>
  );
}
