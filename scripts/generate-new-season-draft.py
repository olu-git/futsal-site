"""Generate dated local review drafts only; never writes live competition data.
Monday's existing approved round/time assignments are preserved when dating.
Independent TypeScript validation checks both complete schedules.
"""
import json
import random
from datetime import date, timedelta
from pathlib import Path

NAMES = ['AFG', 'Blue Dragons', 'Goldlink Up', 'Misfits', 'Ghazni United',
         'Wildcats', 'Nassaji FC', 'Salvos', 'Hunger FC', 'King ADL',
         'Xaywan', 'Hope', 'Bunyip', "Declan's Delinquents"]
IDS = ['mon-afg', 'mon-blue-dragons', 'mon-goldlink-up', 'mon-misfits',
       'mon-ghazni-united', 'mon-wildcats', 'mon-nassaji-fc', 'mon-salvos',
       'mon-hunger-fc', 'mon-king-adl', 'mon-xaywan', 'mon-hope',
       'mon-bunyip', 'mon-declans-delinquents']


def pair(a, b):
    return tuple(sorted((a, b)))


def counts():
    c = {pair(a, b): 2 for a in range(14) for b in range(a + 1, 14)}
    def set_count(a, b, value):
        c[pair(NAMES.index(a), NAMES.index(b))] = value
    for t in ['Bunyip', "Declan's Delinquents"]:
        set_count('Xaywan', t, 0)
    for a, b in [('Bunyip', "Declan's Delinquents"), ('Bunyip', 'Misfits'), ("Declan's Delinquents", 'Misfits')]:
        set_count(a, b, 3)
    for t in ['AFG', 'Blue Dragons', 'Hope', 'Salvos']:
        set_count('Xaywan', t, 3)
    for a, b in [('Misfits', 'AFG'), ('Misfits', 'Blue Dragons'), ('Hope', 'Salvos')]:
        set_count(a, b, 1)
    return c


def make_rounds():
    # Restart bounded deterministic searches; no hard-rule relaxation.
    rng = random.Random(20261010)
    target = counts()
    # Split the approved 26-regular multigraph into two 13-regular halves.
    # Every two-meeting pair occurs once in each half. The spare triangle/Xaywan
    # games are distributed so each team still plays exactly 13 in either half.
    first = {p: min(value, 1) for p, value in target.items()}
    for a, b in [('Bunyip', "Declan's Delinquents"), ('Xaywan', 'Hope'), ('Xaywan', 'Salvos')]:
        first[pair(NAMES.index(a), NAMES.index(b))] = 2
    first[pair(NAMES.index('Hope'), NAMES.index('Salvos'))] = 0
    second = {p: target[p] - first[p] for p in target}
    assert all(sum(value for p, value in half.items() if team in p) == 13 for half in [first, second] for team in range(14))
    for attempt in range(2000):
        remaining, last, rounds = first.copy(), {}, []
        for r in range(1, 27):
            if r == 14:
                if any(remaining.values()):
                    break
                remaining = second.copy()
            forced = [pair(5, 6)] if r == 1 else []
            used = {v for p in forced for v in p}
            def matching(free, chosen):
                if not free:
                    return chosen
                options = {a: [b for b in free if a != b and remaining[pair(a, b)] > 0 and last.get(pair(a, b), -99) <= r - 4] for a in free}
                a = min(free, key=lambda v: (len(options[v]), rng.random()))
                if not options[a]:
                    return None
                # Exhaust low-degree options first; favour long gaps and scarce edges.
                order = sorted(options[a], key=lambda b: (-(r - last.get(pair(a, b), -20)), -remaining[pair(a, b)], rng.random()))
                for b in order:
                    result = matching(free - {a, b}, chosen + [pair(a, b)])
                    if result is not None:
                        return result
                return None
            selected = matching(set(range(14)) - used, forced)
            if selected is None:
                break
            for p in selected:
                remaining[p] -= 1
                last[p] = r
            rounds.append(selected)
        if len(rounds) == 26 and not any(remaining.values()):
            return rounds, attempt + 1
    raise RuntimeError('No feasible round decomposition found within the search bound; no output written.')


