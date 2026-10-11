import Image from "next/image";
import Link from "next/link";
import { publicMetadata } from "@/lib/public-metadata";
import { site } from "@/lib/site-content";
import styles from "./AboutUs.module.css";

export const metadata = publicMetadata("About Us", "About Futsal Indoor Soccer and its Endeavour Hills competitions.", "/about-us/");

// Add a real match-action photo when supplied; don't substitute unrelated imagery.
const photos = [
  { src: "/images/fis-home-hero.webp", width: 2000, height: 1341, alt: "Six FIS teammates standing together in front of the futsal goal", className: styles.teamPhoto },
  { src: "/media/finals-2026/finals-mon-04.jpg", width: 1365, height: 2048, alt: "FIS players celebrating their finals win with medals and a champions board", className: styles.celebrationPhoto },
];

export default function AboutUsPage() {
  return (
    <div className={styles.page}>
      <div className="fis-container">
        <div className={styles.photos}>
          {photos.map((photo, index) => (
            <figure key={photo.src} className={`${styles.photo} ${photo.className}`}>
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 640px) 85vw, (max-width: 1200px) 42vw, 480px" preload={index === 0} />
            </figure>
          ))}
        </div>
        <div className={styles.copy}>
          <section aria-labelledby="about-us-title">
            <h1 id="about-us-title">ABOUT US</h1>
            <p>Futsal Indoor Soccer (FIS) is a weekly indoor soccer competition at Endeavour Hills Leisure Centre, bringing players together on Monday and Wednesday nights.</p>
            <p>We’re here for the football and the people who make it happen: teams who’ve played together for years, mates starting something new, and players finding their feet in a new squad. With regular fixtures, results and league tables, there’s a season to get stuck into and a reason to come back each week.</p>
          </section>
          <section aria-labelledby="room-for-you-title">
            <h2 id="room-for-you-title">THERE’S ROOM FOR YOU HERE</h2>
            <p>Already have a team? Bring them along. Have a few mates keen to play? We’ll help you build a squad. Coming on your own? We actively help individual players find teams.</p>
            <p>You can also get involved one game at a time. Our Facebook fill-in group connects teams looking for extra players with people looking for a game. Put your hand up to play, or post when your team needs someone.</p>
          </section>
          <div className={styles.actions}>
            <Link className={styles.register} href="/register/">REGISTER YOUR INTEREST</Link>
            <div className={styles.fillIns}>
              <a className={styles.fillInLink} href={site.fillIns}>FIND A GAME OR A FILL-IN ↗</a>
              <p>Join our Facebook fill-in group.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
