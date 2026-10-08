"use client";

import { ExternalLink } from "lucide-react";
import type { ReplayVideo } from "@/data/fis-tv";
import ReplayPlayer from "./ReplayPlayer";
import styles from "./FisTv.module.css";

export default function ReplayCard({ video }: { video: ReplayVideo }) {
  return <article className={styles.replay}>
    <ReplayPlayer video={video} />
    <div className={styles.replayDetails}>
      <h3>{video.title}</h3>
      <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube (opens in a new tab)`}>YouTube <ExternalLink size={14} aria-hidden="true" /></a>
      {video.description && <p>{video.description}</p>}
    </div>
  </article>;
}
