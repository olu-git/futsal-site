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
          <RegisterButton className="recap-register">Register <span className="recap-arrow" aria-hidden="true">▶</span></RegisterButton>
          <Link href="/monday-night/">Monday Night</Link>
          <Link href="/wednesday-night/">Wednesday Night</Link>
          <a className="recap-fill-ins" href={site.fillIns} target="_blank" rel="noopener noreferrer">Fill-ins ↗</a>
        </div>
      </div>
    </div>
  </section>;
}
