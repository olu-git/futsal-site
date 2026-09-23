import Image from "next/image";
import PageHero from "@/components/PageHero";
import { champions, site } from "@/lib/site-content";

export const metadata = { title: "About Us", description: "About Futsal Indoor Soccer and its Endeavour Hills competitions." };

export default function AboutUsPage() {
  return <><PageHero title="About Us" image={site.actionPhoto} />
    <section className="fis-container prose"><h2>Competitive and social futsal</h2>
      <p>Futsal Indoor Soccer runs organised adult competitions for teams who want a reliable place to compete, stay active and enjoy the game.</p>
      <p>Our Monday and Wednesday competitions at Endeavour Hills Leisure Centre bring together competitive football and a welcoming local community. FIS is designed to grow into more locations, nights, divisions and competition formats as demand develops.</p>
      {site.communityPhoto && <figure className="about-photo"><Image src={site.communityPhoto} alt={site.communityCaption ?? "The Futsal Indoor Soccer community"} width={1200} height={700} /><figcaption>{site.communityCaption}</figcaption></figure>}
    </section>
    {champions.length > 0 && <section className="fis-container fis-section"><p className="eyebrow">Current champions</p><h2 className="section-title">League Winners</h2><div className="champions">{champions.map((champion) => <figure key={champion.night}><Image src={champion.image} alt={`${champion.teamName}, ${champion.caption}`} width={900} height={600} /><figcaption><strong>{champion.teamName}</strong><br />{champion.caption}</figcaption></figure>)}</div></section>}
  </>;
}
