import Image from "next/image";
import type { ReactNode } from "react";

export default function PageHero({ title, children, image, imageAlt = "Futsal ball on the centre circle of an indoor court", home = false, className = "" }: {
  title: string; children?: ReactNode; image?: string; imageAlt?: string; home?: boolean; className?: string;
}) {
  return <section className={`page-hero ${home ? "home-hero" : ""} ${image ? "with-image" : ""} ${className}`}>
    {image && <><Image src={image} alt={imageAlt} fill priority sizes="100vw" className="hero-image" /><div className="hero-treatment" /></>}
    <div className="fis-container hero-content"><h1>{title}</h1>{children}</div>
  </section>;
}
