import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ReplayCard from "@/components/fis-tv/ReplayCard";
import PhotoGallery from "@/components/fis-tv/PhotoGallery";
import styles from "@/components/fis-tv/FisTv.module.css";
import { galleryPhotos, photoCollections, replayVideos } from "@/data/fis-tv";

const description = "FIS TV — The Matchday Lounge. Watch FIS match replays and explore photography from Futsal Indoor Soccer.";
const url = "https://www.futsalindoorsoccer.com.au/fis-tv/";
export const metadata: Metadata = {
  title: "FIS TV", description,
  alternates: { canonical: url },
  openGraph: { title: "FIS TV | Futsal Indoor Soccer", description, url, type: "website", images: [{ url: "https://www.futsalindoorsoccer.com.au/media/finals-2026/finals-mon-01.jpg", width: 1365, height: 2048, alt: "FIS players with their medals and champions board" }] },
  twitter: { card: "summary_large_image", title: "FIS TV", description, images: ["https://www.futsalindoorsoccer.com.au/media/finals-2026/finals-mon-01.jpg"] },
};

export default function FisTvPage() {
  return <>
    <PageHero title="FIS TV" className={styles.hero}>
      <p>THE MATCHDAY LOUNGE</p>
      <svg className={styles.heroArtwork} viewBox="0 0 1600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <filter id="fis-tv-grain"><feTurbulence type="fractalNoise" baseFrequency=".65 .08" numOctaves="2" seed="8" /><feColorMatrix type="saturate" values="0" /></filter>
          <pattern id="fis-tv-pixels" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="white" /></pattern>
          <mask id="fis-tv-court"><rect width="1600" height="460" fill="url(#fis-tv-pixels)" /></mask>
        </defs>
        <rect width="1600" height="460" filter="url(#fis-tv-grain)" opacity=".16" style={{ mixBlendMode: "soft-light" }} />
        <g fill="none" stroke="#63b7ff" strokeWidth="12" opacity=".32" mask="url(#fis-tv-court)">
          <path d="M1240 0v460" /><circle cx="1240" cy="230" r="132" />
        </g>
        <path d="M70 32H34v36M1530 32h36v36M70 428H34v-36M1530 428h36v-36" fill="none" stroke="#63b7ff" strokeWidth="6" opacity=".3" />
        <path d="M94 54h13v13H94zM121 54h13v13h-13zM148 54h13v13h-13zM1434 393h12v12h-12zM1455 393h12v12h-12zM1476 393h12v12h-12zM1497 393h12v12h-12z" fill="var(--fis-red)" />
      </svg>
    </PageHero>
    <div className="fis-container">
      <section className={styles.section} aria-labelledby="the-replay">
        <header className={styles.sectionHeading}><p className="eyebrow">On the court</p><h2 id="the-replay" className="type-section-title">THE REPLAY</h2><p>Relive the action from our latest knockout stages.</p></header>
        <div className={styles.replays}>{[...replayVideos].sort((a, b) => a.order - b.order).map((video) => <ReplayCard key={video.id} video={video} />)}</div>
      </section>
      <section className={`${styles.section} ${styles.gallerySection}`} aria-labelledby="the-gallery">
        <header className={styles.sectionHeading}><h2 id="the-gallery" className="type-section-title">THE GALLERY</h2></header>
        {[...photoCollections].sort((a, b) => a.order - b.order).map((collection) => {
          const photos = galleryPhotos.filter((photo) => photo.collectionId === collection.id).sort((a, b) => a.order - b.order);
          return photos.length ? <PhotoGallery key={collection.id} collection={collection} photos={photos} /> : null;
        })}
      </section>
    </div>
  </>;
}
