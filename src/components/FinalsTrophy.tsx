"use client";

import { Pause, Play } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export default function FinalsTrophy({ champion }: { champion: string }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => true);
  const [manualPlayback, setManualPlayback] = useState<boolean | null>(null);
  const playing = manualPlayback ?? !reducedMotion;

  return <div className="finals-champion">
    <div className="finals-trophy-art" data-playing={playing} aria-hidden="true">
      <div className="pixel-confetti">{Array.from({ length: 24 }, (_, index) => <span key={index} />)}</div>
      <svg viewBox="0 0 96 128" role="presentation" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <path fill="#f5252c" d="M5 32h9v60H9V74H5zm77 0h9v42h-4v18h-5z" />
        <path fill="#f7ce39" d="M14 32h7v72h-4V88h-3zm61 0h7v72h-4V88h-3z" />
        <path fill="#2775e7" d="M21 32h6v58h-3v14h-3zm48 0h6v58h-3v14h-3z" />
        <path fill="#aa7009" d="M11 30h17v7H18v20h10v7H14v-7h-3zm57 0h17v27h-3v7H68v-7h10V37H68z" />
        <path fill="#ffe49b" d="M14 33h11v3h-8v22h9v3h-12zm57 0h11v28H70v-3h9V36h-8z" />
        <path fill="#714907" d="M42 3h12v5h-4v7h7v5H39v-5h7V8h-4zM31 25h34v5h7v9h-4v21h-5v10h-6v7H39v-7h-6V60h-5V39h-4v-9h7zm8 53h18v7h4v6H35v-6h4zm-9 14h36v7h6v8H24v-8h6zm-10 16h56v8H20z" />
        <path fill="#e6a921" d="M45 4h7v4h-4v8h7v2H41v-2h7V8h-3zM31 28h34v5h5v5h-5v24h-5v9h-6v9H42v-9h-6v-9h-5V38h-5v-5h5zm11 53h12v7h4v4H38v-4h4zm-9 14h30v7h6v4H27v-4h6zm-10 16h50v3H23z" />
        <path fill="#ffdc67" d="M34 32h25v4H34zm1 8h8v26h-5V57h-3zm9 34h9v6h-9zm-8 22h22v4H36zm-8 15h28v3H28z" />
        <path fill="#b9780b" d="M58 40h5v26h-5zm-4 32h6v8h-6zm5 24h5v7h-5zm5 15h8v3h-8z" />
        <path fill="#fff4c4" d="M37 43h4v9h-4zm7-28h4v3h-4zm-5 22h4v3h-4z" />
      </svg>
    </div>
    <p className="finals-champion-label">2026 Season 1 Champions</p>
    <strong className="finals-champion-name">{champion}</strong>
    <button
      type="button"
      className="finals-confetti-toggle"
      aria-label={playing ? "Pause confetti" : "Play confetti"}
      aria-pressed={playing}
      title={playing ? "Pause confetti" : "Play confetti"}
      onClick={() => setManualPlayback(!playing)}
    >{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
  </div>;
}
