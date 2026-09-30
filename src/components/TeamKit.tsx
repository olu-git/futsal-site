import type { CSSProperties } from "react";

export default function TeamKit({ colour }: { colour?: string }) {
  const verifiedColour = colour && /^#[0-9a-f]{6}$/i.test(colour) ? colour : undefined;
  const isLight = verifiedColour?.toLowerCase() === "#ffffff";
  return <span aria-hidden="true" className={`team-kit${isLight ? " team-kit-light" : ""}`} style={verifiedColour ? { "--kit": verifiedColour } as CSSProperties : undefined} />;
}
