interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  inverted?: boolean;
}

export default function SectionHeading({ title, subtitle, inverted = false }: SectionHeadingProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <h2 className={`w-full max-w-full font-[family-name:var(--font-heading)] text-3xl font-black uppercase text-center sm:text-[40px] ${inverted ? "text-white" : "text-[var(--fis-blue)]"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`w-full max-w-full text-sm font-light leading-7 text-center font-[family-name:var(--font-sans)] ${inverted ? "text-white/65" : "text-[var(--fis-ink)]/70"}`}>
          {subtitle}
        </p>
      )}
      <div className="h-1 w-16 bg-[var(--fis-red)]" />
    </div>
  );
}
