import type { Metadata } from "next";

export const publicOrigin = "https://www.futsalindoorsoccer.com.au";
export const socialCover = `${publicOrigin}/fis-social-cover.png`;

export function publicMetadata(title: string, description: string, path = "/"): Metadata {
  const url = new URL(path, publicOrigin).href;
  const socialTitle = title === "Futsal Indoor Soccer" ? title : `${title} | Futsal Indoor Soccer`;
  return {
    title: title === "Futsal Indoor Soccer" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle, description, url, siteName: "Futsal Indoor Soccer", type: "website",
      images: [{ url: socialCover, width: 1640, height: 624, alt: "Futsal Indoor Soccer branding on FIS blue" }],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [socialCover] },
  };
}
