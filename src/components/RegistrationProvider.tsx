"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import { site } from "@/lib/site-content";

type RegistrationTab = "team" | "player" | "future";
const tabs: { value: RegistrationTab; label: string }[] = [{ value: "team", label: "Team" }, { value: "player", label: "Player" }, { value: "future", label: "Future Competitions" }];
const RegistrationContext = createContext<{ openRegistration: (tab?: RegistrationTab, trigger?: HTMLElement | null) => void } | null>(null);

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error("RegistrationProvider is required");
  return context;
}

export function RegisterButton({ tab = "team", children = "Register", className = "text-link" }: { tab?: RegistrationTab; children?: ReactNode; className?: string }) {
  const { openRegistration } = useRegistration();
  return <button type="button" className={className} aria-haspopup="dialog" onClick={(event) => openRegistration(tab, event.currentTarget)}>{children}</button>;
}

export default function RegistrationProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<RegistrationTab>("team");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previous;
      returnFocus.current?.focus();
    };
  }, [open]);

  function openRegistration(next: RegistrationTab = "team", trigger?: HTMLElement | null) {
    returnFocus.current = trigger ?? document.activeElement as HTMLElement;
    setTab(next); setOpen(true);
  }

  return <RegistrationContext.Provider value={{ openRegistration }}>
    {children}
    <dialog ref={dialog} className="registration-dialog" aria-labelledby="registration-title" aria-describedby="registration-intro" onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClick={(event) => {
      if (event.target !== dialog.current) return;
      const rect = dialog.current.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
    }}>
      {open && <>
        <div className="registration-banner"><h2 id="registration-title">Register</h2><p id="registration-intro">Team and player registrations are for the current Endeavour Hills competitions. Future competitions help us plan where and what to open next.</p><button className="dialog-close" aria-label="Close registration" onClick={() => setOpen(false)} autoFocus><X size={22} /></button></div>
        <div className="registration-body"><p className="fis-kicker">I&apos;m registering as a...</p>
          <div className="registration-tabs" role="tablist" aria-label="Registration type">{tabs.map(({ value, label }, index) => <button key={value} id={`registration-tab-${value}`} ref={(element) => { tabButtons.current[index] = element; }} type="button" role="tab" aria-selected={tab === value} aria-controls={`registration-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={(event) => {
            const target = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
            if (target !== null) { event.preventDefault(); setTab(tabs[target].value); tabButtons.current[target]?.focus(); }
          }}>{label}</button>)}</div>
          {tabs.map(({ value, label }) => <section key={value} id={`registration-panel-${value}`} role="tabpanel" aria-labelledby={`registration-tab-${value}`} hidden={tab !== value}>
            <h3>{label}{value !== "future" ? " Registration" : ""}</h3>
            {value === "team" && <p className="panel-copy">For the <strong>Endeavour Hills competition.</strong> Interested in another location? <button className="inline-link" onClick={() => setTab("future")}>Tell us here.</button></p>}
            {value === "player" && <><p className="panel-copy">Want to fill in for a team at <strong>Endeavour Hills?</strong> Share your details and preferred night. Interested in another location? <button className="inline-link" onClick={() => setTab("future")}>Tell us here.</button></p><p className="fill-in-note">Looking to fill in or find a player quickly? Visit the <a href={site.fillIns} target="_blank" rel="noopener noreferrer">FIS Fill-ins Facebook group.</a></p></>}
            {value === "future" && <p className="panel-copy">Tell us where and how you&apos;d like to play. For the current <strong>Endeavour Hills competition,</strong> choose <button className="inline-link" onClick={() => setTab("team")}>Team</button> or <button className="inline-link" onClick={() => setTab("player")}>Player</button>.</p>}
            <EnquiryForm kind={value} />
          </section>)}
        </div>
      </>}
    </dialog>
  </RegistrationContext.Provider>;
}
