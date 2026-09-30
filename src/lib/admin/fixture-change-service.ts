import { compareFixtureChange, parseFixtureChangeUpload, validateFixtureChanges,
  type ChangeSetSource, type ChangeSetStatus, type FixtureChange, type FixtureChangeContext,
  type FixtureChangeUpload, type ScheduleFixture, type ValidationMessage } from "./fixture-changes";

export interface FixtureChangeSetRecord {
  id: string;
  competitionSeasonId: string;
  title: string;
  overallNote: string | null;
  status: ChangeSetStatus;
  source: ChangeSetSource;
  version: number;
  createdBy: string;
  reviewedBy: string | null;
  publishedBy: string | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  validationMessages: ValidationMessage[];
  warningsAcknowledgedAt: string | null;
}

export interface FixtureChangeItemRecord {
  id: string;
  changeSetId: string;
  ordinal: number;
  change: FixtureChange;
  original: ScheduleFixture | null;
}

export interface FixtureChangeHistoryRecord {
  changeSetId: string;
  itemId: string;
  fixtureId: string;
  reason: string;
  before: ScheduleFixture | null;
  after: ScheduleFixture | null;
  publishedBy: string;
  publishedAt: string;
}

// The browser implementation will use caller-scoped Supabase RPCs. This contract
// deliberately exposes no direct write to public.fixtures or published items.
export interface FixtureChangeRepository {
  listFixtures(competitionSeasonId: string): Promise<ScheduleFixture[]>;
  // Load all published occupancy at the edition's physical location before local validation.
  listLocationFixtures(locationId: string): Promise<ScheduleFixture[]>;
  loadValidationContext(competitionSeasonId: string): Promise<FixtureChangeContext>;
  listChangeSets(competitionSeasonId: string): Promise<FixtureChangeSetRecord[]>;
  getChangeSet(id: string): Promise<{ set: FixtureChangeSetRecord; items: FixtureChangeItemRecord[] }>;
  createDraft(input: { competitionSeasonId: string; title: string; overallNote?: string; source: ChangeSetSource }): Promise<FixtureChangeSetRecord>;
  replaceDraftItems(id: string, expectedVersion: number, changes: FixtureChange[]): Promise<FixtureChangeSetRecord>;
  validateDraft(id: string): Promise<ValidationMessage[]>;
  submitForReview(id: string, expectedVersion: number, acknowledgeWarnings: boolean): Promise<FixtureChangeSetRecord>;
  returnToDraft(id: string, expectedVersion: number): Promise<FixtureChangeSetRecord>;
  publishAtomically(id: string, expectedVersion: number): Promise<FixtureChangeSetRecord>;
  cancelDraftOrReview(id: string, expectedVersion: number): Promise<FixtureChangeSetRecord>;
  listHistory(competitionSeasonId: string): Promise<FixtureChangeHistoryRecord[]>;
}

export function prepareFixtureChangeUpload(input: string | unknown, context: FixtureChangeContext) {
  const upload: FixtureChangeUpload = parseFixtureChangeUpload(input);
  const messages = validateFixtureChanges(upload, context);
  const fixtures = new Map(context.fixtures.map((fixture) => [fixture.id, fixture]));
  const comparisons = upload.changes.map((change) => compareFixtureChange(change.fixtureId ? fixtures.get(change.fixtureId) ?? null : null, change));
  return { upload, messages, comparisons, publishable: !messages.some((message) => message.severity === "blocking") };
}
