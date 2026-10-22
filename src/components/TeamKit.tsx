export default function TeamKit({ colour }: { colour?: string }) {
  const verifiedColour = colour && /^#[0-9a-f]{6}$/i.test(colour) ? colour : undefined;
  const rgb = verifiedColour ? [1, 3, 5].map(offset => parseInt(verifiedColour.slice(offset, offset + 2), 16) / 255) : [];
  const luminance = rgb.reduce((total, value, index) => total + [0.2126, 0.7152, 0.0722][index] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4), 0);
  const outlined = luminance > 0.55;
  return <span aria-hidden="true" className={`team-kit${outlined ? " team-kit-light" : ""}`}>
    <svg viewBox="0 0 22 22" focusable="false">
      <path d="M6 2H8L9 4H13L14 2H16V4H18V6H20V10H16V20H6V10H2V6H4V4H6Z"
        fill={verifiedColour ?? "var(--fis-blue)"} stroke={outlined ? "#111111" : "none"} strokeWidth="1.2" strokeLinejoin="miter" />
      <path d="M8 2L9 4H13L14 2" fill="none" stroke={outlined ? "#111111" : "#ffffff"} strokeOpacity={outlined ? 1 : 0.4} strokeWidth="1" />
    </svg>
  </span>;
}
