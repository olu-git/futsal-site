"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import type { ReplayVideo } from "@/data/fis-tv";
import styles from "./FisTv.module.css";

export default function ReplayPlayer({ video }: { video: ReplayVideo }) {
  const [loaded, setLoaded] = useState(false);
  return <div className={styles.player}>
    {loaded ? <iframe
      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=0&rel=0&playsinline=1`}
      title={`${video.title} — FIS match replay`}
      allow="encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={(event) => event.currentTarget.focus()}
    /> : <button type="button" className={styles.poster} onClick={() => setLoaded(true)} aria-label={`Load ${video.title} video player`}>
      <Image src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" fill unoptimized sizes="100vw" />
      <span className={styles.playIcon}><Play aria-hidden="true" fill="currentColor" /></span>
    </button>}
  </div>;
}
