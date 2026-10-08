import Link from "next/link";
import { replayVideos } from "@/data/fis-tv";
import ReplayPlayer from "./fis-tv/ReplayPlayer";

// Temporary hero-adjacent feature until new-season fixtures arrive. Move this
// component in HomeContent when repositioning; no season-driven switching.
export default function HomeTvFeature() {
  const video = replayVideos.find(replay => replay.id === "grand-final")!;
  return <section className="fis-container home-tv-entry" aria-labelledby="home-fis-tv">
    <div className="home-tv-heading">
      <div><h2 id="home-fis-tv">FIS TV</h2><h3 className="type-card-title">WATCH THE FINAL</h3></div>
      <Link className="text-link" href="/fis-tv">ENTER THE LOUNGE</Link>
    </div>
    <ReplayPlayer video={video} />
  </section>;
}
