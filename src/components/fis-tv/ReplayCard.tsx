"use client";

import { ExternalLink } from "lucide-react";
import type { ReplayVideo } from "@/data/fis-tv";
import ReplayPlayer from "./ReplayPlayer";
import styles from "./FisTv.module.css";

export default function ReplayCard({ video }: { video: ReplayVideo }) {
  return <article className={styles.replay}>
    <ReplayPlayer video={video} />
    <div className={styles.replayDetails}>
      <div><h3>{video.title}</h3><p>{video.description ?? video.competition}</p></div>
      <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube (opens in a new tab)`}>YouTube <ExternalLink size={14} aria-hidden="true" /></a>
    </div>
  </article>;
}
