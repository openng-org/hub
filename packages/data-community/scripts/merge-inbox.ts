/**
 * Moves the contributions waiting in data/inbox/ into the datasets: each file (written by the
 * "Add to the hub" form on the site) is validated, appended to events.json, organizers.json or
 * podcasts.json — with its coordinates added to places.json for a new city — and deleted.
 *
 *   pnpm --filter @openng/data-community merge-inbox
 *
 * Run it on the contribution's branch before merging the pull request. Exits 1 (and changes
 * nothing) when any file breaks a rule.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { type Submission, validateSubmission } from '../src/validate.ts';

const DATA = join(import.meta.dirname, '../data');
const INBOX = join(DATA, 'inbox');

const read = <T>(file: string): T => JSON.parse(readFileSync(join(DATA, file), 'utf8')) as T;
const write = (file: string, value: unknown) =>
  writeFileSync(join(DATA, file), `${JSON.stringify(value, null, 2)}\n`);

const events = read<object[]>('events.json');
const organizers = read<{ id: string }[]>('organizers.json');
const podcasts = read<{ name: string }[]>('podcasts.json');
const places = read<Record<string, [number, number]>>('places.json');

const files = readdirSync(INBOX).filter((file) => file.endsWith('.json'));
if (files.length === 0) {
  console.log('Inbox empty: nothing to merge.');
  process.exit(0);
}

const failures: string[] = [];
const merged: string[] = [];
for (const file of files) {
  const submission = JSON.parse(readFileSync(join(INBOX, file), 'utf8')) as Submission;
  const issues = validateSubmission(submission, {
    organizerIds: new Set(organizers.map((o) => o.id)),
    places: new Set(Object.keys(places)),
    podcastNames: new Set(podcasts.map((p) => p.name)),
  });
  if (issues.length > 0) {
    failures.push(
      `${file}\n${issues.map((i) => `  - ${i.field || 'entry'}: ${i.message}`).join('\n')}`,
    );
    continue;
  }
  if (submission.kind === 'event') {
    events.push(submission.event);
    const location = submission.event.location;
    if (submission.place && location && !places[location]) places[location] = submission.place;
  } else if (submission.kind === 'community') {
    organizers.push(submission.community);
  } else {
    podcasts.push(submission.podcast);
  }
  merged.push(file);
}

if (failures.length > 0) {
  console.error(`✗ Nothing merged, fix these first:\n\n${failures.join('\n\n')}`);
  process.exit(1);
}

write('events.json', events);
write('organizers.json', organizers);
write('podcasts.json', podcasts);
// One place per line, as Prettier formats it.
writeFileSync(
  join(DATA, 'places.json'),
  `{\n${Object.entries(places)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, [lat, lng]]) => `  ${JSON.stringify(name)}: [${lat}, ${lng}]`)
    .join(',\n')}\n}\n`,
);
for (const file of merged) rmSync(join(INBOX, file));
console.log(`✓ Merged ${merged.length} contribution(s): ${merged.join(', ')}`);
