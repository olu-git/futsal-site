import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import LeagueTable from "../src/components/LeagueTable";
import TeamKit from "../src/components/TeamKit";
import { competitionViews } from "../src/lib/competition-views";
import { jsonCompetitionData } from "../src/lib/competition-repository";
import { calculateTeamForm } from "../src/lib/team-form";

test("both table layouts show five accessible season-derived form squares per team", async () => {
  const { monday } = await competitionViews(jsonCompetitionData);
  const division = monday.divisions[0];
  for (const compact of [false, true]) {
    const markup = renderToStaticMarkup(<LeagueTable {...division} formByTeam={monday.formByTeam} compact={compact} />);
    const count = compact ? Math.min(5, division.standings.length) : division.standings.length;
    assert.match(markup, />FORM<\/th>/);
    assert.equal((markup.match(/role="listitem"/g) ?? []).length, count * 5);
    assert.match(markup, /oldest to newest/);
    assert.match(markup, /Match 5 of 5: Win/);
  }
});

test("table form follows the selected archived edition rather than the current season", async () => {
  const views = await competitionViews(jsonCompetitionData);
  for (const archive of views.history) {
    const results = archive.monday.results.flatMap(round => round.fixtures);
    for (const team of archive.monday.teams) {
      assert.deepEqual(archive.monday.formByTeam[team.id], calculateTeamForm(team.id, team, results));
    }
    assert(archive.monday.teams.some(team => views.monday.formByTeam[team.id] &&
      JSON.stringify(archive.monday.formByTeam[team.id]) !== JSON.stringify(views.monday.formByTeam[team.id])));
  }
});

test("white and yellow kits have dark SVG outlines without altering their fill", () => {
  for (const colour of ["#ffffff", "#FFDF00"]) {
    const markup = renderToStaticMarkup(<TeamKit colour={colour} />);
    assert(markup.includes(`fill="${colour}"`));
    assert.match(markup, /stroke="#111111"/);
  }
  const invalid = renderToStaticMarkup(<TeamKit colour="invalid" />);
  assert.match(invalid, /fill="var\(--fis-blue\)"/);
  assert.doesNotMatch(invalid, /fill="invalid"/);
});
