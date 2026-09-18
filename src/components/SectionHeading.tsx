interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  inverted?: boolean;
}

export default function SectionHeading({ title, subtitle, inverted = false }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className={`font-[family-name:var(--font-heading)] text-3xl font-black uppercase tracking-[-0.035em] text-center sm:text-[40px] ${inverted ? "text-white" : "text-[var(--fis-blue)]"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-sm font-light leading-7 text-center font-[family-name:var(--font-sans)] ${inverted ? "text-white/65" : "text-[var(--fis-ink)]/70"}`}>
          {subtitle}
        </p>
      )}
      <div className="h-1 w-16 bg-[var(--fis-red)]" />
    </div>
  );
}