def orient(rounds):
    # Opposite homes for each pair's first two games. Orient remaining edges
    # through Euler cycles: even degree gives every team exactly 13 home games.
    games = {}
    for r, matches in enumerate(rounds):
        for p in matches:
            games.setdefault(p, []).append(r)
    directions, residual = {}, []
    for (a, b), rs in games.items():
        if len(rs) >= 2:
            directions[(rs[0], (a, b))] = (a, b)
            directions[(rs[1], (a, b))] = (b, a)
        if len(rs) % 2:
            residual.append((a, b, rs[-1]))
    adjacency = {a: [] for a in range(14)}
    for index, (a, b, _) in enumerate(residual):
        adjacency[a].append(index)
        adjacency[b].append(index)
    seen = set()
    for start in range(14):
        stack = [start]
        while stack:
            a = stack[-1]
            edges = [edge for edge in adjacency[a] if edge not in seen]
            if not edges:
                stack.pop()
                continue
            index = edges[0]
            seen.add(index)
            x, y, r = residual[index]
            b = y if a == x else x
            directions[(r, pair(a, b))] = (a, b)
            stack.append(b)
    return directions


def improve_monday_orientation(fixtures):
    # A double pair contributes one home per team whichever way it is flipped.
    # Keep odd-pair residual directions unchanged to preserve exact 13/13 totals.
    by_pair = {}
    for fixture in fixtures:
        by_pair.setdefault(tuple(sorted([fixture['home'], fixture['away']])), []).append(fixture)
    variables = [sorted(matches, key=lambda f: f['round']) for _, matches in sorted(by_pair.items()) if len(matches) == 2]
    unchanged = [{k: v for k, v in f.items() if k not in ['home','away']} for f in fixtures]
    baseline = [[f['home'], f['away']] for f in fixtures]
    rng = random.Random(20261011)
    def penalty():
        result = 0
        for team in IDS:
            sides = [f['home'] == team for f in sorted(fixtures, key=lambda f: f['round']) if team in [f['home'], f['away']]]
            result += sum(len(set(sides[i:i+4])) == 1 for i in range(23))
        return result
    def flip(matches):
        for f in matches:
            f['home'], f['away'] = f['away'], f['home']
    for restart in range(40):
        for f, (home, away) in zip(fixtures, baseline):
            f['home'], f['away'] = home, away
        for matches in variables:
            # Canonical starting directions make repeat generation deterministic.
            if matches[0]['home'] > matches[0]['away']:
                flip(matches)
            if rng.random() < .5:
                flip(matches)
        score = penalty()
        for iteration in range(2000):
            if score == 0:
                assert unchanged == [{k: v for k, v in f.items() if k not in ['home','away']} for f in fixtures]
                return
            candidates = []
            for index, matches in enumerate(variables):
                flip(matches)
                value = penalty()
                flip(matches)
                candidates.append((value, index))
            best = min(value for value, _ in candidates)
            # Occasional random walk escapes plateaus; never output a relaxed goal.
            pick = rng.randrange(len(variables)) if rng.random() < .08 else rng.choice([index for value, index in candidates if value == best])
            flip(variables[pick])
            score = penalty()
    raise RuntimeError('Orientation search did not achieve maximum three; original draft not overwritten.')


def slots(matches):
    # Seven matches on two courts: minimum four slots, one 21:00 game.
    available = [(time, court) for time in ['19:00', '19:40', '20:20'] for court in [1, 2]] + [('21:00', 1)]
    def allowed(p, time):
        names = {NAMES[v] for v in p}
        if names & {'Hunger FC', 'Ghazni United'} and time not in ['20:20', '21:00']:
            return False
        return not ('Blue Dragons' in names and time == '19:00')
    ordered = sorted(matches, key=lambda p: sum(allowed(p, time) for time, _ in available))
    def place(index, free, assigned):
        if index == len(ordered):
            return assigned
        p = ordered[index]
        for slot in free:
            if allowed(p, slot[0]):
                found = place(index + 1, [s for s in free if s != slot], assigned + [(p, *slot)])
                if found is not None:
                    return found
        return None
    found = place(0, available, [])
    if found is None:
        raise RuntimeError('Hard kickoff constraints cannot be satisfied; no output written.')
    return sorted(found, key=lambda x: (x[1], x[2]))


