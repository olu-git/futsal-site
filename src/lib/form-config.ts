export type EnquiryKind = "team" | "player" | "future" | "contact";

// Web3Forms browser access keys are public submission identifiers, not secret API keys.
// Separate configured keys take priority; the existing public inbox remains the fallback.
const existingInbox = "f7c8d697-8617-4e9d-b3c9-f1ee00820fd6";
export const enquiryForms = {
  team: { key: process.env.NEXT_PUBLIC_WEB3FORMS_TEAM_KEY || existingInbox, subject: "FIS - Team Registration" },
  player: { key: process.env.NEXT_PUBLIC_WEB3FORMS_PLAYER_KEY || existingInbox, subject: "FIS - Player Registration" },
  future: { key: process.env.NEXT_PUBLIC_WEB3FORMS_FUTURE_KEY || existingInbox, subject: "FIS - Future Competitions" },
  contact: { key: process.env.NEXT_PUBLIC_WEB3FORMS_CONTACT_KEY || existingInbox, subject: "FIS - Contact Enquiry" },
} satisfies Record<EnquiryKind, { key: string; subject: string }>;
