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

type QuestionBody =
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

/**
 * The load-bearing word of a question, set large on the teaching screen.
 *
 * Curated only. It is the word the verse turns on — “GOOD”, “IMAGE”, “BEGINNING”
 * — and picking it is an editorial judgement, never something to derive from
 * the text. Questions without one fall back to leading with the insight.
 */
export type Question = QuestionBody & { teachingKeyword?: string };

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
      answer: ['God', 'created', 'man', 'in', 'his', 'own', 'image.'],
      insight: 'The claim the chapter has been building toward, and the ground of every argument for human dignity that follows it.',
      verse: 'Genesis 1:27',
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
      answer: ['The', 'eyes', 'of', 'both', 'were', 'opened.'],
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
      answer: ['Noah', 'did', 'everything', 'God', 'commanded', 'him.'],
      insight: 'Stated plainly and without elaboration. The obedience is the whole point of the sentence.',
      verse: 'Genesis 6:22',
    },
  ],
};

/** Topics that still use the older short set, pending expansion. */
export const hasExpandedSet = (topicId: string): boolean => topicId in QUESTIONS;

/**
 * CHAPTER QUESTIONS — asked after a chapter in the daily plan.
 *
 * Keyed by chapter id ("genesis-1"), matching the gathered store's format.
 *
 * Editorial line: these ask about the promise and the weight of a chapter, not
 * its incidentals. Genealogies, censuses and building measurements get no
 * questions — which is why most chapters have none, and why the button simply
 * does not appear rather than offering something trivial. Where a chapter IS
 * largely a list, as Matthew 1 is, the questions go to what the list is for.
 *
 * Scripture quoted is the World English Bible, matching the app's default.
 */
export const CHAPTER_QUESTIONS: Record<string, Question[]> = {
  'genesis-1': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'God created man in his own ___. In God\u2019s image he created him; male and female he created them.',
      options: ['image', 'likeness', 'shape', 'spirit'],
      answer: 0,
      teachingKeyword: 'IMAGE.',
      insight: 'Said three times in one verse. Whatever else the chapter establishes, it will not let this one pass quietly.',
      verse: 'Genesis 1:27',
    },
    {
      kind: 'mcq',
      prompt: 'What did God say when he saw everything he had made?',
      options: ['That it was finished', 'That it was very good', 'That it was his', 'That it would endure'],
      answer: 1,
      teachingKeyword: 'GOOD.',
      insight: 'Six times “good”, and once at the end “very good” — the verdict is on the whole, not the parts.',
      verse: 'Genesis 1:31',
    },
    {
      kind: 'tf',
      prompt: 'Humanity is given responsibility for the rest of creation.',
      answer: true,
      insight: 'Dominion, in the sense of stewardship. Made last, and made answerable for what came before.',
      verse: 'Genesis 1:28',
    },
  ],

  'genesis-2': [
    {
      kind: 'mcq',
      prompt: 'What did God do to the seventh day?',
      options: ['Left it empty', 'Blessed it and made it holy', 'Gave it to Adam', 'Named it'],
      answer: 1,
      insight: 'Rest is not what is left over once the work is done. It is blessed and set apart — part of the design, not the gap after it.',
      verse: 'Genesis 2:3',
    },
    {
      kind: 'tf',
      prompt: 'The first thing God called “not good” was that the man was alone.',
      answer: true,
      insight: 'In a passage where everything is repeatedly called good, the first failure named is solitude.',
      verse: 'Genesis 2:18',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'A man will leave his father and his mother, and will join with his wife, and they will be one ___.',
      answer: 'flesh',
      accept: ['flesh'],
      insight: 'Quoted by Jesus and by Paul when either needed to say what marriage is. It starts here, in the second chapter.',
      verse: 'Genesis 2:24',
    },
  ],

  'matthew-1': [
    {
      kind: 'cloze',
      prompt: 'Complete the angel\u2019s instruction to Joseph.',
      text: 'You shall call his name Jesus, for it is he who shall ___ his people from their sins.',
      options: ['save', 'lead', 'gather', 'judge'],
      answer: 0,
      insight: 'The name is the job. Jesus — Yeshua — means “the Lord saves”, so the sentence explains itself.',
      verse: 'Matthew 1:21',
    },
    {
      kind: 'mcq',
      prompt: 'What does the name Immanuel mean?',
      options: ['The Lord saves', 'God with us', 'Prince of peace', 'Son of David'],
      answer: 1,
      teachingKeyword: 'WITH US.',
      insight: 'Isaiah’s word, held for seven hundred years and produced here. The whole Gospel closes on the same promise: “I am with you always.”',
      verse: 'Matthew 1:23',
    },
    {
      kind: 'tf',
      prompt: 'The genealogy of Jesus includes women with troubled histories.',
      answer: true,
      insight: 'Tamar, Rahab, Ruth and “Uriah’s wife”. A list designed to prove royal descent had no need to name them, and names them anyway.',
      verse: 'Matthew 1:3-6',
    },
  ],

  'psalms-1': [
    {
      kind: 'mcq',
      prompt: 'The blessed man is compared to a tree planted by what?',
      options: ['A road', 'Streams of water', 'The temple', 'A field'],
      answer: 1,
      teachingKeyword: 'PLANTED.',
      insight: 'Planted, not growing wild — put there deliberately, and near enough to the water to survive a dry season.',
      verse: 'Psalm 1:3',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['his', 'delight', 'is', 'in', 'Yahweh\u2019s', 'law.'],
      insight: 'Delight rather than duty. The psalm rests its whole argument on which of the two you bring to it.',
      verse: 'Psalm 1:2',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says the wicked are like chaff driven away by the wind.',
      answer: true,
      insight: 'Set against the rooted tree. One is planted and one is blown about — the whole psalm is that contrast.',
      verse: 'Psalm 1:4',
    },
  ],

  'proverbs-1': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'The fear of Yahweh is the beginning of ___.',
      options: ['knowledge', 'wisdom', 'understanding', 'peace'],
      answer: 0,
      teachingKeyword: 'BEGINNING.',
      insight: 'The beginning, not the sum. Everything the book goes on to teach assumes you have started here.',
      verse: 'Proverbs 1:7',
    },
    {
      kind: 'mcq',
      prompt: 'Where does Wisdom call out?',
      options: ['In the temple', 'In the streets and public squares', 'In the king\u2019s court', 'In the wilderness'],
      answer: 1,
      insight: 'Not hidden or reserved for the trained. She shouts in the market, where anyone might hear.',
      verse: 'Proverbs 1:20-21',
    },
    {
      kind: 'tf',
      prompt: 'The chapter warns against being drawn along by those who plan harm.',
      answer: true,
      insight: '“My son, if sinners entice you, don’t consent.” The first practical instruction in the book is about the company you keep.',
      verse: 'Proverbs 1:10',
    },
  ],
};

/** Whether a chapter has questions — most do not, and that is deliberate. */
export const hasChapterQuestions = (chapter: string): boolean =>
  chapter in CHAPTER_QUESTIONS;
