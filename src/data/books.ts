/** The 66 books of the Protestant canon, with chapter counts. */

export interface Book {
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  group: string;
}

export const BOOKS: Book[] = [
  // ── Old Testament ──────────────────────────────────────────────────────────
  { name: 'Genesis', chapters: 50, testament: 'OT', group: 'Law' },
  { name: 'Exodus', chapters: 40, testament: 'OT', group: 'Law' },
  { name: 'Leviticus', chapters: 27, testament: 'OT', group: 'Law' },
  { name: 'Numbers', chapters: 36, testament: 'OT', group: 'Law' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT', group: 'Law' },

  { name: 'Joshua', chapters: 24, testament: 'OT', group: 'History' },
  { name: 'Judges', chapters: 21, testament: 'OT', group: 'History' },
  { name: 'Ruth', chapters: 4, testament: 'OT', group: 'History' },
  { name: '1 Samuel', chapters: 31, testament: 'OT', group: 'History' },
  { name: '2 Samuel', chapters: 24, testament: 'OT', group: 'History' },
  { name: '1 Kings', chapters: 22, testament: 'OT', group: 'History' },
  { name: '2 Kings', chapters: 25, testament: 'OT', group: 'History' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT', group: 'History' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT', group: 'History' },
  { name: 'Ezra', chapters: 10, testament: 'OT', group: 'History' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT', group: 'History' },
  { name: 'Esther', chapters: 10, testament: 'OT', group: 'History' },

  { name: 'Job', chapters: 42, testament: 'OT', group: 'Poetry' },
  { name: 'Psalms', chapters: 150, testament: 'OT', group: 'Poetry' },
  { name: 'Proverbs', chapters: 31, testament: 'OT', group: 'Poetry' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT', group: 'Poetry' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT', group: 'Poetry' },

  { name: 'Isaiah', chapters: 66, testament: 'OT', group: 'Major Prophets' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT', group: 'Major Prophets' },
  { name: 'Lamentations', chapters: 5, testament: 'OT', group: 'Major Prophets' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT', group: 'Major Prophets' },
  { name: 'Daniel', chapters: 12, testament: 'OT', group: 'Major Prophets' },

  { name: 'Hosea', chapters: 14, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Joel', chapters: 3, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Amos', chapters: 9, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Obadiah', chapters: 1, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Jonah', chapters: 4, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Micah', chapters: 7, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Nahum', chapters: 3, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Haggai', chapters: 2, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Zechariah', chapters: 14, testament: 'OT', group: 'Minor Prophets' },
  { name: 'Malachi', chapters: 4, testament: 'OT', group: 'Minor Prophets' },

  // ── New Testament ──────────────────────────────────────────────────────────
  { name: 'Matthew', chapters: 28, testament: 'NT', group: 'Gospels' },
  { name: 'Mark', chapters: 16, testament: 'NT', group: 'Gospels' },
  { name: 'Luke', chapters: 24, testament: 'NT', group: 'Gospels' },
  { name: 'John', chapters: 21, testament: 'NT', group: 'Gospels' },

  { name: 'Acts', chapters: 28, testament: 'NT', group: 'History' },

  { name: 'Romans', chapters: 16, testament: 'NT', group: "Paul's Letters" },
  { name: '1 Corinthians', chapters: 16, testament: 'NT', group: "Paul's Letters" },
  { name: '2 Corinthians', chapters: 13, testament: 'NT', group: "Paul's Letters" },
  { name: 'Galatians', chapters: 6, testament: 'NT', group: "Paul's Letters" },
  { name: 'Ephesians', chapters: 6, testament: 'NT', group: "Paul's Letters" },
  { name: 'Philippians', chapters: 4, testament: 'NT', group: "Paul's Letters" },
  { name: 'Colossians', chapters: 4, testament: 'NT', group: "Paul's Letters" },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT', group: "Paul's Letters" },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT', group: "Paul's Letters" },
  { name: '1 Timothy', chapters: 6, testament: 'NT', group: "Paul's Letters" },
  { name: '2 Timothy', chapters: 4, testament: 'NT', group: "Paul's Letters" },
  { name: 'Titus', chapters: 3, testament: 'NT', group: "Paul's Letters" },
  { name: 'Philemon', chapters: 1, testament: 'NT', group: "Paul's Letters" },

  { name: 'Hebrews', chapters: 13, testament: 'NT', group: 'General Letters' },
  { name: 'James', chapters: 5, testament: 'NT', group: 'General Letters' },
  { name: '1 Peter', chapters: 5, testament: 'NT', group: 'General Letters' },
  { name: '2 Peter', chapters: 3, testament: 'NT', group: 'General Letters' },
  { name: '1 John', chapters: 5, testament: 'NT', group: 'General Letters' },
  { name: '2 John', chapters: 1, testament: 'NT', group: 'General Letters' },
  { name: '3 John', chapters: 1, testament: 'NT', group: 'General Letters' },
  { name: 'Jude', chapters: 1, testament: 'NT', group: 'General Letters' },

  { name: 'Revelation', chapters: 22, testament: 'NT', group: 'Prophecy' },
];

export function getBook(name: string): Book | undefined {
  const target = name.trim().toLowerCase();
  return BOOKS.find((b) => b.name.toLowerCase() === target);
}
