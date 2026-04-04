import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#080808]">
      {/* Red accent line */}
      <div className="h-[3px] bg-red-600" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-red-600 rounded-sm" />
              <span
                className="text-xl uppercase tracking-wider leading-none text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Endeavour Hills{" "}
                <span className="text-red-500" style={{ fontFamily: "var(--font-heading)", fontSize: "inherit" }}>Futsal</span>
              </span>
            </div>
            <p className="text-sm text-white/40 max-w-xs font-[family-name:var(--font-sans)] leading-relaxed">
              Your local futsal competition. Monday and Wednesday nights.
              Compete and play the beautiful game.
            </p>
          </div>

          {/* Competition */}
          <div>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Competition
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/monday-night" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  Monday Night
                </Link>
              </li>
              <li>
                <Link href="/wednesday-night" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  Wednesday Night
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/monday-night" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  Standings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-[family-name:var(--font-sans)] text-sm font-semibold text-white/70 mb-1">
              Endeavour Hills Leisure Centre
            </p>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Contact Details
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:olumideykehinde@gmail.com" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)] break-all">
                  olumideykehinde@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:0402888767" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  0402 888 767
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                  <a href="https://www.google.com/maps/place/Endeavour+Hills+Leisure+Centre/@-37.9780005,145.2550069,17z/data=!3m1!4b1!4m6!3m5!1s0x6ad616e54fb79f93:0x3dcee589e869c490!8m2!3d-37.9780006!4d145.2598724!16s%2Fg%2F1w1129vc?entry=ttu&g_ep=EgoyMDI2MDQwMS4wIKXMDSoASAFQAw%3D%3D" className="text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]">
                  10 Raymond McMahon Blvd,<br />Endeavour Hills VIC 3802
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/futsalis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 transition-colors font-[family-name:var(--font-sans)]"
                >
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.05]">
          <p className="text-xs text-white/25 text-center font-[family-name:var(--font-geist-mono)]">
            &copy; {new Date().getFullYear()} Endeavour Hills Futsal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
