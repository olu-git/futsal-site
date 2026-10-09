import { readFileSync } from "node:fs";
import { validateMondayDraft, validateWednesdayDraft } from "./lib/validate-new-season-draft";
const read = (night: string) => JSON.parse(readFileSync(`docs/drafts/${night}-rounds.json`, "utf8"));
console.log(JSON.stringify({ monday: validateMondayDraft(read("monday")), wednesday: validateWednesdayDraft(read("wednesday")) }, null, 2));
