/**
 * THE WAY — question bank.
 *
 * Formats are modelled on Duolingo's exercise inventory, minus the audio ones
 * (hear/dictate/speak), which need recorded scripture and speech scoring.
 *
 * The design principle worth keeping: the same content should be met in more
 * than one format, and recognition should give way to recall over time. A verse
 * first seen in a MATCH, later as a CLOZE, later still as a WORDBANK, is
 * learned far better than the same verse asked three times the same way.
 *
 * Scripture is the World English Bible (public domain).
 */

export type Question =
  /** Straight multiple choice. Recognition. */
  | {
      kind: 'mcq';
      prompt: string;
      options: string[];
      answer: number;
      insight: string;
      verse?: string;
    }
  /** True or false. Fastest format; good for pacing between harder ones. */
  | {
      kind: 'tf';
      prompt: string;
      answer: boolean;
      insight: string;
      verse?: string;
    }
  /** Attribution — who said this. Recognition, but of speaker rather than fact. */
  | {
      kind: 'whosaid';
      quote: string;
      options: string[];
      answer: number;
      insight: string;
      verse?: string;
    }
  /** Cloze with options. The gap is marked ___ in `text`. Cued recall. */
  | {
      kind: 'cloze';
      prompt: string;
      text: string;
      options: string[];
      answer: number;
      insight: string;
      verse?: string;
    }
  /** Cloze with free typing. Hardest cued recall; accepts spelling variants. */
  | {
      kind: 'type';
      prompt: string;
      text: string;
      answer: string;
      /** Additional acceptable answers, lowercased. */
      accept?: string[];
      insight: string;
      verse?: string;
    }
  /**
   * Link each verse to its reference. Three of each, shuffled.
   * Built for reference recall specifically — the skill of knowing not just
   * what Scripture says but where to find it.
   */
  | {
      kind: 'match';
      prompt: string;
      pairs: { text: string; reference: string }[];
      insight: string;
    }
  /** Rebuild the verse from scrambled word tiles. Production, scaffolded. */
  | {
      kind: 'wordbank';
      prompt: string;
      /** The correct sentence, split on spaces. Distractors may be added. */
      answer: string[];
      /** Extra wrong words mixed into the bank. */
      distractors?: string[];
      insight: string;
      verse?: string;
    };

export type QuestionKind = Question['kind'];

/** Human labels, used in the lesson header. */
export const KIND_LABEL: Record<QuestionKind, string> = {
  mcq: 'Choose the answer',
  tf: 'True or false',
  whosaid: 'Who said it',
  cloze: 'Fill the gap',
  type: 'Type the word',
  match: 'Match the verse',
  wordbank: 'Build the verse',
};

