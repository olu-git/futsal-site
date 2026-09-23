export const site = {
  name: "Futsal Indoor Soccer",
  email: "contact@futsalindoorsoccer.com.au",
  phone: "0402 888 767",
  telephone: "tel:+61402888767",
  venue: "Endeavour Hills Leisure Centre",
  address: "10 Raymond McMahon Blvd, Endeavour Hills VIC 3802",
  directions: "https://www.google.com/maps/dir/?api=1&destination=Endeavour+Hills+Leisure+Centre+10+Raymond+McMahon+Blvd",
  fillIns: "https://www.facebook.com/groups/1584889639197944",
  logo: "/logos/FIS-01-Primary-Black.svg",
  actionPhoto: "/hero-bg.png",
  // Awaiting the approved community image asset.
  communityPhoto: null as string | null,
  communityCaption: null as string | null,
  favicon: "/logos/FIS-04-Secondary-Profile-Colour.png",
  socials: [
    { name: "Facebook", href: "https://www.facebook.com/futsalis/" },
    { name: "Instagram", href: "https://www.instagram.com/futsalindoorsoccer/" },
    { name: "YouTube", href: "https://www.youtube.com/@futsalindoorsoccer" },
    { name: "Email", href: "mailto:contact@futsalindoorsoccer.com.au" },
  ],
};

export interface ChampionPhoto {
  night: "monday" | "wednesday";
  teamName: string;
  image: string;
  caption: string;
}
// Publish only confirmed winners with approved team photos, never infer from a ladder.
export const champions: ChampionPhoto[] = [];
