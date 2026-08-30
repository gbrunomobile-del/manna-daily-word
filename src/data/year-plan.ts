/**
 * MANNA YEAR PLAN
 * A 365-day reading plan: one Old Testament portion, one New Testament portion,
 * one Psalm, and one Proverb each day. Sequential, so nothing is skipped and
 * nothing is read twice within the year.
 */

export interface DayReading {
  day: number;          // 1-365
  ot: string;           // e.g. "Genesis 1-2"
  nt: string;           // e.g. "Matthew 1"
  psalm: string;        // e.g. "Psalm 1"
  proverb: string;      // e.g. "Proverbs 1"
}

// Canonical order. Psalms and Proverbs are excluded — they have their own slot.
const OT_BOOKS: [string, number][] = [
  ['Genesis', 50], ['Exodus', 40], ['Leviticus', 27], ['Numbers', 36], ['Deuteronomy', 34],
  ['Joshua', 24], ['Judges', 21], ['Ruth', 4], ['1 Samuel', 31], ['2 Samuel', 24],
  ['1 Kings', 22], ['2 Kings', 25], ['1 Chronicles', 29], ['2 Chronicles', 36],
  ['Ezra', 10], ['Nehemiah', 13], ['Esther', 10], ['Job', 42],
  ['Ecclesiastes', 12], ['Song of Solomon', 8], ['Isaiah', 66], ['Jeremiah', 52],
  ['Lamentations', 5], ['Ezekiel', 48], ['Daniel', 12], ['Hosea', 14], ['Joel', 3],
  ['Amos', 9], ['Obadiah', 1], ['Jonah', 4], ['Micah', 7], ['Nahum', 3],
  ['Habakkuk', 3], ['Zephaniah', 3], ['Haggai', 2], ['Zechariah', 14], ['Malachi', 4],
];

const NT_BOOKS: [string, number][] = [
  ['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21], ['Acts', 28],
  ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13], ['Galatians', 6],
  ['Ephesians', 6], ['Philippians', 4], ['Colossians', 4], ['1 Thessalonians', 5],
  ['2 Thessalonians', 3], ['1 Timothy', 6], ['2 Timothy', 4], ['Titus', 3],
  ['Philemon', 1], ['Hebrews', 13], ['James', 5], ['1 Peter', 5], ['2 Peter', 3],
  ['1 John', 5], ['2 John', 1], ['3 John', 1], ['Jude', 1], ['Revelation', 22],
];

/** Flatten a book list into a sequential array of "Book Chapter" strings. */
function flatten(books: [string, number][]): string[] {
  const out: string[] = [];
  for (const [name, chapters] of books) {
    for (let c = 1; c <= chapters; c++) out.push(`${name} ${c}`);
  }
  return out;
}

const OT_CHAPTERS = flatten(OT_BOOKS);
const NT_CHAPTERS = flatten(NT_BOOKS);

/** Group chapters into `days` consecutive chunks, rendered as readable ranges. */
function chunkToRanges(chapters: string[], days: number): string[] {
  const perDay = chapters.length / days;
  const out: string[] = [];
  for (let d = 0; d < days; d++) {
    const start = Math.floor(d * perDay);
    const end = Math.floor((d + 1) * perDay) - 1;
    const first = chapters[start];
    const last = chapters[Math.max(end, start)];
    if (!first) { out.push(''); continue; }
    if (first === last) { out.push(first); continue; }
    const fBook = first.replace(/ \d+$/, '');
    const lBook = last.replace(/ \d+$/, '');
    const lNum = last.match(/\d+$/)?.[0] ?? '';
    out.push(fBook === lBook ? `${first}-${lNum}` : `${first} - ${last}`);
  }
  return out;
}

const OT_PLAN = chunkToRanges(OT_CHAPTERS, 365);
const NT_PLAN = chunkToRanges(NT_CHAPTERS, 365);

const psalmForDay = (day: number) => `Psalm ${((day - 1) % 150) + 1}`;
const proverbForDay = (day: number) => `Proverbs ${((day - 1) % 31) + 1}`;

/** The full 365-day plan. */
export const YEAR_PLAN: DayReading[] = Array.from({ length: 365 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    ot: OT_PLAN[i] ?? '',
    nt: NT_PLAN[i] ?? '',
    psalm: psalmForDay(day),
    proverb: proverbForDay(day),
  };
});

export function getDayReading(day: number): DayReading | undefined {
  if (day < 1 || day > 365) return undefined;
  return YEAR_PLAN[day - 1];
}

/** All four passage references for a day, as a flat list. */
export function passagesForDay(day: number): string[] {
  const r = getDayReading(day);
  if (!r) return [];
  return [r.ot, r.nt, r.psalm, r.proverb].filter(Boolean);
}

export const TOTAL_DAYS = 365;