WED_NAMES = ['AFG', 'Goldlink Up', 'Misfits', 'Ghazni United', 'Pops', 'Rinnai',
             'Unathletico', 'Wildcats', 'Hazara United', 'King ADL', 'Ibiza',
             'Umoja Stars', 'MTS FC', 'Kuq E Zi', 'Etihad FC', 'Buckle City']
WED_IDS = ['wed-afg', 'wed-goldlink-up', 'wed-misfits', 'wed-ghazni-united', 'wed-pops', 'wed-rinnai',
           'wed-unathletico', 'wed-wildcats', 'wed-hazara-united', 'wed-king-adl', 'wed-ibiza',
           'wed-umoja-stars', 'wed-mts-fc', 'wed-kuq-e-zi', 'wed-etihad-fc', 'wed-buckle-city']


def playing_dates(night, cancel_november_two=False):
    calendar = json.loads(Path('docs/drafts/new-season-calendar.json').read_text())
    blocked = {item['date'] for item in calendar['blockedDates']}
    day, dates = date.fromisoformat(calendar['starts'][night]), []
    while len(dates) < calendar['rounds'][night]:
        value = day.isoformat()
        if value not in blocked and not (calendar['lastPreBreakNight'] < value < calendar['firstPostBreakNight']) and not (cancel_november_two and value == '2026-11-02'):
            dates.append(value)
        day += timedelta(days=7)
    return dates


def schedule_constraints(night):
    names, ids = (NAMES, IDS) if night == 'monday' else (WED_NAMES, WED_IDS)
    allowed = {team: ['19:00', '19:40', '20:20', '21:00'] for team in ids}
    if night == 'monday':
        for team in ['mon-hunger-fc', 'mon-ghazni-united']:
            allowed[team] = ['20:20', '21:00']
        allowed['mon-blue-dragons'] = ['19:40', '20:20', '21:00']
    else:
        allowed['wed-rinnai'] = ['19:40', '20:20', '21:00']
        allowed['wed-umoja-stars'] = ['21:00']
        allowed['wed-kuq-e-zi'] = ['19:00', '19:40', '20:20']
    return dict(dates=playing_dates(night), roster=ids, allowedKickoffs=allowed,
                exceptions=[] if night == 'monday' else [dict(team='wed-kuq-e-zi', opponent='wed-umoja-stars', time='21:00')],
                pairs=[dict(a=ids[a], b=ids[b], count=counts()[pair(a,b)] if night == 'monday' else 2) for a in range(len(ids)) for b in range(a+1,len(ids))],
                sharedPlayers=[] if night == 'monday' else [['wed-goldlink-up', 'wed-buckle-city']],
                weekOnePairs=[['mon-wildcats','mon-nassaji-fc']] if night == 'monday' else [],
                minimumRepeatGap=4, maximumHomeAwayRun=3)


def write_draft(path, output):
    # One fixture per line keeps the review artifact compact.
    prefix = json.dumps({k: v for k, v in output.items() if k != 'fixtures'}, indent=2)[:-2]
    path.write_text(prefix + ',\n  "fixtures": [\n' + ',\n'.join('    ' + json.dumps(f) for f in output['fixtures']) + '\n  ]\n}\n', newline='\n')


def wednesday_rounds():
    rotation, first = list(range(16)), []
    for r in range(15):
        matches = []
        for i in range(8):
            a, b = rotation[i], rotation[-1-i]
            flip = r % 2 if i == 0 else i % 2
            matches.append((b, a) if flip else (a, b))
        first.append(matches)
        rotation = [rotation[0], rotation[-1], *rotation[1:-1]]
    return first + [[(b, a) for a, b in matches] for matches in first]


