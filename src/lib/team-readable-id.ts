// Only these four verified 2026 S1 memberships are being renamed.
// Keep original import seeds: readable labels must not change database UUIDs.
export const readableTeamIdChanges = [
  { oldId: "mon-toss", newId: "mon-king-adl", uuid: "04ebec43-f537-52b4-bbae-ffe3449b7826" },
  { oldId: "wed-toss", newId: "wed-king-adl", uuid: "402549b9-1e74-51ff-b058-9749e72ddd74" },
  { oldId: "mon-declans-team", newId: "mon-declans-delinquents", uuid: "5ab40935-7320-536b-a625-13661e1cdb8d" },
] as const;

export const kuqEZiIdentity = { newId: "wed-kuq-e-zi", uuid: "629727a3-27fb-59de-a790-c578aeffd38f" } as const;

export function canonicalTeamReadableId(id: string, membershipUuid?: string): string {
  if (membershipUuid === kuqEZiIdentity.uuid) return kuqEZiIdentity.newId;
  return readableTeamIdChanges.find((change) => change.oldId === id && (!membershipUuid || change.uuid === membershipUuid))?.newId ?? id;
}

export function originalTeamImportId(id: string): string {
  // Historical 2026 S1 UUID seed only, never a current identity alias.
  if (id === kuqEZiIdentity.newId) return "wed-xaywan";
  return readableTeamIdChanges.find((change) => change.newId === id)?.oldId ?? id;
}
