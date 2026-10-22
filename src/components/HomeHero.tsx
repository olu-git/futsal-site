"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RegisterButton } from "./RegistrationProvider";
import { site } from "@/lib/site-content";

export default function HomeHero({ seasonName }: { seasonName?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const season = seasonName?.match(/(\d{4})\s*-?\s*Season\s+(\d+)/i);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    player.muted = true;
    void player.play().catch(() => { /* Retain the poster if browser policy blocks autoplay. */ });
    return () => { player.pause(); };
  }, []);

  return <section className="recap-hero" aria-labelledby="home-title">
    <video ref={video} className="recap-video" autoPlay muted loop playsInline preload="auto" poster="/images/fis-hero-poster.jpg" aria-hidden="true">
      <source src="/videos/fis-hero.mp4" type="video/mp4" />
    </video>
    <div className="recap-overlay" aria-hidden="true" />
    <div className="fis-container recap-content">
      <p className="recap-tag"><span className="recap-dot" aria-hidden="true" />REC{season && ` · S${season[2]} ${season[1]}`}</p>
      <div className="recap-main">
        <h1 id="home-title"><span>Futsal</span>{" "}<span>Indoor</span>{" "}<span>Soccer</span></h1>
        <div className="recap-actions">
          <RegisterButton className="recap-register"><span className="recap-action-label">Register</span><span className="recap-icon recap-arrow" aria-hidden="true"><svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true" focusable="false"><path d="M2 1 9 5 2 9Z" fill="currentColor" /></svg></span></RegisterButton>
          <Link href="/monday-night/">Monday Night</Link>
          <Link href="/wednesday-night/">Wednesday Night</Link>
          <a className="recap-fill-ins" href={site.fillIns} target="_blank" rel="noopener noreferrer"><span className="recap-action-label">Fill-ins</span><svg className="recap-icon" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false"><path d="M2 10 10 2M3 2h7v7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></a>
        </div>
      </div>
    </div>
  </section>;
}
