"use client";

import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { ReplayVideo } from "@/data/fis-tv";
import styles from "./FisTv.module.css";

export default function ReplayCard({ video }: { video: ReplayVideo }) {
  const [loaded, setLoaded] = useState(false);
  return <article className={styles.replay}>
    <div className={styles.player}>
      {loaded ? <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=0&rel=0&playsinline=1`}
        title={`${video.title} — FIS match replay`}
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={(event) => event.currentTarget.focus()}
      /> : <button type="button" className={styles.poster} onClick={() => setLoaded(true)} aria-label={`Load ${video.title} video player`}>
        <Image src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" />
        <span className={styles.playIcon}><Play aria-hidden="true" fill="currentColor" /></span>
      </button>}
    </div>
    <div className={styles.replayDetails}>
      <div><h3>{video.title}</h3><p>{video.description ?? video.competition}</p></div>
      <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube (opens in a new tab)`}>YouTube <ExternalLink size={14} aria-hidden="true" /></a>
    </div>
  </article>;
}