def wednesday_slots(matches, history):
    available = [(time, court) for time in ['19:00', '19:40', '20:20', '21:00'] for court in [1, 2]]
    def allowed(p, time):
        teams = {WED_NAMES[v] for v in p}
        return not (('Umoja Stars' in teams and time != '21:00') or
                    ('Rinnai' in teams and time == '19:00') or
                    ('Kuq E Zi' in teams and time == '21:00' and 'Umoja Stars' not in teams))
    ordered = sorted(matches, key=lambda p: sum(allowed(p, time) for time, _ in available))
    best_score, best = None, None
    def place(index, free, assigned, soft, fairness):
        nonlocal best_score, best
        if best_score is not None and (soft, fairness) >= best_score:
            return
        if index == len(ordered):
            best_score, best = (soft, fairness), assigned
            return
        p = ordered[index]
        teams = {WED_NAMES[v] for v in p}
        options = []
        for time, court in free:
            if not allowed(p, time):
                continue
            if any(other_time == time and (('Goldlink Up' in teams and 'Buckle City' in {WED_NAMES[v] for v in other}) or ('Buckle City' in teams and 'Goldlink Up' in {WED_NAMES[v] for v in other})) for other, other_time, _ in assigned):
                continue
            cost = int('Ghazni United' in teams and time == '21:00') + (2 if time == '19:00' else 1 if time == '19:40' else 0) * int('Ibiza' in teams)
            fair = sum(2 * history.get((team, time), 0) + 1 for team in p)
            options.append((cost, fair, time, court))
        for cost, fair, time, court in sorted(options):
            result = assigned + [(p, time, court)]
            place(index + 1, [s for s in free if s != (time, court)], result, soft + cost, fairness + fair)
    place(0, available, [], 0, 0)
    if best is None:
        raise RuntimeError('Wednesday hard time/clash constraints cannot be satisfied; no output written.')
    for p, time, _ in best:
        for team in p:
            history[(team, time)] = history.get((team, time), 0) + 1
    return sorted(best, key=lambda x: (x[1], x[2]))


if __name__ == '__main__':
    path = Path('docs/drafts/monday-rounds.json')
    if path.exists():
        monday = json.loads(path.read_text())
    else:
        rounds, attempts = make_rounds()
        direction, fixtures = orient(rounds), []
        for index, matches in enumerate(rounds):
            for p, time, court in slots(matches):
                home, away = direction[(index, p)]
                fixtures.append(dict(round=index + 1, date=None, time=time, court=court, home=IDS[home], away=IDS[away]))
        monday = dict(format='fis-local-schedule-draft-v1', night='monday', publication='local-review-only', generationSeed=20261010, searchAttempts=attempts, fixtures=fixtures)
    improve_monday_orientation(monday['fixtures'])
    dates = playing_dates('monday')
    for fixture in monday['fixtures']:
        fixture['date'] = dates[fixture['round'] - 1]
        fixture['provisional'] = fixture['date'] == '2026-11-02'
    monday.update(calendarStatus='dated-standing-venue-booking-confirmed-returning-availability-pending', startDate=dates[0], endDate=dates[-1], finalDateIfNovemberTwoCancelled=playing_dates('monday', True)[-1])
    monday['constraints'] = schedule_constraints('monday')
    wed_dates, wed_fixtures, history = playing_dates('wednesday'), [], {}
    for index, matches in enumerate(wednesday_rounds()):
        for (home, away), time, court in wednesday_slots(matches, history):
            wed_fixtures.append(dict(round=index + 1, date=wed_dates[index], time=time, court=court, home=WED_IDS[home], away=WED_IDS[away], provisional=False))
    wednesday = dict(format='fis-local-schedule-draft-v1', night='wednesday', publication='local-review-only', calendarStatus='dated-standing-venue-booking-confirmed-returning-availability-pending', startDate=wed_dates[0], endDate=wed_dates[-1], constraints=schedule_constraints('wednesday'), fixtures=wed_fixtures)
    write_draft(path, monday)
    write_draft(Path('docs/drafts/wednesday-rounds.json'), wednesday)
    print(f"Monday: 26 rounds / 182 matches, {dates[0]} to {dates[-1]}; without 2 November: {playing_dates('monday', True)[-1]}.")
    print(f"Wednesday: 30 rounds / 240 matches, {wed_dates[0]} to {wed_dates[-1]}. Local drafts only; no finals dates added.")
