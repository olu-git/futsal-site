"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[360px] flex items-center justify-center border-b-4 border-[var(--fis-red)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#001744ee] via-[#002469c4] to-[#001132ee]" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="flex flex-col items-center">
            <h1 className="font-[family-name:var(--font-heading)] text-6xl sm:text-7xl lg:text-8xl uppercase tracking-wider text-white leading-none">
              Contact Us
            </h1>
            <p className="mt-5 text-white/50 text-sm font-[family-name:var(--font-geist-mono)] max-w-md">
              Questions about registering, joining a team, or anything else — we&apos;re happy to help.
            </p>
          </div>
        </div>

      </section>

      {/* Main content */}
      <section className="bg-[var(--fis-cream)] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left — contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-[var(--fis-blue)]">
                  Get in touch
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fis-blue)]/75">
                  Want to join the league or don&apos;t have a full team? <br/><br/> We want everyone to have the opportunity to play so whether you&apos;re short on players, a new team
                  or you want to join as an individual, fill out the form!
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--fis-blue)]/10 border border-[var(--fis-blue)]/20 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[var(--fis-red)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fis-blue)]/55 uppercase tracking-wider mb-1">Email</p>
                    <a
                      href="mailto:contact@futsalindoorsoccer.com.au"
                      className="text-sm text-[var(--fis-blue)] hover:text-[var(--fis-red)] transition-colors"
                    >
                      contact@futsalindoorsoccer.com.au
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fis-blue)]/55 uppercase tracking-wider mb-1">Phone</p>
                    <a
                      href="tel:+61402888767"
                      className="text-sm text-[var(--fis-blue)] hover:text-[var(--fis-red)] transition-colors"
                    >
                      0402 888 767
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fis-blue)]/55 uppercase tracking-wider mb-1">Venue</p>
                    <p className="text-sm text-[var(--fis-blue)]">Endeavour Hills Leisure Centre</p>
                    <p className="text-sm text-[var(--fis-blue)]/65">Heatherton Rd, Endeavour Hills VIC 3802</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fis-blue)]/55 uppercase tracking-wider mb-1">Facebook</p>
                    <a
                      href="https://www.facebook.com/futsalis/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--fis-blue)] hover:text-[var(--fis-red)] transition-colors"
                    >
                      Endeavour Hills Futsal
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-[var(--fis-blue)]/15 bg-white p-6 sm:p-8 shadow-sm">
                {status === "success" ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <h3 className="text-xl font-black uppercase tracking-wider text-[var(--fis-blue)]">
                      Message Sent!
                    </h3>
                    <p className="text-sm text-[var(--fis-blue)]/70 max-w-xs">
                      Thanks for reaching out. We&apos;ll get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-4 rounded-md border border-white/10 bg-white/[0.05] px-5 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors font-[family-name:var(--font-geist-mono)] uppercase tracking-wider"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Web3Forms access key */}
                    <input type="hidden" name="access_key" value="f7c8d697-8617-4e9d-b3c9-f1ee00820fd6" />
                    <input type="hidden" name="subject" value="New Enquiry — Endeavour Hills Futsal" />
                    {/* Honeypot spam protection */}
                    <input type="checkbox" name="botcheck" className="hidden" />

                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          required
                          placeholder="John"
                          className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          required
                          placeholder="Smith"
                          className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Phone + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="04XX XXX XXX"
                          className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="john@example.com"
                          className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Enquiry type */}
                    <div>
                      <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                        Enquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="enquiry_type"
                        required
                        defaultValue=""
                        className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors appearance-none"
                      >
                        <option value="" disabled className="text-white/30">Select an enquiry type…</option>
                        <option value="Team Registration">Team Registration</option>
                        <option value="Individual / Free Agent">Individual / Free Agent</option>
                        <option value="Monday Night">Monday Night Competition</option>
                        <option value="Wednesday Night">Wednesday Night Competition</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs text-white/40 font-[family-name:var(--font-geist-mono)] uppercase tracking-wider mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us what you need…"
                        className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                      />
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        Something went wrong. Please try again or email us directly.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white uppercase tracking-wider font-[family-name:var(--font-geist-mono)] hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === "submitting" ? "Sending…" : "Send Enquiry"}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
