export type ResultIntent = "draft" | "pending_review" | "publish";
export type Side = "home" | "away";

export type ResultInput = {
  fixtureId: string;
  resultId?: string | null;
  supersedesResultId?: string | null;
  correctionReason?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  forfeitSide?: Side | null;
  forfeitExceptionReason?: string | null;
  penaltyHomeScore?: number | null;
  penaltyAwayScore?: number | null;
  penaltyWinner?: Side | null;
};

export type FixtureResultContext = {
  stage: "regular_season" | "knockout" | "grading";
  publishedResultId?: string | null;
  editableResultId?: string | null;
  editableStatus?: "draft" | "pending_review" | null;
};

export class ResultRuleError extends Error {}

function validScore(value: number | null | undefined) {
  return value == null || Number.isInteger(value) && value >= 0;
}

export function normaliseResultInput(input: ResultInput): ResultInput {
  if (!input.forfeitSide || input.forfeitExceptionReason?.trim()) return input;
  const standard = input.forfeitSide === "home" ? { homeScore: 0, awayScore: 5 } : { homeScore: 5, awayScore: 0 };
  return { ...input, ...standard };
}

export function validateResultInput(input: ResultInput, context: FixtureResultContext, intent: ResultIntent) {
  if (!input.fixtureId) throw new ResultRuleError("A fixture is required.");
  if (![input.homeScore, input.awayScore, input.penaltyHomeScore, input.penaltyAwayScore].every(validScore)) {
    throw new ResultRuleError("Scores must be whole numbers of zero or more.");
  }
  if (context.publishedResultId && !input.supersedesResultId) {
    throw new ResultRuleError("Published results cannot be edited directly. Create a correction instead.");
  }
  if (input.supersedesResultId && input.supersedesResultId !== context.publishedResultId) {
    throw new ResultRuleError("This correction is stale. Refresh and create a correction from the current result.");
  }
  if (input.supersedesResultId && !input.correctionReason?.trim()) throw new ResultRuleError("A correction reason is required.");
  if (input.forfeitSide) {
    const standard = input.forfeitSide === "home"
      ? input.homeScore === 0 && input.awayScore === 5
      : input.homeScore === 5 && input.awayScore === 0;
    if (!standard && !input.forfeitExceptionReason?.trim()) {
      throw new ResultRuleError("Explain why this forfeit does not use the standard 5-0 score.");
    }
  } else if (input.forfeitExceptionReason) {
    throw new ResultRuleError("A forfeit exception reason requires a forfeiting side.");
  }
  const penaltyValues = [input.penaltyHomeScore, input.penaltyAwayScore, input.penaltyWinner];
  const hasPenalties = penaltyValues.some((value) => value != null);
  if (context.stage !== "knockout" && hasPenalties) throw new ResultRuleError("Penalty scores are only available for knockout fixtures.");
  if (intent !== "draft") {
    if (input.homeScore == null || input.awayScore == null) throw new ResultRuleError("Complete both scores first.");
    if (context.stage === "knockout" && input.homeScore === input.awayScore) {
      if (penaltyValues.some((value) => value == null)) throw new ResultRuleError("A tied knockout result requires complete penalty scores and a winner.");
      if (input.penaltyHomeScore === input.penaltyAwayScore) throw new ResultRuleError("Penalty scores cannot be tied.");
      const winnerMatches = input.penaltyWinner === "home"
        ? Number(input.penaltyHomeScore) > Number(input.penaltyAwayScore)
        : Number(input.penaltyAwayScore) > Number(input.penaltyHomeScore);
      if (!winnerMatches) throw new ResultRuleError("The penalty winner must match the shootout score.");
    } else if (hasPenalties) throw new ResultRuleError("Penalty scores require a tied knockout result.");
  }
}
