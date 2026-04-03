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
              <span className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider text-white">
                Futsal<span className="text-red-500">League</span>
              </span>
            </div>
            <p className="text-sm text-white/40 max-w-xs font-[family-name:var(--font-sans)] leading-relaxed">
              Your local futsal competition. Monday and Wednesday nights.
              Compete, connect, and play the beautiful game.
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

          {/* Info */}
          <div>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Info
            </h3>
            <ul className="space-y-2.5">
              <li className="text-sm text-white/40 font-[family-name:var(--font-sans)]">
                Division A Active
              </li>
              <li className="text-sm text-white/40 font-[family-name:var(--font-sans)]">
                Division B Coming Soon
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.05]">
          <p className="text-xs text-white/25 text-center font-[family-name:var(--font-geist-mono)]">
            &copy; {new Date().getFullYear()} Futsal League. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
