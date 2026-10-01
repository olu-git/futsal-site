"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import RegistrationContent, { type RegistrationTab } from "./RegistrationContent";

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
  const [instance, setInstance] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

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
    setTab(next);
    setInstance((current) => current + 1);
    setOpen(true);
  }

  return <RegistrationContext.Provider value={{ openRegistration }}>
    {children}
    <dialog ref={dialog} className="registration-dialog" aria-labelledby="registration-title" aria-describedby="registration-intro" onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClick={(event) => {
      if (event.target !== dialog.current) return;
      const rect = dialog.current.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false);
    }}>
      {open && <RegistrationContent key={instance} idPrefix="registration" initialTab={tab} onClose={() => setOpen(false)} scrollContainer={dialog} />}
    </dialog>
  </RegistrationContext.Provider>;
}
