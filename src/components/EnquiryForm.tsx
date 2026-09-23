"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { enquiryForms, type EnquiryKind } from "@/lib/form-config";

type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "date" | "textarea"; required?: boolean; choices?: string[]; autoComplete?: string };
const phone: Field = { name: "phone", label: "Mobile Number", type: "tel", required: true, autoComplete: "tel" };
const email: Field = { name: "email", label: "Email Address", type: "email", required: true, autoComplete: "email" };
const postcode: Field = { name: "postcode", label: "Postcode", required: true, autoComplete: "postal-code" };
const gender: Field = { name: "gender", label: "Gender", choices: ["Male", "Female", "Other"], required: true };
const preferences: Field[] = [
  { name: "preferred_night", label: "Preferred Night", choices: ["Monday", "Wednesday", "Both"], required: true },
  { name: "division", label: "Division Preference", choices: ["Division A", "Division B"], required: true },
  { name: "preferred_start_date", label: "Preferred Start Date", type: "date", required: true },
];
const fieldSets: Record<EnquiryKind, Field[]> = {
  team: [{ name: "team_name", label: "Team Name", required: true }, { name: "captain_name", label: "Captain Full Name", required: true, autoComplete: "name" }, phone, email, postcode, gender, ...preferences],
  player: [{ name: "player_name", label: "Player Full Name", required: true, autoComplete: "name" }, postcode, phone, email, gender, ...preferences],
  future: [{ name: "name", label: "Full Name", required: true, autoComplete: "name" }, { name: "registering_as", label: "Registering As", choices: ["Team", "Individual"], required: true }, gender, postcode, phone, email],
  contact: [{ name: "first_name", label: "First Name", required: true, autoComplete: "given-name" }, { name: "last_name", label: "Last Name", required: true, autoComplete: "family-name" }, { ...phone, label: "Phone Number", required: false }, email, { name: "enquiry_type", label: "Enquiry Type", choices: ["General Enquiry", "Partnerships", "Other"], required: true }],
};
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EnquiryForm({ kind }: { kind: EnquiryKind }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState<string[]>([]);
  const submitting = useRef(false);
  const fields = [...fieldSets[kind], { name: "message", label: "Message", type: "textarea" } satisfies Field];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const errors = Array.from(form.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)
      .filter((element) => !element.validity.valid || (element.required && element.type !== "checkbox" && !element.value.trim())).map((element) => element.name);
    if (kind === "future" && !data.getAll("preferred_nights").length) errors.push("preferred_nights");
    setInvalid(errors);
    if (errors.length) {
      setStatus("error"); setMessage("Please fill in all required fields.");
      (form.elements.namedItem(errors[0]) instanceof RadioNodeList ? form.querySelector<HTMLInputElement>('input[name="preferred_nights"]') : form.elements.namedItem(errors[0]) as HTMLElement)?.focus();
      return;
    }
    submitting.current = true;
    setStatus("sending"); setMessage("");
    data.set("access_key", enquiryForms[kind].key);
    data.set("subject", enquiryForms[kind].subject);
    data.set("form_type", kind);
    data.set("from_name", "Futsal Indoor Soccer");
    if (kind === "future") data.set("preferred_nights", data.getAll("preferred_nights").join(", "));
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data, signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Submission failed");
      setStatus("success"); setMessage("Thanks. We’ll be in touch shortly about your enquiry.");
      form.reset();
    } catch {
      setStatus("error"); setMessage("Your enquiry could not be sent. Please try again or email contact@futsalindoorsoccer.com.au.");
    } finally { submitting.current = false; }
  }

  return <form className="enquiry-form" onSubmit={submit} noValidate aria-busy={status === "sending"}>
    <input type="checkbox" name="botcheck" className="honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" />
    {fields.filter((field) => field.name !== "message").map(renderField)}
    {kind === "future" && <fieldset className="night-options" aria-describedby={invalid.includes("preferred_nights") ? `${id}-status` : undefined}>
      <legend>Preferred Nights (select all that apply) <span className="required">*</span></legend>
      <div>{weekdays.map((day) => <label key={day}><input type="checkbox" name="preferred_nights" value={day} aria-invalid={invalid.includes("preferred_nights")} />{day}</label>)}</div>
    </fieldset>}
    {renderField(fields[fields.length - 1])}
    {kind !== "contact" && <label className="confirmation"><input type="checkbox" name="confirmation" required aria-invalid={invalid.includes("confirmation")} aria-describedby={invalid.includes("confirmation") ? `${id}-status` : undefined} /><span>I confirm my details are accurate and acknowledge the <Link href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link> and <Link href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</Link>. <span className="required">*</span></span></label>}
    <p id={`${id}-status`} className={`form-status ${status}`} role="status" aria-live="polite">{status === "sending" ? <span className="sr-only">Sending enquiry</span> : message}</p>
    <button type="submit" className="submit-button" disabled={status === "sending"}>{status === "sending" && <LoaderCircle size={16} className="sending-icon" aria-hidden="true" />}SUBMIT</button>
  </form>;

  function renderField(field: Field) {
    const fieldId = `${id}-${field.name}`;
    const shared = { id: fieldId, name: field.name, required: field.required, "aria-invalid": invalid.includes(field.name), "aria-describedby": invalid.includes(field.name) ? `${id}-status` : undefined };
    return <div key={field.name} className={`field ${field.type === "textarea" ? "field-wide" : ""}`}>
      <label htmlFor={fieldId}>{field.label}{field.required && <span className="required"> *</span>}</label>
      {field.choices ? <select {...shared} defaultValue=""><option value="" disabled></option>{field.choices.map((choice) => <option key={choice}>{choice}</option>)}</select>
        : field.type === "textarea" ? <textarea {...shared} rows={4} />
        : <input {...shared} type={field.type ?? "text"} autoComplete={field.autoComplete} inputMode={field.name === "postcode" ? "numeric" : undefined} placeholder={field.type === "tel" ? "04XX XXX XXX" : field.type === "email" ? "name@example.com" : undefined} />}
    </div>;
  }
}
