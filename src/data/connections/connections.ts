import type { Connection } from '@/types';

export const CONNECTIONS: readonly Connection[] = [
  {
    id: 'exodus16-john6',
    source: { book: 'Exodus', chapter: 16, verseStart: 4, verseEnd: 15 },
    target: { book: 'John', chapter: 6, verseStart: 31, verseEnd: 35 },
    type: 'TYPOLOGY',
    summary: 'The crowd raises the wilderness manna. Jesus answers from inside that story.',
    explanation: [
      'The crowd brings up the manna themselves. They quote it at Jesus as a challenge — Moses fed our ancestors bread from heaven every day; what will you do?',
      'Jesus does not change the subject. He corrects two things inside their own story. It was not Moses who gave the bread, and the manna was never the point. It pointed beyond itself.',
      'Then He says something the wilderness could not have said. The manna was bread God gave. He is the bread God gives.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },
  {
    id: 'psalm22-matthew27',
    source: { book: 'Psalm', chapter: 22, verseStart: 1 },
    target: { book: 'Matthew', chapter: 27, verseStart: 46 },
    type: 'QUOTATION',
    summary: 'Words written centuries earlier, spoken from the cross.',
    explanation: [
      'The opening line of Psalm 22 is the line Jesus speaks at the ninth hour.',
      'Readers have long noticed that the psalm does not end where that first line does.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },
];

export const getConnection = (id: string): Connection | undefined =>
  CONNECTIONS.find((c) => c.id === id);

export const connectionsFor = (book: string, chapter: number): readonly Connection[] =>
  CONNECTIONS.filter(
    (c) =>
      (c.source.book === book && c.source.chapter === chapter) ||
      (c.target.book === book && c.target.chapter === chapter),
  );
