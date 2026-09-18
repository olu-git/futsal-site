export const metadata = {
  title: "Terms & Conditions",
  description: "Participation and website terms for Futsal Indoor Soccer.",
};

const sections = [
  ["Joining and eligibility", "FIS accepts enquiries for teams and individuals; an enquiry is not a confirmed place. Competitions are for participants aged 18 and over. Captains provide an initial roster and pass on participation information to their team. Every participant must follow the FIS Rules, including fill-in players."],
  ["Fixtures, results and fees", "An entire season may be published upfront, but match times, courts, opponents and results may change. Check the current published fixture and direct FIS notice before travelling. The Rules govern payment, bonds, late teams, no-shows, forfeits, eligibility and finals."],
  ["Code of conduct", "Treat players, referees, organisers and venue staff with respect. Abusive, threatening, discriminatory or violent behaviour is not permitted. FIS may remove a player from a match or competition after considering the circumstances."],
  ["Health, emergency response and cover", "Futsal carries physical injury risks. Each participant is responsible for assessing their own fitness and arranging suitable private health or personal accident cover. FIS does not provide player accident or injury insurance. In an emergency, a participant may be responsible for ambulance, treatment and related expenses. Nothing in these terms removes protections that cannot lawfully be excluded."],
  ["Photography and video", "Players may opt out of appearing in FIS photography or video and still participate. Email contact@futsalindoorsoccer.com.au or identify yourself to FIS staff before fixtures so reasonable steps can be taken to honour the request."],
  ["Website information and privacy", "Fixtures, scores and league tables are provided for information and may be corrected. Personal information is handled as described in the Privacy Policy. Optional marketing messages require a separate choice and can be stopped at any time."],
  ["Questions and changes", "Email contact@futsalindoorsoccer.com.au with questions, concerns, privacy requests or a photography and video opt-out. Material changes to these Terms should be dated and communicated through normal FIS channels."],
];

export default function TermsPage() {
  return (
    <div className="bg-[var(--fis-cream)] text-[var(--fis-blue)]">
      <section className="border-b-4 border-[var(--fis-red)] bg-[var(--fis-blue)] py-20 text-white sm:py-28"><div className="fis-container"><p className="fis-kicker text-[var(--fis-red)]">Futsal Indoor Soccer</p><h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">Terms &amp; Conditions</h1></div></section>
      <main className="fis-container max-w-4xl space-y-10 py-16 sm:py-24">{sections.map(([heading, body]) => <section key={heading}><h2 className="text-2xl font-black uppercase tracking-[-0.03em]">{heading}</h2><p className="mt-4 text-sm font-light leading-8 text-[var(--fis-ink)]">{body}</p></section>)}</main>
    </div>
  );
}