export const QUESTIONS: Record<string, Question[]> = {
  // ── CREATION ───────────────────────────────────────────────────────────────
  creation: [
    {
      kind: 'mcq',
      prompt: 'How many days did God take to create the world?',
      options: ['Five', 'Six', 'Seven', 'Eight'],
      answer: 1,
      insight: 'Six days of making, and rest on the seventh. The rest is part of the pattern, not an afterthought.',
      verse: 'Genesis 1:31',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the first sentence of Scripture.',
      text: 'In the beginning, God ___ the heavens and the earth.',
      options: ['created', 'formed', 'spoke', 'made'],
      answer: 0,
      insight: 'Bara — a verb the Hebrew reserves for God alone. People shape and form; only God creates.',
      verse: 'Genesis 1:1',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'In the beginning, God created the heavens and the earth.', reference: 'Genesis 1:1' },
        { text: 'God said, "Let there be light," and there was light.', reference: 'Genesis 1:3' },
        { text: 'God created man in his own image.', reference: 'Genesis 1:27' },
      ],
      insight: 'The first chapter moves outward: the cosmos, then light, then humanity — each named in its own verse.',
    },
    {
      kind: 'tf',
      prompt: 'God created light on the first day.',
      answer: true,
      insight: 'Light on day one; the sun and moon not until day four. Light exists before its carriers do.',
      verse: 'Genesis 1:3',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['God', 'saw', 'everything', 'that', 'he', 'had', 'made,', 'and,', 'behold,', 'it', 'was', 'very', 'good.'],
      distractors: ['world', 'perfect'],
      insight: 'Repeated six times as "good", and once at the end as "very good" — the verdict is on the whole, not the parts.',
      verse: 'Genesis 1:31',
    },
    {
      kind: 'mcq',
      prompt: 'What was the first thing God called "not good"?',
      options: ['Darkness', 'That the man was alone', 'The serpent', 'Death'],
      answer: 1,
      insight: 'In a chapter of things called good, the first "not good" is solitude.',
      verse: 'Genesis 2:18',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'The Lord God formed man from the ___ of the ground.',
      answer: 'dust',
      accept: ['dust'],
      insight: 'Adam from adamah — the name and the ground it came from share a root.',
      verse: 'Genesis 2:7',
    },
    {
      kind: 'whosaid',
      quote: 'Let there be light.',
      options: ['Moses', 'God', 'Adam', 'The serpent'],
      answer: 1,
      insight: 'The whole chapter turns on speech: God says, and it is so.',
      verse: 'Genesis 1:3',
    },
  ],

  // ── THE FALL ───────────────────────────────────────────────────────────────
  'the-fall': [
    {
      kind: 'mcq',
      prompt: 'What did Adam and Eve eat?',
      options: ['An apple', 'A fig', 'Fruit of the tree of knowledge', 'A pomegranate'],
      answer: 2,
      insight: 'Scripture never says apple. That comes from a Latin pun — malum means both evil and apple.',
      verse: 'Genesis 3:6',
    },
    {
      kind: 'whosaid',
      quote: 'You will not certainly die.',
      options: ['Eve', 'Adam', 'The serpent', 'Cain'],
      answer: 2,
      insight: 'The first recorded lie, and it works by contradicting God directly rather than subtly.',
      verse: 'Genesis 3:4',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'Now the serpent was more subtle than any animal of the field.', reference: 'Genesis 3:1' },
        { text: 'The woman whom you gave to be with me, she gave me fruit.', reference: 'Genesis 3:12' },
        { text: 'You are dust, and to dust you shall return.', reference: 'Genesis 3:19' },
      ],
      insight: 'The chapter runs from temptation, through blame, to consequence — three verses mark the whole arc.',
    },
    {
      kind: 'tf',
      prompt: 'Adam blamed both Eve and God when confronted.',
      answer: true,
      insight: '"The woman whom you gave to be with me" — the blame reaches past Eve to the one who made her.',
      verse: 'Genesis 3:12',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'You are dust, and to ___ you shall return.',
      options: ['dust', 'earth', 'ashes', 'the ground'],
      answer: 0,
      insight: 'The same dust he was formed from in chapter two. The sentence is a return, not a new invention.',
      verse: 'Genesis 3:19',
    },
    {
      kind: 'mcq',
      prompt: 'Who made the first clothing for Adam and Eve?',
      options: ['Adam', 'Eve', 'The serpent', 'God'],
      answer: 3,
      insight: 'They sewed fig leaves; God made garments of skin. The first covering that held required a death.',
      verse: 'Genesis 3:21',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'God placed cherubim and a flaming ___ to guard the way to the tree of life.',
      answer: 'sword',
      accept: ['sword'],
      insight: 'The way back is not destroyed, only guarded — which leaves room for it to be opened again.',
      verse: 'Genesis 3:24',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['The', 'eyes', 'of', 'both', 'of', 'them', 'were', 'opened.'],
      distractors: ['closed', 'hearts'],
      insight: 'The serpent promised open eyes and delivered them. What they saw first was their own nakedness.',
      verse: 'Genesis 3:7',
    },
  ],

  // ── NOAH ───────────────────────────────────────────────────────────────────
  noah: [
    {
      kind: 'mcq',
      prompt: 'How many days and nights did the rain fall?',
      options: ['Twenty', 'Forty', 'Sixty', 'Eighty'],
      answer: 1,
      insight: 'Forty recurs across Scripture — the wilderness, Elijah, the temptation. It marks a time of testing.',
      verse: 'Genesis 7:12',
    },
    {
      kind: 'tf',
      prompt: 'Noah took exactly two of every animal.',
      answer: false,
      insight: 'Seven pairs of every clean animal, one pair of the unclean. The extra clean ones were for sacrifice after.',
      verse: 'Genesis 7:2',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'Noah found favour in the eyes of the Lord.', reference: 'Genesis 6:8' },
        { text: 'I set my rainbow in the cloud as a sign of the covenant.', reference: 'Genesis 9:13' },
        { text: 'The waters returned from off the earth continually.', reference: 'Genesis 8:3' },
      ],
      insight: 'Favour, then flood, then covenant — the three verses hold the beginning, middle and end of the account.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'I set my ___ in the cloud, and it will be a sign of a covenant.',
      options: ['rainbow', 'light', 'mark', 'seal'],
      answer: 0,
      insight: 'The Hebrew word is a war bow — hung up in the sky, pointed away. A weapon laid down.',
      verse: 'Genesis 9:13',
    },
    {
      kind: 'mcq',
      prompt: 'What did Noah do after leaving the ark?',
      options: ['Built a city', 'Planted a vineyard', 'Went to sea', 'Wrote a record'],
      answer: 1,
      insight: '"Noah, a man of the soil, planted a vineyard." The account does not tidy up what happened next.',
      verse: 'Genesis 9:20',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Noah found ___ in the eyes of the Lord.',
      answer: 'favour',
      accept: ['favour', 'favor', 'grace'],
      insight: 'The first appearance of grace in Scripture — given before Noah is described as righteous, not after.',
      verse: 'Genesis 6:8',
    },
    {
      kind: 'whosaid',
      quote: 'I will never again curse the ground for man\u2019s sake.',
      options: ['Noah', 'God', 'Shem', 'Abraham'],
      answer: 1,
      insight: 'Spoken after the sacrifice, and grounded not in humanity improving but in God choosing.',
      verse: 'Genesis 8:21',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['Noah', 'did', 'everything', 'that', 'God', 'commanded', 'him.'],
      distractors: ['some', 'asked'],
      insight: 'Stated plainly and without elaboration. The obedience is the whole point of the sentence.',
      verse: 'Genesis 6:22',
    },
  ],
};

/** Topics that still use the older short set, pending expansion. */
export const hasExpandedSet = (topicId: string): boolean => topicId in QUESTIONS;
