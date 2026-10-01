"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import { site } from "@/lib/site-content";

export type RegistrationTab = "team" | "player" | "future";

const tabs: { value: RegistrationTab; label: string }[] = [
  { value: "team", label: "Team" },
  { value: "player", label: "Player" },
  { value: "future", label: "Future Competitions" },
];

export default function RegistrationContent({ initialTab = "team", idPrefix, onClose, scrollContainer }: {
  initialTab?: RegistrationTab;
  idPrefix: string;
  onClose?: () => void;
  scrollContainer?: React.RefObject<HTMLDialogElement | null>;
}) {
  const [tab, setTab] = useState<RegistrationTab>(initialTab);
  const [submitted, setSubmitted] = useState(false);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!submitted) return;
    confirmationHeading.current?.focus({ preventScroll: true });
    if (scrollContainer?.current) scrollContainer.current.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [submitted, scrollContainer]);

  function selectTab(next: RegistrationTab) {
    setTab(next);
    setSubmitted(false);
  }

  return <>
    <div className="registration-banner">
      {onClose ? <h2 id={`${idPrefix}-title`}>Register</h2> : <h1 id={`${idPrefix}-title`}>Register</h1>}
      <p id={`${idPrefix}-intro`}>Team and player registrations are for the current Endeavour Hills competitions. Future competitions help us plan where and what to open next.</p>
      {onClose && <button type="button" className="dialog-close" aria-label="Close registration" onClick={onClose} autoFocus><X size={22} /></button>}
    </div>
    <div className={`registration-body${submitted ? " is-submitted" : ""}`}>
      <p className="fis-kicker">{submitted ? "ENQUIRY RECEIVED" : "I'm registering as a..."}</p>
      <div className="registration-tabs" role="tablist" aria-label="Registration type">{tabs.map(({ value, label }, index) => <button key={value} id={`${idPrefix}-tab-${value}`} ref={(element) => { tabButtons.current[index] = element; }} type="button" role="tab" aria-selected={tab === value} aria-controls={`${idPrefix}-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => selectTab(value)} onKeyDown={(event) => {
        const target = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
        if (target !== null) { event.preventDefault(); selectTab(tabs[target].value); tabButtons.current[target]?.focus(); }
      }}>{label}</button>)}</div>
      {tabs.map(({ value, label }) => <section key={value} id={`${idPrefix}-panel-${value}`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${value}`} hidden={tab !== value}>
        {tab === value && (submitted ? <div className="registration-confirmation" role="status" aria-live="polite">
          <CheckCircle2 aria-hidden="true" size={48} strokeWidth={1.8} />
          <h3 ref={confirmationHeading} tabIndex={-1}>Registration submitted</h3>
          <p>Your enquiry has been sent. We&apos;ll be in touch shortly.</p>
        </div> : <>
          <h3>{label}{value !== "future" ? " Registration" : ""}</h3>
          {value === "team" && <p className="panel-copy">For the <strong>Endeavour Hills competition.</strong> Interested in another location? <button type="button" className="inline-link" onClick={() => selectTab("future")}>Tell us here.</button></p>}
          {value === "player" && <><p className="panel-copy">Want to fill in for a team at <strong>Endeavour Hills?</strong> Share your details and preferred night. Interested in another location? <button type="button" className="inline-link" onClick={() => selectTab("future")}>Tell us here.</button></p><p className="fill-in-note">Looking to fill in or find a player quickly? Visit the <a href={site.fillIns} target="_blank" rel="noopener noreferrer">FIS Fill-ins Facebook group.</a></p></>}
          {value === "future" && <p className="panel-copy">Tell us where and how you&apos;d like to play. For the current <strong>Endeavour Hills competition,</strong> choose <button type="button" className="inline-link" onClick={() => selectTab("team")}>Team</button> or <button type="button" className="inline-link" onClick={() => selectTab("player")}>Player</button>.</p>}
          <EnquiryForm kind={value} onSuccess={() => setSubmitted(true)} />
        </>)}
      </section>)}
    </div>
  </>;
}
