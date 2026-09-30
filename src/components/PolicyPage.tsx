import PageHero from "./PageHero";

export interface PolicySection { heading: string; paragraphs: string[]; }

export default function PolicyPage({ title, updated, sections }: { title: string; updated?: string; sections: PolicySection[] }) {
  return <><PageHero title={title} /><article className="fis-container prose">
    {updated && <p className="policy-date">Last updated: {updated}</p>}
    {sections.map(({ heading, paragraphs }) => <section key={heading}><h2>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
  </article></>;
}
