interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  inverted?: boolean;
}

export default function SectionHeading({ title, subtitle, inverted = false }: SectionHeadingProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <h2 className={`type-page-title w-full max-w-full uppercase text-center ${inverted ? "text-white" : "text-[var(--fis-blue)]"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`type-body-compact w-full max-w-3xl text-center ${inverted ? "text-white/75" : "text-[var(--fis-ink)]/75"}`}>
          {subtitle}
        </p>
      )}
      <div className="h-1 w-16 bg-[var(--fis-red)]" />
    </div>
  );
}
