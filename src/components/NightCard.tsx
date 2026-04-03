"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface NightCardProps {
  title: string;
  href: string;
  description: string;
  index?: number;
}

export default function NightCard({ title, href, description, index = 0 }: NightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="group block rounded-lg border border-white/10 bg-[#1A1A1A] p-6 hover:border-red-500/30 transition-all"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-6 rounded-sm bg-red-600" />
          <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-white/50 leading-relaxed font-[family-name:var(--font-sans)]">
          {description}
        </p>
      </Link>
    </motion.div>
  );
}
