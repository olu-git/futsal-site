interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-[40px] uppercase tracking-wider text-white text-center">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-white/50 text-center font-[family-name:var(--font-sans)]">
          {subtitle}
        </p>
      )}
      <div className="w-[60px] h-[3px] bg-red-600" />
    </div>
  );
}
