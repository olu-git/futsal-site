export const metadata = {
  title: "Privacy Policy",
  description: "How Futsal Indoor Soccer collects and handles personal information.",
};

const sections = [
  ["Who we are", "Futsal Indoor Soccer (FIS) operates adult futsal competitions, currently including Monday and Wednesday night competitions at Endeavour Hills Leisure Centre."],
  ["Information we collect", "Depending on how you interact with FIS, we may collect your name, contact details, postcode, competition preferences, team information, player names, fixture and competition administration information, communications, and website analytics information."],
  ["How we use information", "We use information to respond to enquiries, assess registrations, organise teams and fixtures, record results, administer competition requirements, communicate operational updates, maintain records and improve the website. Optional marketing is only sent where separately selected."],
  ["Forms, storage and access", "Online enquiries may be processed by Web3Forms and delivered to the FIS email account. Information may also be stored in password-protected administration systems and restricted cloud storage. Access is limited to people who need it for their FIS role."],
  ["Google Analytics", "FIS uses Google Analytics to understand how visitors find and use the website. Analytics may collect information about devices, approximate location, pages visited and interactions. Browser settings and Google’s available controls can be used to restrict analytics cookies."],
  ["Sharing and overseas processing", "FIS does not sell personal information. Information may be shared with form, email, hosting, analytics, cloud-storage and competition-administration providers where reasonably necessary. Some providers may process information outside Australia."],
  ["Retention", "Information is kept only while reasonably useful for competition administration, safety, disputes, insurance or legal requirements. Signed forms, relevant payment-administration records, disciplinary records and incident material may be retained for up to seven years. Historical fixtures, results and tables may be retained indefinitely."],
  ["Access, correction and complaints", "Contact contact@futsalindoorsoccer.com.au to ask what personal information FIS holds, request a correction, withdraw optional marketing consent or raise a privacy concern. FIS may need to verify your identity before acting on a request."],
];

export default function PrivacyPage() {
  return <PolicyPage title="Privacy Policy" eyebrow="Last updated: 19 September 2026" sections={sections} />;
}

function PolicyPage({ title, eyebrow, sections }: { title: string; eyebrow: string; sections: string[][] }) {
  return (
    <div className="bg-[var(--fis-cream)] text-[var(--fis-blue)]">
      <section className="border-b-4 border-[var(--fis-red)] bg-[var(--fis-blue)] py-20 text-white sm:py-28">
        <div className="fis-container"><p className="fis-kicker text-[var(--fis-red)]">{eyebrow}</p><h1 className="mt-5 text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">{title}</h1></div>
      </section>
      <main className="fis-container max-w-4xl space-y-10 py-16 sm:py-24">
        {sections.map(([heading, body]) => <section key={heading}><h2 className="text-2xl font-black uppercase tracking-[-0.03em]">{heading}</h2><p className="mt-4 text-sm font-light leading-8 text-[var(--fis-ink)]">{body}</p></section>)}
      </main>
    </div>
  );
}
