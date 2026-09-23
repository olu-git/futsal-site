import type { CSSProperties } from "react";

export default function TeamKit({ colour }: { colour?: string }) {
  const verifiedColour = colour && /^#[0-9a-f]{6}$/i.test(colour) ? colour : undefined;
  return <span aria-hidden="true" className="team-kit" style={verifiedColour ? { "--kit": verifiedColour } as CSSProperties : undefined} />;
}
