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

  // ── SECOND UNITS ───────────────────────────────────────────
  // A topic is not one lesson. These go further into the same passages rather
  // than moving on — the second reading of a chapter is usually where the
  // interesting things are.

  'creation-2': [
    {
      kind: 'mcq',
      prompt: 'What is the pattern of each day of creation?',
      options: ['Command, then rest', 'God speaks, it is so, and he calls it good', 'A question, then an answer', 'Light, then dark'],
      answer: 1,
      teachingKeyword: 'AND IT WAS SO.',
      insight: 'The repetition is the argument. Nothing struggles into being; it is spoken and it is there.',
      verse: 'Genesis 1:9',
    },
    {
      kind: 'tf',
      prompt: 'The sun and moon are named in the creation account.',
      answer: false,
      insight: 'They are called the greater and lesser lights. Neighbouring cultures worshipped them by name; Genesis declines to use it.',
      verse: 'Genesis 1:16',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Yahweh God formed man from the dust of the ground, and breathed into his nostrils the breath of ___.',
      options: ['life', 'wisdom', 'spirit', 'days'],
      answer: 0,
      insight: 'Dust and breath. The account insists on both, and the rest of Scripture keeps returning to the pairing.',
      verse: 'Genesis 2:7',
    },
    {
      kind: 'mcq',
      prompt: 'What was Adam given to do in the garden?',
      options: ['Rest', 'Tend and keep it', 'Build', 'Wait'],
      answer: 1,
      insight: 'Work exists before anything goes wrong. It is not part of the curse.',
      verse: 'Genesis 2:15',
    },
    {
      kind: 'tf',
      prompt: 'Adam named the animals.',
      answer: true,
      insight: 'And whatever he called them, that was the name. Authority handed over without supervision.',
      verse: 'Genesis 2:19',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'God saw everything that he had made, and behold, it was very good.', reference: 'Genesis 1:31' },
        { text: 'It is not good that the man should be alone.', reference: 'Genesis 2:18' },
        { text: 'God blessed the seventh day, and made it holy.', reference: 'Genesis 2:3' },
      ],
      insight: 'A verdict, a lack, and a day set apart — the three notes the opening chapters end on.',
    },
  ],

  'the-fall-2': [
    {
      kind: 'mcq',
      prompt: 'How does the serpent\u2019s first line begin?',
      options: ['With a command', 'With a question', 'With a promise', 'With a threat'],
      answer: 1,
      teachingKeyword: 'DID GOD SAY?',
      insight: 'Did God really say? Not a denial — an invitation to reconsider. The denial comes only after that lands.',
      verse: 'Genesis 3:1',
    },
    {
      kind: 'tf',
      prompt: 'Eve repeats God\u2019s command exactly.',
      answer: false,
      insight: 'She adds “neither shall you touch it”. A small addition, and the chapter lets it pass without comment.',
      verse: 'Genesis 3:3',
    },
    {
      kind: 'mcq',
      prompt: 'What did they do first after eating?',
      options: ['Ran', 'Made coverings and hid', 'Prayed', 'Argued'],
      answer: 1,
      insight: 'Fig leaves, then hiding. Both are attempts at the same thing, and neither works.',
      verse: 'Genesis 3:7',
    },
    {
      kind: 'whosaid',
      quote: 'The woman whom you gave to be with me, she gave me of the tree.',
      options: ['Adam', 'Eve', 'The serpent', 'Cain'],
      answer: 0,
      insight: 'Blame passed twice in one sentence — to her, and to the one who gave her.',
      verse: 'Genesis 3:12',
    },
    {
      kind: 'tf',
      prompt: 'They were sent from the garden to keep them from the tree of life.',
      answer: true,
      insight: 'Read one way, exile. Read another, mercy — preventing them living forever in that condition.',
      verse: 'Genesis 3:22',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Yahweh God called to the man, and said to him, “Where ___ you?”',
      answer: 'are',
      accept: ['are'],
      insight: 'The first question in Scripture, asked by the one who already knew.',
      verse: 'Genesis 3:9',
    },
  ],

  'noah-2': [
    {
      kind: 'mcq',
      prompt: 'How long did the waters prevail on the earth?',
      options: ['Forty days', 'A hundred and fifty days', 'A year', 'Seven days'],
      answer: 1,
      insight: 'Forty days of rain, then a hundred and fifty of water. The account is longer and slower than it is remembered.',
      verse: 'Genesis 7:24',
    },
    {
      kind: 'tf',
      prompt: 'Noah sent out a raven before the dove.',
      answer: true,
      insight: 'It went back and forth and did not return. The dove is sent because the raven told him nothing.',
      verse: 'Genesis 8:7',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the first thing Noah did on leaving the ark.',
      text: 'Noah built an ___ to Yahweh.',
      options: ['altar', 'house', 'ark', 'city'],
      answer: 0,
      teachingKeyword: 'AN ALTAR FIRST.',
      insight: 'Before shelter, before planting. The first structure built in the new world is for worship.',
      verse: 'Genesis 8:20',
    },
    {
      kind: 'mcq',
      prompt: 'Who is the covenant after the flood made with?',
      options: ['Noah alone', 'Noah and his sons', 'Every living creature', 'The land'],
      answer: 2,
      insight: 'Every living creature of all flesh. The promise is wider than the family that survived.',
      verse: 'Genesis 9:15',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the promise.',
      answer: ['Seedtime', 'and', 'harvest', 'will', 'not', 'cease.'],
      insight: 'The rhythm of ordinary days offered as the sign. Every unremarkable morning is the evidence.',
      verse: 'Genesis 8:22',
    },
    {
      kind: 'tf',
      prompt: 'The chapter records Noah\u2019s failure after the flood.',
      answer: true,
      insight: 'Drunk in his tent, chapters after being called righteous. Scripture rarely tidies up its heroes.',
      verse: 'Genesis 9:21',
    },
  ],

  'abraham-2': [
    {
      kind: 'mcq',
      prompt: 'How did Abraham and Sarah react to the promise of a son in old age?',
      options: ['They wept', 'They laughed', 'They argued', 'They gave thanks'],
      answer: 1,
      teachingKeyword: 'HE LAUGHED.',
      insight: 'Both of them, separately. The son is then named Isaac, which means laughter — the joke kept as the name.',
      verse: 'Genesis 17:17',
    },
    {
      kind: 'tf',
      prompt: 'Abraham bargained with God over Sodom.',
      answer: true,
      insight: 'From fifty righteous down to ten, each time asking permission to ask again.',
      verse: 'Genesis 18:24',
    },
    {
      kind: 'mcq',
      prompt: 'What did Hagar call God in the wilderness?',
      options: ['The Almighty', 'The God who sees', 'The Everlasting', 'The Provider'],
      answer: 1,
      insight: 'A pregnant Egyptian slave, alone at a spring, gives God a name. She is the first person in Scripture to do so.',
      verse: 'Genesis 16:13',
    },
    {
      kind: 'tf',
      prompt: 'Abraham passed Sarah off as his sister to protect himself.',
      answer: true,
      insight: 'Twice, to two different kings. The father of faith is not presented as a brave man.',
      verse: 'Genesis 20:2',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the question asked at Sarah\u2019s tent.',
      text: 'Is anything too ___ for Yahweh?',
      options: ['hard', 'great', 'small', 'late'],
      answer: 0,
      insight: 'Asked after she laughed and then denied laughing. The question is left hanging rather than answered.',
      verse: 'Genesis 18:14',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'He believed in Yahweh, and he reckoned it to him for righteousness.', reference: 'Genesis 15:6' },
        { text: 'In you all the families of the earth will be blessed.', reference: 'Genesis 12:3' },
        { text: 'God will provide himself the lamb for a burnt offering.', reference: 'Genesis 22:8' },
      ],
      insight: 'Faith, reach and provision — the three things the New Testament keeps returning to Abraham for.',
    },
  ],

  'joseph-2': [
    {
      kind: 'mcq',
      prompt: 'Why did Joseph refuse Potiphar\u2019s wife?',
      options: ['Fear of Potiphar', 'He would not sin against God', 'He was betrothed', 'He was afraid of prison'],
      answer: 1,
      insight: 'He names God rather than consequences. The consequence arrives anyway.',
      verse: 'Genesis 39:9',
    },
    {
      kind: 'tf',
      prompt: 'The cupbearer remembered Joseph as soon as he was released.',
      answer: false,
      teachingKeyword: 'TWO FULL YEARS.',
      insight: 'He forgot him. Genesis notes the delay precisely — two full years, for nothing Joseph did wrong.',
      verse: 'Genesis 40:23',
    },
    {
      kind: 'mcq',
      prompt: 'What did Joseph say when Pharaoh praised his ability?',
      options: ['He accepted it', 'It is not in me; God will give an answer', 'He asked for payment', 'He said nothing'],
      answer: 1,
      insight: 'Standing before absolute power, after thirteen years in prison, he corrects the compliment.',
      verse: 'Genesis 41:16',
    },
    {
      kind: 'tf',
      prompt: 'Joseph tested his brothers before revealing himself.',
      answer: true,
      insight: 'At length, and harshly. He is watching whether they will abandon another brother.',
      verse: 'Genesis 44:2',
    },
    {
      kind: 'whosaid',
      quote: 'Let your servant stay instead of the boy, a bondservant to my lord.',
      options: ['Reuben', 'Judah', 'Benjamin', 'Simeon'],
      answer: 1,
      insight: 'The brother who suggested selling Joseph offers to take Benjamin’s place. That is when Joseph breaks.',
      verse: 'Genesis 44:33',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what Joseph named his firstborn for.',
      text: 'God has made me ___ all my toil, and all my father\u2019s house.',
      options: ['forget', 'remember', 'endure', 'forgive'],
      answer: 0,
      insight: 'Manasseh, meaning forgetting. The second son is named Ephraim, fruitful — in the land of his affliction.',
      verse: 'Genesis 41:51',
    },
  ],

  'moses-2': [
    {
      kind: 'mcq',
      prompt: 'What did Moses do before the burning bush?',
      options: ['Ran', 'Turned aside to look', 'Called out', 'Knelt'],
      answer: 1,
      teachingKeyword: 'HE TURNED ASIDE.',
      insight: 'The text says God called only when he saw that Moses turned to look. The whole exodus waits on curiosity.',
      verse: 'Exodus 3:4',
    },
    {
      kind: 'tf',
      prompt: 'Moses had killed a man before fleeing Egypt.',
      answer: true,
      insight: 'Forty years earlier, buried in the sand. He is called at eighty, from the far side of a failure.',
      verse: 'Exodus 2:12',
    },
    {
      kind: 'mcq',
      prompt: 'What advice did Jethro give Moses?',
      options: ['To rest', 'To appoint others to judge', 'To return to Midian', 'To pray more'],
      answer: 1,
      insight: 'You will surely wear out. The exodus’s administrative structure comes from a foreign priest’s common sense.',
      verse: 'Exodus 18:18',
    },
    {
      kind: 'tf',
      prompt: 'Moses asked to see God\u2019s glory.',
      answer: true,
      insight: 'And was shown his goodness, and his back, from inside a cleft in the rock.',
      verse: 'Exodus 33:18',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what God told Moses about his presence.',
      text: 'My ___ will go with you, and I will give you rest.',
      options: ['presence', 'angel', 'word', 'spirit'],
      answer: 0,
      insight: 'Moses had just said he would not move without it. He was willing to refuse the promised land on that condition.',
      verse: 'Exodus 33:14',
    },
    {
      kind: 'whosaid',
      quote: 'Who am I, that I should go to Pharaoh?',
      options: ['Aaron', 'Moses', 'Joshua', 'Jethro'],
      answer: 1,
      insight: 'The first of five objections. The answer he is given is not about him at all: I will be with you.',
      verse: 'Exodus 3:11',
    },
  ],

  'the-law-2': [
    {
      kind: 'mcq',
      prompt: 'What was the Year of Jubilee?',
      options: ['A festival', 'Every fiftieth year, when land returned and debts cleared', 'A fast', 'A census'],
      answer: 1,
      teachingKeyword: 'RETURN IT.',
      insight: 'A built-in reset on inequality, every fifty years. Whether Israel ever kept it is another matter.',
      verse: 'Leviticus 25:10',
    },
    {
      kind: 'tf',
      prompt: 'The Law provided cities where someone who killed accidentally could flee.',
      answer: true,
      insight: 'Six of them, spread so none was too far. Protection from revenge, before a trial.',
      verse: 'Numbers 35:11',
    },
    {
      kind: 'mcq',
      prompt: 'What were farmers told to leave at the edges of their fields?',
      options: ['Nothing', 'The corners, and anything dropped', 'A tenth', 'The best',],
      answer: 1,
      insight: 'Not charity handed over but harvest deliberately left standing. It is how Ruth eats, generations later.',
      verse: 'Leviticus 19:9',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the command about foreigners.',
      text: 'You shall love him as yourself, for you were ___ in the land of Egypt.',
      options: ['foreigners', 'slaves', 'strangers', 'sojourners'],
      answer: 0,
      insight: 'The reason given is memory. They are to treat outsiders as they wish they had been treated.',
      verse: 'Leviticus 19:34',
    },
    {
      kind: 'tf',
      prompt: 'The tabernacle was built from voluntary offerings.',
      answer: true,
      insight: 'And they eventually had to be told to stop bringing things — the only recorded instance of that problem.',
      verse: 'Exodus 36:6',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'You shall love your ___ as yourself.',
      answer: 'neighbour',
      accept: ['neighbour', 'neighbor'],
      insight: 'Buried in Leviticus among laws about weights and field boundaries. Jesus pulls it out and puts it second only to loving God.',
      verse: 'Leviticus 19:18',
    },
  ],

  'david-2': [
    {
      kind: 'mcq',
      prompt: 'What did David do when his infant son died?',
      options: ['Mourned for days', 'Washed, ate, and worshipped', 'Refused to speak', 'Left Jerusalem'],
      answer: 1,
      teachingKeyword: 'HE WORSHIPPED.',
      insight: 'He fasted while the child lived and stopped when he died. His servants find it baffling; he explains it plainly.',
      verse: '2 Samuel 12:20',
    },
    {
      kind: 'tf',
      prompt: 'David danced before the ark and was criticised for it.',
      answer: true,
      insight: 'By his own wife, for undignified behaviour. He answers that he will be more undignified still.',
      verse: '2 Samuel 6:22',
    },
    {
      kind: 'mcq',
      prompt: 'What did David want to build?',
      options: ['A palace', 'A temple', 'A city wall', 'An army'],
      answer: 1,
      insight: 'He is told no, and that God will build him a house instead. The refusal contains a larger promise.',
      verse: '2 Samuel 7:5',
    },
    {
      kind: 'whosaid',
      quote: 'You are the man.',
      options: ['Samuel', 'Nathan', 'Joab', 'Absalom'],
      answer: 1,
      insight: 'After a story about a poor man’s lamb, which David had just condemned without recognising himself in it.',
      verse: '2 Samuel 12:7',
    },
    {
      kind: 'tf',
      prompt: 'David showed kindness to a surviving member of Saul\u2019s family.',
      answer: true,
      insight: 'Mephibosheth, lame in both feet, given a permanent place at the king’s table. For Jonathan’s sake.',
      verse: '2 Samuel 9:7',
    },
    {
      kind: 'cloze',
      prompt: 'Complete David\u2019s lament for his son.',
      text: 'Absalom, my son, my son! Would I had ___ for you.',
      options: ['died', 'wept', 'spoken', 'waited'],
      answer: 0,
      insight: 'Grief for the son who tried to kill him and take his throne.',
      verse: '2 Samuel 18:33',
    },
  ],

  'isaiah-2': [
    {
      kind: 'mcq',
      prompt: 'What will the nations do with their swords?',
      options: ['Sharpen them', 'Beat them into ploughshares', 'Bury them', 'Give them away'],
      answer: 1,
      teachingKeyword: 'PLOUGHSHARES.',
      insight: 'Weapons remade into farm tools — not destroyed but repurposed. The image is inscribed outside the United Nations.',
      verse: 'Isaiah 2:4',
    },
    {
      kind: 'tf',
      prompt: 'Isaiah says a child will be born and called Wonderful Counsellor, Mighty God.',
      answer: true,
      insight: 'And Everlasting Father, Prince of Peace. Four titles for a child, in a chapter about a people walking in darkness.',
      verse: 'Isaiah 9:6',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the promise.',
      text: 'A bruised reed he will not ___, and a dimly burning wick he will not quench.',
      options: ['break', 'take', 'bend', 'burn'],
      answer: 0,
      insight: 'Quoted by Matthew of Jesus. The servant is defined by what he declines to finish off.',
      verse: 'Isaiah 42:3',
    },
    {
      kind: 'mcq',
      prompt: 'How does Isaiah describe our righteousness?',
      options: ['Sufficient', 'As filthy rags', 'Growing', 'Hidden'],
      answer: 1,
      insight: 'Said by the prophet about his own people, including himself. He does not exempt the messenger.',
      verse: 'Isaiah 64:6',
    },
    {
      kind: 'tf',
      prompt: 'Isaiah pictures a wolf living with a lamb.',
      answer: true,
      insight: 'And a child leading them. The image is of danger present but no longer dangerous.',
      verse: 'Isaiah 11:6',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Can a woman forget her nursing child… I have engraved you on the palms of my ___.',
      answer: 'hands',
      accept: ['hands'],
      insight: 'The strongest human bond named, and then said to be less reliable than the one being described.',
      verse: 'Isaiah 49:16',
    },
  ],

  'birth-2': [
    {
      kind: 'mcq',
      prompt: 'What did Mary\u2019s song say God had done to the powerful?',
      options: ['Blessed them', 'Brought them down from their thrones', 'Ignored them', 'Warned them'],
      answer: 1,
      teachingKeyword: 'BROUGHT DOWN.',
      insight: 'And exalted the lowly, and filled the hungry. Sung by a pregnant teenager about a child not yet born.',
      verse: 'Luke 1:52',
    },
    {
      kind: 'tf',
      prompt: 'Zechariah was unable to speak until John was born.',
      answer: true,
      insight: 'For doubting the angel. His first words after months of silence are a song of praise.',
      verse: 'Luke 1:20',
    },
    {
      kind: 'mcq',
      prompt: 'What did Joseph plan before the angel spoke to him?',
      options: ['To marry quietly', 'To divorce her quietly', 'To accuse her', 'To leave Nazareth'],
      answer: 1,
      insight: 'Unwilling to expose her to public shame. Matthew notes the kindness before the intervention.',
      verse: 'Matthew 1:19',
    },
    {
      kind: 'whosaid',
      quote: 'My eyes have seen your salvation.',
      options: ['Anna', 'Simeon', 'Zechariah', 'Joseph'],
      answer: 1,
      insight: 'Holding a forty-day-old baby in a crowded temple. He asks for nothing else afterwards.',
      verse: 'Luke 2:30',
    },
    {
      kind: 'tf',
      prompt: 'An elderly widow also recognised the child.',
      answer: true,
      insight: 'Anna, eighty-four, who had not left the temple in decades. Luke names her and her tribe.',
      verse: 'Luke 2:36',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the angel\u2019s announcement.',
      text: 'I bring you good news of great joy which will be to ___ the people.',
      options: ['all', 'some of', 'these', 'God\u2019s'],
      answer: 0,
      insight: 'Said to shepherds, about a birth in a stable, in an occupied province. The word is all.',
      verse: 'Luke 2:10',
    },
  ],

  'ministry-2': [
    {
      kind: 'mcq',
      prompt: 'What did Jesus say about the Sabbath?',
      options: ['It is abolished', 'It was made for man, not man for the Sabbath', 'It is optional', 'It is the greatest command'],
      answer: 1,
      teachingKeyword: 'FOR MAN.',
      insight: 'Said while his disciples were being criticised for picking grain. He reverses which serves which.',
      verse: 'Mark 2:27',
    },
    {
      kind: 'tf',
      prompt: 'Jesus was criticised for the company he kept.',
      answer: true,
      insight: 'A friend of tax collectors and sinners — meant as an accusation, and never denied.',
      verse: 'Matthew 11:19',
    },
    {
      kind: 'mcq',
      prompt: 'What did Jesus tell the disciples about worry?',
      options: ['It is natural', 'Consider the birds and the lilies', 'Pray it away', 'Work harder'],
      answer: 1,
      insight: 'The argument is from ordinary things anyone could look at while he was speaking.',
      verse: 'Matthew 6:26',
    },
    {
      kind: 'whosaid',
      quote: 'Lord, to whom would we go? You have the words of eternal life.',
      options: ['Peter', 'John', 'Thomas', 'Andrew'],
      answer: 0,
      insight: 'Said after a hard teaching had emptied the crowd. Asked whether the twelve would leave too.',
      verse: 'John 6:68',
    },
    {
      kind: 'tf',
      prompt: 'Jesus withdrew regularly to pray alone.',
      answer: true,
      insight: 'Often, and early, and in lonely places. The Gospels mention it as a habit rather than an event.',
      verse: 'Luke 5:16',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the invitation.',
      text: 'Take my yoke upon you and learn from me, for I am gentle and ___ in heart.',
      options: ['humble', 'patient', 'pure', 'strong'],
      answer: 0,
      insight: 'The only place he describes his own character, and these are the two words he chooses.',
      verse: 'Matthew 11:29',
    },
  ],

  // ── ABRAHAM ──────────────────────────────────────────────────────
  abraham: [
    {
      kind: 'mcq',
      prompt: 'What was Abram told to leave behind?',
      options: ['His wealth', 'His country, family and father\u2019s house', 'His name', 'His flocks'],
      answer: 1,
      insight: 'Three things, each closer than the last. The command narrows as it goes and ends at the hardest.',
      verse: 'Genesis 12:1',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse Paul builds an argument on.',
      text: 'He believed in Yahweh, and he reckoned it to him for ___.',
      options: ['righteousness', 'obedience', 'faithfulness', 'reward'],
      answer: 0,
      teachingKeyword: 'RECKONED.',
      insight: 'Not earned, counted. Paul returns to this one sentence again and again to explain how anyone stands before God.',
      verse: 'Genesis 15:6',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'Look now toward the sky, and count the stars… So will your offspring be.', reference: 'Genesis 15:5' },
        { text: 'God will provide himself the lamb for a burnt offering.', reference: 'Genesis 22:8' },
        { text: 'In you all the families of the earth will be blessed.', reference: 'Genesis 12:3' },
      ],
      insight: 'A promise of descendants, a promise of provision, and a promise reaching past his own family entirely.',
    },
    {
      kind: 'tf',
      prompt: 'Abraham and Sarah waited decades for the promised son.',
      answer: true,
      insight: 'Twenty-five years between the promise and Isaac. Most of the story is waiting.',
      verse: 'Genesis 21:5',
    },
    {
      kind: 'whosaid',
      quote: 'God will provide himself the lamb.',
      options: ['Isaac', 'Abraham', 'Sarah', 'The angel'],
      answer: 1,
      insight: 'Said on the way up the mountain, to the son he had been told to offer. He names the mountain afterwards “Yahweh will provide”.',
      verse: 'Genesis 22:8',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Abraham called the name of that place “Yahweh will ___”.',
      answer: 'provide',
      accept: ['provide', 'see'],
      insight: 'The name outlives the event. Generations later people still said it of that mountain.',
      verse: 'Genesis 22:14',
    },
  ],

  // ── JOSEPH ───────────────────────────────────────────────────────
  joseph: [
    {
      kind: 'mcq',
      prompt: 'Why did Joseph\u2019s brothers turn against him?',
      options: ['He stole from them', 'Their father favoured him and he dreamed of ruling them', 'He lied to their father', 'He left home'],
      answer: 1,
      insight: 'The coat and the dreams together. He was favoured, and he told them about it.',
      verse: 'Genesis 37:4',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['You', 'meant', 'evil', 'against', 'me,', 'but', 'God', 'meant', 'it', 'for', 'good.'],
      teachingKeyword: 'MEANT IT.',
      insight: 'Said to the brothers who sold him, decades later, with power to destroy them. He names the evil plainly and then names something larger.',
      verse: 'Genesis 50:20',
    },
    {
      kind: 'tf',
      prompt: 'Joseph was imprisoned for something he did not do.',
      answer: true,
      insight: 'Accused by Potiphar’s wife after refusing her. He goes from slave to prisoner for doing the right thing.',
      verse: 'Genesis 39:20',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what Joseph said in prison.',
      text: 'Don\u2019t interpretations belong to ___? Please tell it to me.',
      options: ['God', 'the wise', 'kings', 'dreams'],
      answer: 0,
      insight: 'The gift that got him sold is the gift he keeps crediting elsewhere.',
      verse: 'Genesis 40:8',
    },
    {
      kind: 'mcq',
      prompt: 'What did Joseph do when he first saw his brothers again?',
      options: ['Had them arrested', 'Wept', 'Refused to see them', 'Sent them away'],
      answer: 1,
      insight: 'He weeps repeatedly through the reunion — loudly enough, at one point, that the Egyptians hear it.',
      verse: 'Genesis 45:2',
    },
    {
      kind: 'whosaid',
      quote: 'Am I in the place of God?',
      options: ['Pharaoh', 'Jacob', 'Joseph', 'Judah'],
      answer: 2,
      insight: 'His answer to brothers expecting revenge. He refuses the role of judge that was his to take.',
      verse: 'Genesis 50:19',
    },
  ],

  // ── MOSES ────────────────────────────────────────────────────────
  moses: [
    {
      kind: 'cloze',
      prompt: 'Complete the name God gives.',
      text: 'God said to Moses, “I ___ WHO I AM.”',
      options: ['AM', 'WAS', 'WILL BE', 'SEND'],
      answer: 0,
      teachingKeyword: 'I AM.',
      insight: 'Asked for a name to give the slaves, God answers with existence itself. Jesus takes the same words up in John.',
      verse: 'Exodus 3:14',
    },
    {
      kind: 'mcq',
      prompt: 'What was strange about the bush?',
      options: ['It spoke first', 'It burned without being consumed', 'It grew in the sea', 'It bore fruit'],
      answer: 1,
      insight: 'Fire that takes nothing from what it burns. The image sits under everything the chapter goes on to say.',
      verse: 'Exodus 3:2',
    },
    {
      kind: 'tf',
      prompt: 'Moses argued with God about being sent.',
      answer: true,
      insight: 'Five separate objections, ending with “send someone else”. The call is not accepted gladly.',
      verse: 'Exodus 4:13',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'Let my people go, that they may serve me.', reference: 'Exodus 8:1' },
        { text: 'When I see the blood, I will pass over you.', reference: 'Exodus 12:13' },
        { text: 'Yahweh will fight for you, and you shall be still.', reference: 'Exodus 14:14' },
      ],
      insight: 'The demand, the sign, and the sea — the three turns the exodus story makes.',
    },
    {
      kind: 'mcq',
      prompt: 'What did the people find on the ground each morning in the wilderness?',
      options: ['Quail', 'Manna', 'Water', 'Grain'],
      answer: 1,
      teachingKeyword: 'WHAT IS IT?',
      insight: 'The name means “what is it?” — the question they asked on seeing it became what they called it ever after.',
      verse: 'Exodus 16:15',
    },
    {
      kind: 'tf',
      prompt: 'The manna could be stored up for later.',
      answer: false,
      insight: 'Kept overnight it bred worms. Enough was given for the day, and only for the day.',
      verse: 'Exodus 16:20',
    },
  ],

  // ── THE LAW ─────────────────────────────────────────────────────
  'the-law': [
    {
      kind: 'mcq',
      prompt: 'How does the giving of the commandments begin?',
      options: ['With a threat', 'With a reminder of rescue from Egypt', 'With a list of rewards', 'With silence'],
      answer: 1,
      teachingKeyword: 'I BROUGHT YOU OUT.',
      insight: 'Rescue first, commands second. The order matters — they are told who saved them before they are told how to live.',
      verse: 'Exodus 20:2',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the command Jesus called the greatest.',
      text: 'You shall love Yahweh your God with all your ___, with all your soul, and with all your might.',
      options: ['heart', 'strength', 'mind', 'life'],
      answer: 0,
      insight: 'Recited twice daily by observant Jews then and now. Jesus quotes it when asked to rank the whole Law.',
      verse: 'Deuteronomy 6:5',
    },
    {
      kind: 'tf',
      prompt: 'The Law included instructions about caring for foreigners and the poor.',
      answer: true,
      insight: 'Leave the edges of your field unharvested. The gleaning laws are how Ruth eats, generations later.',
      verse: 'Leviticus 19:10',
    },
    {
      kind: 'mcq',
      prompt: 'What did the people do while Moses was on the mountain?',
      options: ['Waited faithfully', 'Made a golden calf', 'Returned to Egypt', 'Chose a new leader'],
      answer: 1,
      insight: 'The covenant is broken before the tablets reach the bottom of the mountain.',
      verse: 'Exodus 32:4',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Remember the ___ day, to keep it holy.',
      answer: 'sabbath',
      accept: ['sabbath'],
      insight: 'The only command given to a people who had just left slavery that guarantees them rest.',
      verse: 'Exodus 20:8',
    },
    {
      kind: 'whosaid',
      quote: 'All that Yahweh has spoken we will do.',
      options: ['Moses', 'Aaron', 'The people', 'Joshua'],
      answer: 2,
      insight: 'Said before they had heard the terms, and broken within weeks. The Law records both.',
      verse: 'Exodus 19:8',
    },
  ],

  // ── DAVID ────────────────────────────────────
  david: [
    {
      kind: 'cloze',
      prompt: 'Complete what God said when Samuel judged by appearance.',
      text: 'Man looks at the outward appearance, but Yahweh looks at the ___.',
      options: ['heart', 'hands', 'life', 'spirit'],
      answer: 0,
      teachingKeyword: 'THE HEART.',
      insight: 'Said while passing over seven older brothers to reach the one left minding sheep.',
      verse: '1 Samuel 16:7',
    },
    {
      kind: 'mcq',
      prompt: 'What did David say he came against Goliath with?',
      options: ['A sword', 'His skill', 'The name of Yahweh', 'His brothers'],
      answer: 2,
      insight: 'He names the mismatch and calls it the wrong way round — the armed man is the one at a disadvantage.',
      verse: '1 Samuel 17:45',
    },
    {
      kind: 'tf',
      prompt: 'David twice spared Saul\u2019s life when he could have killed him.',
      answer: true,
      insight: 'Once in a cave, once in a camp at night. He refuses to take the crown by the route available to him.',
      verse: '1 Samuel 24:6',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'Yahweh is my shepherd; I shall lack nothing.', reference: 'Psalm 23:1' },
        { text: 'Create in me a clean heart, God.', reference: 'Psalm 51:10' },
        { text: 'The heavens declare the glory of God.', reference: 'Psalm 19:1' },
      ],
      insight: 'Trust, repentance and wonder — three of the notes David keeps returning to.',
    },
    {
      kind: 'mcq',
      prompt: 'How did David respond when confronted about Bathsheba and Uriah?',
      options: ['He denied it', 'He blamed others', 'He confessed', 'He said nothing'],
      answer: 2,
      insight: 'Four words, no defence. Psalm 51 is what came after.',
      verse: '2 Samuel 12:13',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'God promised David that his ___ would be established forever.',
      answer: 'throne',
      accept: ['throne', 'kingdom', 'house'],
      insight: 'A promise about a dynasty that ended in exile — and which the Gospels open by claiming is not finished.',
      verse: '2 Samuel 7:16',
    },
  ],

  // ── ISAIAH ───────────────────────────────────
  isaiah: [
    {
      kind: 'whosaid',
      quote: 'Here I am. Send me!',
      options: ['Moses', 'Isaiah', 'Samuel', 'Jeremiah'],
      answer: 1,
      teachingKeyword: 'SEND ME.',
      insight: 'Offered before he is told the message, which turns out to be one nobody will listen to.',
      verse: 'Isaiah 6:8',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the promise Matthew quotes at the birth of Jesus.',
      text: 'The virgin will conceive and bear a son, and shall call his name ___.',
      options: ['Immanuel', 'Jesus', 'Wonderful', 'Messiah'],
      answer: 0,
      insight: 'God with us. Written seven centuries before the Gospel that reaches back for it.',
      verse: 'Isaiah 7:14',
    },
    {
      kind: 'mcq',
      prompt: 'How does Isaiah describe the suffering servant?',
      options: ['Triumphant', 'Pierced for our transgressions', 'Unknown to God', 'A warrior king'],
      answer: 1,
      insight: 'Chapter 53 is quoted more often in the New Testament than almost any other passage.',
      verse: 'Isaiah 53:5',
    },
    {
      kind: 'tf',
      prompt: 'Isaiah says the servant would be admired and followed by many.',
      answer: false,
      insight: 'Despised and rejected, and we hid our faces from him. The prophecy is explicit that he would not be wanted.',
      verse: 'Isaiah 53:3',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['They', 'will', 'mount', 'up', 'with', 'wings', 'like', 'eagles.'],
      insight: 'The promise is to those who wait — which is the hardest thing the chapter asks for.',
      verse: 'Isaiah 40:31',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Though your sins are as scarlet, they shall be as white as ___.',
      answer: 'snow',
      accept: ['snow'],
      insight: 'Offered in a chapter otherwise full of judgement — the invitation sits inside the indictment.',
      verse: 'Isaiah 1:18',
    },
  ],

  // ── BIRTH OF JESUS ────────────────────────
  birth: [
    {
      kind: 'cloze',
      prompt: 'Complete the angel\u2019s words to Joseph.',
      text: 'You shall call his name Jesus, for it is he who shall ___ his people from their sins.',
      options: ['save', 'lead', 'gather', 'judge'],
      answer: 0,
      teachingKeyword: 'HE WILL SAVE.',
      insight: 'The name is the job description. Yeshua means “the Lord saves”, so the sentence explains itself.',
      verse: 'Matthew 1:21',
    },
    {
      kind: 'mcq',
      prompt: 'Who were the first people told of the birth?',
      options: ['Priests', 'Shepherds', 'Kings', 'Scribes'],
      answer: 1,
      insight: 'Night-shift labourers on a hillside, in a trade that kept them from the temple. The announcement goes to them first.',
      verse: 'Luke 2:8',
    },
    {
      kind: 'whosaid',
      quote: 'Let it be done to me according to your word.',
      options: ['Elizabeth', 'Mary', 'Anna', 'Joseph'],
      answer: 1,
      insight: 'An answer given by a young woman in a village, to news that would cost her reputation.',
      verse: 'Luke 1:38',
    },
    {
      kind: 'tf',
      prompt: 'The Gospel of John opens with a genealogy.',
      answer: false,
      insight: 'It opens where Genesis does — in the beginning — and reaches the birth in a single line.',
      verse: 'John 1:1',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['The', 'Word', 'became', 'flesh,', 'and', 'lived', 'among', 'us.'],
      insight: 'The Greek behind “lived among us” means pitched a tent — the word used of God dwelling with Israel in the wilderness.',
      verse: 'John 1:14',
    },
    {
      kind: 'mcq',
      prompt: 'What did Simeon say when he saw the child?',
      options: ['That he would reign', 'That he could now depart in peace', 'That he feared for him', 'That he must be hidden'],
      answer: 1,
      insight: 'An old man promised he would not die before seeing it. He asks for nothing else afterwards.',
      verse: 'Luke 2:29',
    },
  ],

  // ── MINISTRY ──────────────────────────
  ministry: [
    {
      kind: 'mcq',
      prompt: 'What did Jesus say the greatest commandment was?',
      options: ['Keep the Sabbath', 'Love God with everything, and your neighbour as yourself', 'Give to the poor', 'Study the Law'],
      answer: 1,
      insight: 'Two commands offered where one was asked for, and he refuses to separate them.',
      verse: 'Matthew 22:37',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the invitation.',
      text: 'Come to me, all you who labour and are heavily burdened, and I will give you ___.',
      options: ['rest', 'peace', 'life', 'freedom'],
      answer: 0,
      teachingKeyword: 'REST.',
      insight: 'Offered to people under a system of religious requirements — and what he offers is the one thing it could not give.',
      verse: 'Matthew 11:28',
    },
    {
      kind: 'tf',
      prompt: 'Jesus taught mainly in parables.',
      answer: true,
      insight: 'Stories about farming, money and family that let people arrive at the point themselves rather than be told it.',
      verse: 'Matthew 13:34',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'I am the way, the truth, and the life.', reference: 'John 14:6' },
        { text: 'I am the bread of life.', reference: 'John 6:35' },
        { text: 'I am the good shepherd.', reference: 'John 10:11' },
      ],
      insight: 'Three of the “I am” sayings, each reaching back to the name given at the burning bush.',
    },
    {
      kind: 'whosaid',
      quote: 'Whoever wants to become great among you shall be your servant.',
      options: ['Peter', 'Jesus', 'Paul', 'John'],
      answer: 1,
      insight: 'Said to disciples arguing about rank. He does not tell them to stop wanting greatness — he redefines it.',
      verse: 'Matthew 20:26',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'I am the ___ of life. Whoever comes to me will not be hungry.',
      answer: 'bread',
      accept: ['bread'],
      insight: 'Said the day after feeding five thousand, to a crowd that had come back for more food.',
      verse: 'John 6:35',
    },
  ],

  // ── MIRACLES ─────────────────────────
  miracles: [
    {
      kind: 'mcq',
      prompt: 'What did Jesus do first at the wedding in Cana?',
      options: ['Healed a guest', 'Turned water into wine', 'Calmed a dispute', 'Left early'],
      answer: 1,
      insight: 'The first sign in John is not a healing or a rescue. It is keeping a party from ending in embarrassment.',
      verse: 'John 2:11',
    },
    {
      kind: 'whosaid',
      quote: 'Peace! Be still!',
      options: ['Peter', 'Jesus', 'John', 'The wind'],
      answer: 1,
      teachingKeyword: 'BE STILL.',
      insight: 'Said to a storm, in the same tone he used on demons. The disciples are more frightened afterwards than before.',
      verse: 'Mark 4:39',
    },
    {
      kind: 'mcq',
      prompt: 'How much was left over after feeding the five thousand?',
      options: ['Nothing', 'A little', 'Twelve baskets', 'Half of it'],
      answer: 2,
      insight: 'One basket for each disciple who had said it could not be done.',
      verse: 'Matthew 14:20',
    },
    {
      kind: 'tf',
      prompt: 'Jesus often told people he had healed to keep it quiet.',
      answer: true,
      insight: 'Repeatedly, and repeatedly ignored. The miracles are not staged for an audience.',
      verse: 'Mark 1:44',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what Jesus said to the woman who touched his cloak.',
      text: 'Daughter, your ___ has made you well. Go in peace.',
      options: ['faith', 'courage', 'need', 'hope'],
      answer: 0,
      insight: 'He credits her rather than himself, in front of a crowd that had just watched him do it.',
      verse: 'Mark 5:34',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the shortest verse in Scripture.',
      answer: ['Jesus', 'wept.'],
      insight: 'Standing outside Lazarus’ tomb, minutes before raising him. He grieves for a death he is about to undo.',
      verse: 'John 11:35',
    },
  ],

  // ── DEATH & RESURRECTION ─────────────────
  cross: [
    {
      kind: 'whosaid',
      quote: 'It is finished.',
      options: ['Peter', 'Jesus', 'Pilate', 'The centurion'],
      answer: 1,
      teachingKeyword: 'FINISHED.',
      insight: 'One word in Greek — tetelestai — written across paid debts. Not a surrender but a completion.',
      verse: 'John 19:30',
    },
    {
      kind: 'mcq',
      prompt: 'What happened to the temple curtain when Jesus died?',
      options: ['It caught fire', 'It was torn in two from top to bottom', 'It was taken down', 'Nothing'],
      answer: 1,
      insight: 'The barrier between the people and the holy place, torn from the top — the end nobody could reach.',
      verse: 'Matthew 27:51',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what Jesus prayed from the cross.',
      text: 'Father, ___ them, for they don\u2019t know what they are doing.',
      options: ['forgive', 'spare', 'pardon', 'have mercy on'],
      answer: 0,
      insight: 'Prayed for the men driving in the nails, while they were doing it.',
      verse: 'Luke 23:34',
    },
    {
      kind: 'mcq',
      prompt: 'Who first found the tomb empty?',
      options: ['Peter', 'The women', 'The Roman guard', 'John'],
      answer: 1,
      insight: 'In a culture where their testimony carried little legal weight. No one inventing the account would have written it that way.',
      verse: 'Matthew 28:1',
    },
    {
      kind: 'tf',
      prompt: 'The disciples believed the resurrection immediately when told.',
      answer: false,
      insight: '“These words seemed to them to be nonsense.” Thomas is not the only one who needed convincing.',
      verse: 'Luke 24:11',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'My God, my God, why have you forsaken me?', reference: 'Matthew 27:46' },
        { text: 'He is not here, for he has risen, just like he said.', reference: 'Matthew 28:6' },
        { text: 'Behold, I am with you always, even to the end of the age.', reference: 'Matthew 28:20' },
      ],
      insight: 'Abandonment, then absence, then presence — the three sentences the Gospel ends on.',
    },
  ],

  // ── ACTS ───────────────────────
  acts: [
    {
      kind: 'mcq',
      prompt: 'What appeared over the disciples at Pentecost?',
      options: ['A cloud', 'Tongues like fire', 'A bright star', 'A dove'],
      answer: 1,
      insight: 'Fire that rests on each one separately. What had filled a temple now settles on individual people.',
      verse: 'Acts 2:3',
    },
    {
      kind: 'tf',
      prompt: 'Each person at Pentecost heard the disciples in their own language.',
      answer: true,
      teachingKeyword: 'IN OUR OWN.',
      insight: 'The exact reverse of Babel. There, one language became many to scatter; here, many hear one message and gather.',
      verse: 'Acts 2:6',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what the early believers devoted themselves to.',
      text: 'They continued steadfastly in the apostles\u2019 teaching and fellowship, in the ___ of bread, and prayer.',
      options: ['breaking', 'blessing', 'giving', 'sharing'],
      answer: 0,
      insight: 'Four things, and two of them are just eating together and talking. The church begins as a household.',
      verse: 'Acts 2:42',
    },
    {
      kind: 'whosaid',
      quote: 'Lord, don\u2019t hold this sin against them.',
      options: ['Peter', 'Paul', 'Stephen', 'James'],
      answer: 2,
      insight: 'Said while being stoned to death, echoing the cross. Saul was holding the coats.',
      verse: 'Acts 7:60',
    },
    {
      kind: 'mcq',
      prompt: 'What happened to Saul on the road to Damascus?',
      options: ['He was arrested', 'He was blinded by a light and heard Jesus speak', 'He changed his mind', 'He fell ill'],
      answer: 1,
      insight: 'On his way to arrest Christians. The man persecuting the church becomes the one who writes most of its letters.',
      verse: 'Acts 9:4',
    },
    {
      kind: 'tf',
      prompt: 'The early church decided Gentiles had to keep the whole Jewish law.',
      answer: false,
      insight: 'The council in Jerusalem decided against it — the single decision that let the movement leave its own culture.',
      verse: 'Acts 15:19',
    },
  ],

  // ── PAUL’S LETTERS ───────────────────
  letters: [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For by grace you have been saved through faith, and that not of yourselves; it is the ___ of God.',
      options: ['gift', 'work', 'promise', 'reward'],
      answer: 0,
      teachingKeyword: 'A GIFT.',
      insight: 'The next line closes the door on earning it: not of works, so that no one can boast.',
      verse: 'Ephesians 2:8',
    },
    {
      kind: 'match',
      prompt: 'Match each verse to where it is found.',
      pairs: [
        { text: 'All things work together for good to those who love God.', reference: 'Romans 8:28' },
        { text: 'Love is patient and is kind.', reference: '1 Corinthians 13:4' },
        { text: 'I can do all things through Christ who strengthens me.', reference: 'Philippians 4:13' },
      ],
      insight: 'Three of the most quoted lines in the letters — and all three sit inside arguments about suffering.',
    },
    {
      kind: 'mcq',
      prompt: 'What does Paul call the fruit of the Spirit?',
      options: ['Wisdom and power', 'Love, joy, peace, patience and more', 'Faith alone', 'Knowledge'],
      answer: 1,
      insight: 'Fruit, singular — nine aspects of one thing, not a list to pick from.',
      verse: 'Galatians 5:22',
    },
    {
      kind: 'tf',
      prompt: 'Paul wrote several of his letters from prison.',
      answer: true,
      insight: 'Philippians, with its repeated command to rejoice, is one of them.',
      verse: 'Philippians 1:13',
    },
    {
      kind: 'whosaid',
      quote: 'I have learned in whatever state I am, to be content.',
      options: ['Peter', 'Paul', 'James', 'John'],
      answer: 1,
      insight: 'Learned, not felt. He says it as a skill acquired, and he had been hungry often enough to mean it.',
      verse: 'Philippians 4:11',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Do not be anxious about anything, but in everything, by prayer and petition with ___, let your requests be made known.',
      answer: 'thanksgiving',
      accept: ['thanksgiving', 'thanks'],
      insight: 'Gratitude asked for before the answer arrives, which is the difficult part of the instruction.',
      verse: 'Philippians 4:6',
    },
  ],

  // ── REVELATION ────────────────────
  revelation: [
    {
      kind: 'mcq',
      prompt: 'Who is found worthy to open the scroll?',
      options: ['An angel', 'The Lamb', 'The elders', 'No one'],
      answer: 1,
      teachingKeyword: 'THE LAMB.',
      insight: 'John is told to look at a Lion, turns, and sees a Lamb that had been slain. The image swaps and never swaps back.',
      verse: 'Revelation 5:6',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the promise.',
      text: 'He will wipe away every ___ from their eyes.',
      options: ['tear', 'fear', 'shadow', 'stain'],
      answer: 0,
      insight: 'Not that there was nothing to weep about, but that the weeping is attended to personally.',
      verse: 'Revelation 21:4',
    },
    {
      kind: 'tf',
      prompt: 'The book ends with people going up to heaven.',
      answer: false,
      insight: 'It ends with the city coming down. “The dwelling of God is with people” — the movement is toward earth.',
      verse: 'Revelation 21:3',
    },
    {
      kind: 'mcq',
      prompt: 'What is absent from the new Jerusalem?',
      options: ['People', 'A temple', 'Light', 'Nations'],
      answer: 1,
      insight: 'No temple, because the whole city is one. The building existed to hold a presence no longer confined.',
      verse: 'Revelation 21:22',
    },
    {
      kind: 'whosaid',
      quote: 'Behold, I am making all things new.',
      options: ['The angel', 'John', 'The one seated on the throne', 'The Lamb'],
      answer: 2,
      insight: 'All things new, not all new things. The same creation called good in Genesis 1, remade rather than replaced.',
      verse: 'Revelation 21:5',
    },
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['Behold,', 'I', 'stand', 'at', 'the', 'door', 'and', 'knock.'],
      insight: 'Written to a church, not to outsiders — the one being asked to open is already inside.',
      verse: 'Revelation 3:20',
    },
  ],
};

/**
 * UNITS
 *
 * A topic can hold several lessons. The tree still shows one node per topic;
 * tapping it opens whichever unit comes next, and the topic only counts as
 * gathered once all of them are done.
 *
 * A topic with no entry here has a single unit named after itself, which is
 * how every topic began — so adding units is additive and never disturbs
 * progress already made.
 */
export const UNITS: Record<string, string[]> = {
  creation: ['creation', 'creation-2'],
  'the-fall': ['the-fall', 'the-fall-2'],
  noah: ['noah', 'noah-2'],
};

export const unitsOf = (topic: string): string[] => UNITS[topic] ?? [topic];

/** Whether every unit of a topic has been gathered. */
export const topicComplete = (topic: string, completed: string[]): boolean =>
  unitsOf(topic).every((u) => completed.includes(u));

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

  // ── DAY 2 ──────────────────────────────────────────────────────────
  'genesis-3': [
    {
      kind: 'whosaid',
      quote: 'You will not certainly die.',
      options: ['Eve', 'Adam', 'The serpent', 'God'],
      answer: 2,
      teachingKeyword: 'DOUBT.',
      insight: 'The first lie works by contradiction, but it begins with a question — “did God really say?” Doubt is laid before denial.',
      verse: 'Genesis 3:4',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the promise buried in the curse.',
      text: 'He will bruise your ___, and you will bruise his heel.',
      options: ['head', 'hand', 'name', 'seed'],
      answer: 0,
      insight: 'Spoken to the serpent, not to Adam — the first hint of rescue arrives inside the sentence of judgement.',
      verse: 'Genesis 3:15',
    },
    {
      kind: 'mcq',
      prompt: 'What did God do for Adam and Eve before sending them out?',
      options: ['Restored the garden', 'Clothed them', 'Removed the curse', 'Gave them a map'],
      answer: 1,
      insight: 'They sewed fig leaves; God made garments of skin. The covering that held cost a life.',
      verse: 'Genesis 3:21',
    },
  ],

  'genesis-4': [
    {
      kind: 'cloze',
      prompt: 'Complete God\u2019s warning to Cain.',
      text: 'Sin crouches at the door. Its desire is for you, but you are to ___ it.',
      options: ['rule over', 'flee from', 'forgive', 'name'],
      answer: 0,
      teachingKeyword: 'RULE.',
      insight: 'Said before the murder, not after. Cain is warned while there is still a choice, and told the choice is his.',
      verse: 'Genesis 4:7',
    },
    {
      kind: 'whosaid',
      quote: 'Am I my brother\u2019s keeper?',
      options: ['Adam', 'Cain', 'Abel', 'Lamech'],
      answer: 1,
      insight: 'A question meant to end the conversation. Scripture spends the rest of its length answering it yes.',
      verse: 'Genesis 4:9',
    },
    {
      kind: 'tf',
      prompt: 'God placed a mark on Cain to protect him.',
      answer: true,
      insight: 'The man who has just committed murder is given protection from being murdered. Judgement and mercy arrive together.',
      verse: 'Genesis 4:15',
    },
  ],

  'psalms-2': [
    {
      kind: 'mcq',
      prompt: 'How does the psalm describe the nations plotting against God?',
      options: ['A serious threat', 'A vain thing', 'A just cause', 'A mystery'],
      answer: 1,
      insight: 'The kings take counsel together; heaven is not troubled. The psalm treats the conspiracy as noise.',
      verse: 'Psalm 2:1',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the declaration.',
      text: 'You are my ___. Today I have become your father.',
      options: ['son', 'servant', 'chosen', 'king'],
      answer: 0,
      insight: 'Quoted at Jesus’ baptism and again at his transfiguration. The New Testament reaches for this verse more than almost any other.',
      verse: 'Psalm 2:7',
    },
    {
      kind: 'tf',
      prompt: 'The psalm ends with a warning rather than a blessing.',
      answer: false,
      insight: 'It ends “blessed are all those who take refuge in him” — the same king who breaks nations is the one you may shelter behind.',
      verse: 'Psalm 2:12',
    },
  ],

  'proverbs-2': [
    {
      kind: 'mcq',
      prompt: 'How does the chapter say wisdom must be sought?',
      options: ['By waiting patiently', 'As for silver and hidden treasure', 'By asking the elders', 'Through suffering'],
      answer: 1,
      teachingKeyword: 'SEARCH.',
      insight: 'Not received while resting. The verbs are all effort — cry out, lift your voice, seek, search.',
      verse: 'Proverbs 2:4',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For Yahweh gives ___; out of his mouth comes knowledge and understanding.',
      options: ['wisdom', 'peace', 'riches', 'favour'],
      answer: 0,
      insight: 'The chapter demands hard searching and then says the thing searched for is a gift. Both are true at once.',
      verse: 'Proverbs 2:6',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says wisdom will keep you from harmful company.',
      answer: true,
      insight: 'Wisdom here is protective rather than decorative — it is what gets you home.',
      verse: 'Proverbs 2:12',
    },
  ],

  // ── DAY 3 ──────────────────────────────────────────────────────────
  // Genesis 5 is a genealogy and gets no questions.
  'genesis-6': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'But Noah found ___ in Yahweh\u2019s eyes.',
      options: ['favour', 'shelter', 'mercy', 'refuge'],
      answer: 0,
      teachingKeyword: 'FAVOUR.',
      insight: 'The first appearance of grace in Scripture, and it comes before Noah is called righteous — not after.',
      verse: 'Genesis 6:8',
    },
    {
      kind: 'mcq',
      prompt: 'How does the chapter describe God\u2019s response to human wickedness?',
      options: ['Indifference', 'Grief', 'Amusement', 'Silence'],
      answer: 1,
      insight: '“It grieved him in his heart.” The flood is not told as cold judgement but as sorrow.',
      verse: 'Genesis 6:6',
    },
    {
      kind: 'tf',
      prompt: 'God gave Noah specific measurements for the ark.',
      answer: true,
      insight: 'Three hundred cubits by fifty by thirty. The rescue is given in carpentry, not in poetry.',
      verse: 'Genesis 6:15',
    },
  ],

  'matthew-2': [
    {
      kind: 'mcq',
      prompt: 'What did the wise men do when they found the child?',
      options: ['Questioned Mary', 'Bowed and worshipped', 'Took him to Herod', 'Wrote an account'],
      answer: 1,
      insight: 'Foreigners reading the sky arrive to worship, while the king in Jerusalem sends soldiers. The contrast is the chapter.',
      verse: 'Matthew 2:11',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the prophecy Matthew quotes.',
      text: 'Out of ___ I called my son.',
      options: ['Egypt', 'Bethlehem', 'Nazareth', 'Judah'],
      answer: 0,
      insight: 'Originally about Israel leaving slavery. Matthew reads Jesus as walking his people’s history again, and getting it right.',
      verse: 'Matthew 2:15',
    },
    {
      kind: 'tf',
      prompt: 'Jesus spent part of his childhood as a refugee.',
      answer: true,
      insight: 'The family fled to Egypt by night to escape a king’s violence, and stayed until he died.',
      verse: 'Matthew 2:14',
    },
  ],

  'psalms-3': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'But you, Yahweh, are a ___ around me, my glory, and the one who lifts up my head.',
      options: ['shield', 'tower', 'light', 'song'],
      answer: 0,
      insight: 'Not a shield in front — around. The psalm was written while David fled his own son.',
      verse: 'Psalm 3:3',
    },
    {
      kind: 'mcq',
      prompt: 'What does the psalmist say he did, surrounded by enemies?',
      options: ['Fought', 'Fled further', 'Lay down and slept', 'Kept watch all night'],
      answer: 2,
      teachingKeyword: 'SLEPT.',
      insight: 'Sleep as evidence of trust. It is a small detail and the whole argument of the psalm.',
      verse: 'Psalm 3:5',
    },
    {
      kind: 'tf',
      prompt: 'The psalm claims deliverance belongs to God rather than to the psalmist.',
      answer: true,
      insight: '“Salvation belongs to Yahweh.” Said by a king with an army, which is what makes it worth saying.',
      verse: 'Psalm 3:8',
    },
  ],

  'proverbs-3': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['Trust', 'in', 'Yahweh', 'with', 'all', 'your', 'heart.'],
      teachingKeyword: 'TRUST.',
      insight: 'The best known line in the book, and the demanding part is the next clause: lean not on your own understanding.',
      verse: 'Proverbs 3:5',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'In all your ways acknowledge him, and he will make your ___ straight.',
      options: ['paths', 'plans', 'days', 'words'],
      answer: 0,
      insight: 'A promise about direction, not about ease. Straight paths still have to be walked.',
      verse: 'Proverbs 3:6',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says God disciplines those he loves.',
      answer: true,
      insight: 'Quoted later in Hebrews. Correction is framed as a mark of belonging rather than of rejection.',
      verse: 'Proverbs 3:12',
    },
  ],

  // ── DAY 4 ──────────────────────────────────────────────────────────
  'genesis-7': [
    {
      kind: 'mcq',
      prompt: 'Who shut the door of the ark?',
      options: ['Noah', 'His sons', 'Yahweh', 'It closed in the storm'],
      answer: 2,
      teachingKeyword: 'SHUT IN.',
      insight: '“Yahweh shut him in.” A small line, easily passed over: the ones inside did not secure their own safety.',
      verse: 'Genesis 7:16',
    },
    {
      kind: 'tf',
      prompt: 'The rain fell for forty days and forty nights.',
      answer: true,
      insight: 'Forty recurs whenever Scripture marks a season of testing — the wilderness, Elijah, the temptation.',
      verse: 'Genesis 7:12',
    },
    {
      kind: 'tf',
      prompt: 'Noah entered the ark before the rain began.',
      answer: true,
      insight: 'Seven days before. The obedience had to come while the sky was still clear.',
      verse: 'Genesis 7:10',
    },
  ],

  'genesis-8': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse that turns the account.',
      text: 'God ___ Noah, and every living thing that was with him in the ship.',
      options: ['remembered', 'rescued', 'blessed', 'called'],
      answer: 0,
      teachingKeyword: 'REMEMBERED.',
      insight: 'The hinge of the whole flood narrative. Not that God had forgotten, but that he turned toward.',
      verse: 'Genesis 8:1',
    },
    {
      kind: 'mcq',
      prompt: 'What did the dove bring back on its second return?',
      options: ['Nothing', 'An olive leaf', 'A branch', 'A stone'],
      answer: 1,
      insight: 'A freshly plucked olive leaf — evidence that something was growing again. It has meant peace ever since.',
      verse: 'Genesis 8:11',
    },
    {
      kind: 'cloze',
      prompt: 'Complete God\u2019s promise.',
      text: 'While the earth remains, seedtime and harvest, cold and heat, summer and winter, day and night will not ___.',
      options: ['cease', 'change', 'fail us', 'be forgotten'],
      answer: 0,
      insight: 'The rhythm of ordinary days is offered as the sign of the promise. Every unremarkable morning is the evidence.',
      verse: 'Genesis 8:22',
    },
  ],

  'matthew-3': [
    {
      kind: 'mcq',
      prompt: 'What did John call people to do?',
      options: ['Keep the feasts', 'Repent', 'Follow him', 'Leave Judea'],
      answer: 1,
      insight: '“Repent, for the Kingdom of Heaven is at hand.” The reason given is not threat but nearness.',
      verse: 'Matthew 3:2',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what the voice from heaven said.',
      text: 'This is my ___ Son, with whom I am well pleased.',
      options: ['beloved', 'chosen', 'only', 'faithful'],
      answer: 0,
      teachingKeyword: 'BELOVED.',
      insight: 'Spoken before a single miracle or sermon. The approval comes first, and rests on who he is.',
      verse: 'Matthew 3:17',
    },
    {
      kind: 'tf',
      prompt: 'John was reluctant to baptise Jesus.',
      answer: true,
      insight: '“I need to be baptised by you, and you come to me?” Jesus insists, and joins the queue of the repentant without needing to.',
      verse: 'Matthew 3:14',
    },
  ],

  'psalms-4': [
    {
      kind: 'cloze',
      prompt: 'Complete the closing verse.',
      text: 'In ___ I will both lay myself down and sleep, for you alone make me live in safety.',
      options: ['peace', 'hope', 'quiet', 'trust'],
      answer: 0,
      insight: 'The second psalm in a row to end in sleep. Rest keeps being offered as the proof of trust.',
      verse: 'Psalm 4:8',
    },
    {
      kind: 'mcq',
      prompt: 'What does the psalm say to do when you are angry?',
      options: ['Speak plainly', 'Do not sin; search your heart in silence', 'Seek counsel', 'Let it pass'],
      answer: 1,
      insight: 'Anger is not forbidden, only given a boundary — and the boundary is quiet.',
      verse: 'Psalm 4:4',
    },
    {
      kind: 'tf',
      prompt: 'The psalmist says God has given him more joy than a good harvest gives.',
      answer: true,
      insight: 'More gladness than when grain and new wine abound — measured against the best year a farmer could have.',
      verse: 'Psalm 4:7',
    },
  ],

  'proverbs-4': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Keep your ___ with all diligence, for out of it is the wellspring of life.',
      options: ['heart', 'mind', 'word', 'way'],
      answer: 0,
      teachingKeyword: 'WELLSPRING.',
      insight: 'Guarded not because it is fragile but because everything else flows from it.',
      verse: 'Proverbs 4:23',
    },
    {
      kind: 'mcq',
      prompt: 'What is the path of the righteous compared to?',
      options: ['A straight road', 'The dawning light', 'A river', 'A high tower'],
      answer: 1,
      insight: 'Light that shines brighter until full day. Growth is described as gradual, which is a mercy.',
      verse: 'Proverbs 4:18',
    },
    {
      kind: 'tf',
      prompt: 'The chapter is written as a father passing on what his own father taught him.',
      answer: true,
      insight: '“When I was a son with my father…” Wisdom here is handed down rather than discovered alone.',
      verse: 'Proverbs 4:3',
    },
  ],

  // ── DAY 5 ──────────────────────────────────────────────────────────
  // Genesis 10 is the table of nations and gets no questions.
  'genesis-9': [
    {
      kind: 'cloze',
      prompt: 'Complete the sign of the covenant.',
      text: 'I set my ___ in the cloud, and it will be a sign of a covenant between me and the earth.',
      options: ['rainbow', 'light', 'mark', 'seal'],
      answer: 0,
      teachingKeyword: 'BOW.',
      insight: 'The Hebrew word is a war bow — hung in the sky, pointed away from the earth. A weapon set down.',
      verse: 'Genesis 9:13',
    },
    {
      kind: 'mcq',
      prompt: 'Who is the covenant made with?',
      options: ['Noah alone', 'Noah and his sons', 'Every living creature', 'The land itself'],
      answer: 2,
      insight: '“Every living creature of all flesh.” The promise is wider than the family that survived.',
      verse: 'Genesis 9:15',
    },
    {
      kind: 'tf',
      prompt: 'The chapter records Noah becoming drunk after the flood.',
      answer: true,
      insight: 'The man just called righteous is shown at his worst a few verses later. Scripture rarely tidies up its heroes.',
      verse: 'Genesis 9:21',
    },
  ],

  'genesis-11': [
    {
      kind: 'cloze',
      prompt: 'Complete what the builders said.',
      text: 'Let\u2019s build ourselves a city, and a tower whose top reaches to the sky, and let\u2019s make ourselves a ___.',
      options: ['name', 'home', 'kingdom', 'refuge'],
      answer: 0,
      teachingKeyword: 'A NAME.',
      insight: 'The whole project in three words. One chapter later God promises to make Abram’s name great — the thing they tried to seize is given.',
      verse: 'Genesis 11:4',
    },
    {
      kind: 'mcq',
      prompt: 'What did God do at Babel?',
      options: ['Destroyed the tower', 'Confused their language', 'Struck the builders', 'Took the city'],
      answer: 1,
      insight: 'No fire, no flood. He makes them unable to understand each other, and the work simply stops.',
      verse: 'Genesis 11:7',
    },
    {
      kind: 'tf',
      prompt: 'The builders were trying to avoid being scattered.',
      answer: true,
      insight: '“Lest we be scattered abroad.” They are scattered anyway — the thing they built to prevent.',
      verse: 'Genesis 11:4',
    },
  ],

  'psalms-5': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'In the ___, Yahweh, you will hear my voice. In the morning I will lay my requests before you.',
      options: ['morning', 'evening', 'silence', 'trouble'],
      answer: 0,
      insight: 'Said twice in one verse. The psalm is about a habit rather than an emergency.',
      verse: 'Psalm 5:3',
    },
    {
      kind: 'mcq',
      prompt: 'On what basis does the psalmist say he can enter God\u2019s house?',
      options: ['His own righteousness', 'The abundance of God\u2019s loving kindness', 'His offerings', 'His ancestry'],
      answer: 1,
      insight: 'The one verse where he might have claimed merit, he names mercy instead.',
      verse: 'Psalm 5:7',
    },
    {
      kind: 'tf',
      prompt: 'The psalm ends by asking for protection over all who take refuge in God.',
      answer: true,
      insight: 'It widens at the end from one voice to everyone sheltering — a private prayer that will not stay private.',
      verse: 'Psalm 5:11',
    },
  ],

  'proverbs-5': [
    {
      kind: 'mcq',
      prompt: 'What does the chapter urge a man toward?',
      options: ['Solitude', 'Faithfulness to his own wife', 'Wealth', 'Silence'],
      answer: 1,
      insight: 'The warning is long, but its argument is positive — rejoice in the wife of your youth.',
      verse: 'Proverbs 5:18',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For the ways of man are before Yahweh\u2019s ___; he examines all his paths.',
      options: ['eyes', 'throne', 'judgement', 'law'],
      answer: 0,
      insight: 'The chapter’s real ground: not that you might be caught, but that you are already seen.',
      verse: 'Proverbs 5:21',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says wrong choices can trap a person by their own habits.',
      answer: true,
      insight: '“He will be held with the cords of his sin.” The rope is described as his own, not another’s.',
      verse: 'Proverbs 5:22',
    },
  ],

  // ── DAY 6 ──────────────────────────────────────────────────────────
  'genesis-12': [
    {
      kind: 'wordbank',
      prompt: 'Build the promise.',
      answer: ['In', 'you', 'all', 'families', 'of', 'the', 'earth', 'will', 'be', 'blessed.'],
      teachingKeyword: 'ALL FAMILIES.',
      insight: 'The call of one man, and the reach named in the same breath is everyone. The rest of Scripture is this sentence working out.',
      verse: 'Genesis 12:3',
    },
    {
      kind: 'mcq',
      prompt: 'What was Abram told to leave?',
      options: ['His wealth', 'His country, family and father\u2019s house', 'His name', 'His flocks'],
      answer: 1,
      insight: 'Three things, each closer than the last. The command narrows as it goes, and ends at the hardest.',
      verse: 'Genesis 12:1',
    },
    {
      kind: 'tf',
      prompt: 'Abram was told where he was going before he left.',
      answer: false,
      insight: '“To the land that I will show you.” The destination is withheld; only the going is asked for.',
      verse: 'Genesis 12:1',
    },
  ],

  'matthew-4': [
    {
      kind: 'cloze',
      prompt: 'Complete Jesus\u2019 answer to the first temptation.',
      text: 'Man shall not live by ___ alone, but by every word that proceeds out of God\u2019s mouth.',
      options: ['bread', 'strength', 'work', 'law'],
      answer: 0,
      teachingKeyword: 'NOT BY BREAD.',
      insight: 'Quoted from the wilderness where Israel was fed with manna — the passage this app is named for. The bread was real, and it was never the point.',
      verse: 'Matthew 4:4',
    },
    {
      kind: 'mcq',
      prompt: 'How did Jesus answer each temptation?',
      options: ['With miracles', 'With silence', 'By quoting Scripture', 'By leaving'],
      answer: 2,
      insight: 'Three times, always from Deuteronomy. He uses nothing that was not available to anyone who knew the text.',
      verse: 'Matthew 4:10',
    },
    {
      kind: 'tf',
      prompt: 'The first disciples left their work immediately when called.',
      answer: true,
      insight: '“They immediately left their nets.” Matthew gives no deliberation, which is itself the point he is making.',
      verse: 'Matthew 4:20',
    },
  ],

  'psalms-6': [
    {
      kind: 'mcq',
      prompt: 'How does the psalm change in its final verses?',
      options: ['It grows darker', 'It turns to confidence that God has heard', 'It ends unresolved', 'It becomes a warning'],
      answer: 1,
      teachingKeyword: 'HAS HEARD.',
      insight: 'Nothing in the circumstances has changed. What changes is the tense — from pleading to “Yahweh has heard”.',
      verse: 'Psalm 6:9',
    },
    {
      kind: 'tf',
      prompt: 'The psalmist admits to weeping through the night.',
      answer: true,
      insight: 'Scripture keeps this kind of prayer rather than tidying it away. Grief is given words rather than corrected.',
      verse: 'Psalm 6:6',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the plea.',
      text: 'Have ___ on me, Yahweh, for I am faint.',
      options: ['mercy', 'patience', 'pity', 'compassion'],
      answer: 0,
      insight: 'The psalm asks for mercy rather than vindication — it never argues that the suffering is undeserved.',
      verse: 'Psalm 6:2',
    },
  ],

  'proverbs-6': [
    {
      kind: 'mcq',
      prompt: 'What is the sluggard told to learn from?',
      options: ['The ant', 'The ox', 'The eagle', 'The river'],
      answer: 0,
      teachingKeyword: 'THE ANT.',
      insight: 'It has no commander and works anyway. The lesson is self-direction, not effort.',
      verse: 'Proverbs 6:6',
    },
    {
      kind: 'tf',
      prompt: 'The chapter lists things that Yahweh hates.',
      answer: true,
      insight: 'Six, then seven — and most are ordinary: a proud look, a lying tongue, sowing discord among brothers.',
      verse: 'Proverbs 6:16',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the warning about poverty.',
      text: 'So your poverty will come as a ___, and your scarcity as an armed man.',
      options: ['robber', 'storm', 'shadow', 'debt'],
      answer: 0,
      insight: 'Not gradual. The chapter’s picture of neglect is that nothing happens, until suddenly it does.',
      verse: 'Proverbs 6:11',
    },
  ],

  // ── DAY 7 ──────────────────────────────────────────────────────────
  'genesis-13': [
    {
      kind: 'mcq',
      prompt: 'How was the dispute between Abram and Lot settled?',
      options: ['By lot', 'Abram let Lot choose first', 'By an elder', 'They stayed together'],
      answer: 1,
      teachingKeyword: 'YOU CHOOSE.',
      insight: 'The one with the promise gives away the choice. He can afford to, and that is the whole argument.',
      verse: 'Genesis 13:9',
    },
    {
      kind: 'tf',
      prompt: 'Lot chose the land that looked best.',
      answer: true,
      insight: '“Well watered everywhere… like the garden of Yahweh.” The narrator adds, almost in passing, that it was near Sodom.',
      verse: 'Genesis 13:10',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what God said after Lot had gone.',
      text: 'All the land which you see, I will give to you and to your ___ forever.',
      options: ['offspring', 'people', 'household', 'name'],
      answer: 0,
      insight: 'The promise is repeated immediately after the loss. Abram gave up the best land and was told to look again.',
      verse: 'Genesis 13:15',
    },
  ],

  'genesis-14': [
    {
      kind: 'mcq',
      prompt: 'What did Melchizedek bring out to Abram?',
      options: ['Silver and gold', 'Bread and wine', 'Weapons', 'A written treaty'],
      answer: 1,
      teachingKeyword: 'BREAD AND WINE.',
      insight: 'A priest-king appears from nowhere with bread and wine, blesses Abram, and vanishes from the story. Hebrews spends a chapter on him.',
      verse: 'Genesis 14:18',
    },
    {
      kind: 'tf',
      prompt: 'Abram refused to keep anything belonging to the king of Sodom.',
      answer: true,
      insight: '“Lest you should say, I have made Abram rich.” He will take his wealth from one source or none.',
      verse: 'Genesis 14:23',
    },
    {
      kind: 'tf',
      prompt: 'Abram went to war to rescue Lot.',
      answer: true,
      insight: 'The nephew who chose the better land is fetched back at considerable risk, without comment.',
      verse: 'Genesis 14:14',
    },
  ],

  'matthew-5': [
    {
      kind: 'mcq',
      prompt: 'Who does Jesus call blessed at the opening of the sermon?',
      options: ['The strong', 'The poor in spirit', 'The learned', 'The faithful'],
      answer: 1,
      teachingKeyword: 'BLESSED.',
      insight: 'Every category he names is one nobody would choose — mourning, meekness, hunger, persecution. The list is upside down on purpose.',
      verse: 'Matthew 5:3',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'You are the ___ of the world. A city located on a hill can\u2019t be hidden.',
      options: ['light', 'salt', 'hope', 'leaven'],
      answer: 0,
      insight: 'Said to a crowd of nobodies on a hillside, not to rulers. The claim is about them as they already are.',
      verse: 'Matthew 5:14',
    },
    {
      kind: 'tf',
      prompt: 'Jesus said he came to abolish the Law and the Prophets.',
      answer: false,
      insight: '“Not to destroy, but to fulfil.” He then makes the commands harder rather than lighter.',
      verse: 'Matthew 5:17',
    },
  ],

  'psalms-7': [
    {
      kind: 'mcq',
      prompt: 'How does the psalm describe God as judge?',
      options: ['Distant', 'Righteous, and indignant every day', 'Reluctant', 'Silent'],
      answer: 1,
      insight: 'Judgement is framed as something God cares about daily, not an event at the end.',
      verse: 'Psalm 7:11',
    },
    {
      kind: 'tf',
      prompt: 'The psalmist invites God to examine him and judge if he is guilty.',
      answer: true,
      insight: 'A dangerous prayer. He asks for scrutiny rather than protection from it.',
      verse: 'Psalm 7:3',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the image of trouble rebounding.',
      text: 'He has dug a hole, and has fallen into the ___ which he made.',
      options: ['pit', 'trap', 'ditch', 'snare'],
      answer: 0,
      insight: 'The psalm does not ask for revenge so much as observe that harm tends to come home.',
      verse: 'Psalm 7:15',
    },
  ],

  'proverbs-7': [
    {
      kind: 'mcq',
      prompt: 'How does the chapter tell you to keep its teaching?',
      options: ['Write it down', 'Bind it on your fingers, write it on your heart', 'Recite it daily', 'Teach it to others'],
      answer: 1,
      teachingKeyword: 'ON YOUR HEART.',
      insight: 'Kept close enough to reach for without thinking — which is the whole argument for memorising anything.',
      verse: 'Proverbs 7:3',
    },
    {
      kind: 'tf',
      prompt: 'The young man in the chapter is described as lacking sense.',
      answer: true,
      insight: '“Void of understanding.” The chapter blames his unpreparedness as much as the temptation itself.',
      verse: 'Proverbs 7:7',
    },
    {
      kind: 'tf',
      prompt: 'The chapter watches the scene unfold from a window.',
      answer: true,
      insight: 'An unusual framing — wisdom observing at a distance, letting the reader watch a decision being made badly.',
      verse: 'Proverbs 7:6',
    },
  ],

  // ── SIGNIFICANT CHAPTERS ──────────────────────────────────────
  // Written for the chapters that carry weight wherever they fall in the year,
  // rather than working day by day from the start. Coverage that stops at an
  // arbitrary line leaves the whole rest of the plan bare.

  'genesis-22': [
    {
      kind: 'whosaid',
      quote: 'God will provide himself the lamb for a burnt offering.',
      options: ['Isaac', 'Abraham', 'The angel', 'Sarah'],
      answer: 1,
      teachingKeyword: 'PROVIDE.',
      insight: 'Said walking up the mountain, to the son he had been told to offer. He names the place afterwards “Yahweh will provide”.',
      verse: 'Genesis 22:8',
    },
    {
      kind: 'mcq',
      prompt: 'What stopped Abraham?',
      options: ['Isaac ran', 'A voice from heaven', 'Sarah arrived', 'He changed his mind'],
      answer: 1,
      insight: 'The angel calls his name twice — the same doubling used when God stops someone mid-act.',
      verse: 'Genesis 22:11',
    },
    {
      kind: 'tf',
      prompt: 'A ram was caught in a thicket nearby.',
      answer: true,
      insight: 'Provision that was already there, waiting, while he climbed believing there was none.',
      verse: 'Genesis 22:13',
    },
  ],

  'exodus-3': [
    {
      kind: 'cloze',
      prompt: 'Complete the name God gives.',
      text: 'God said to Moses, “I ___ WHO I AM.”',
      options: ['AM', 'WAS', 'WILL BE', 'SEND'],
      answer: 0,
      teachingKeyword: 'I AM.',
      insight: 'Asked for a name to give slaves, God answers with existence itself. Jesus takes the same words up in John.',
      verse: 'Exodus 3:14',
    },
    {
      kind: 'mcq',
      prompt: 'Why was Moses told to remove his sandals?',
      options: ['The ground was hot', 'He was standing on holy ground', 'It was custom', 'To show poverty'],
      answer: 1,
      insight: 'Ordinary desert made holy by who was standing in it, not by anything about the place.',
      verse: 'Exodus 3:5',
    },
    {
      kind: 'tf',
      prompt: 'God says he has seen the affliction of his people and heard their cry.',
      answer: true,
      insight: 'Seen, heard, and “I know their sorrows”. The rescue begins with attention rather than with power.',
      verse: 'Exodus 3:7',
    },
  ],

  'exodus-12': [
    {
      kind: 'cloze',
      prompt: 'Complete the promise.',
      text: 'When I see the blood, I will ___ over you.',
      options: ['pass', 'watch', 'stand', 'reign'],
      answer: 0,
      teachingKeyword: 'THE BLOOD.',
      insight: 'Not their goodness or their record. The sign on the doorframe is the only thing being looked for.',
      verse: 'Exodus 12:13',
    },
    {
      kind: 'mcq',
      prompt: 'How were they told to eat the meal?',
      options: ['Slowly, reclining', 'Dressed and ready to leave', 'In silence', 'Outdoors'],
      answer: 1,
      insight: 'Belts fastened, sandals on, staff in hand. A meal eaten standing, by people expecting to move.',
      verse: 'Exodus 12:11',
    },
    {
      kind: 'tf',
      prompt: 'The Passover was to be kept as a lasting observance.',
      answer: true,
      insight: 'Kept for three and a half thousand years since. It was the meal Jesus was eating the night he was betrayed.',
      verse: 'Exodus 12:14',
    },
  ],

  'exodus-20': [
    {
      kind: 'mcq',
      prompt: 'How do the Ten Commandments begin?',
      options: ['With a threat', 'With a reminder of rescue from Egypt', 'With a list of rewards', 'With silence'],
      answer: 1,
      teachingKeyword: 'I BROUGHT YOU OUT.',
      insight: 'Rescue first, commands second. They are told who saved them before they are told how to live.',
      verse: 'Exodus 20:2',
    },
    {
      kind: 'type',
      prompt: 'Type the missing word.',
      text: 'Remember the ___ day, to keep it holy.',
      answer: 'sabbath',
      accept: ['sabbath'],
      insight: 'The only command given to a people fresh out of slavery that guarantees them rest.',
      verse: 'Exodus 20:8',
    },
    {
      kind: 'tf',
      prompt: 'The people asked Moses to speak to God on their behalf.',
      answer: true,
      insight: 'They stood at a distance, afraid. The whole later machinery of priesthood begins with that request.',
      verse: 'Exodus 20:19',
    },
  ],

  'psalms-23': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['Yahweh', 'is', 'my', 'shepherd;', 'I', 'shall', 'lack', 'nothing.'],
      teachingKeyword: 'MY SHEPHERD.',
      insight: 'Written by a man who had been a shepherd, and knew exactly how much work the word was doing.',
      verse: 'Psalm 23:1',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Even though I walk through the valley of the shadow of death, I will fear no ___.',
      options: ['evil', 'man', 'darkness', 'end'],
      answer: 0,
      insight: 'Through the valley, not around it. The psalm never promises the valley will be avoided.',
      verse: 'Psalm 23:4',
    },
    {
      kind: 'tf',
      prompt: 'The table is prepared in the presence of enemies.',
      answer: true,
      insight: 'The enemies are still there. What changes is that a meal is laid out in front of them.',
      verse: 'Psalm 23:5',
    },
  ],

  'psalms-51': [
    {
      kind: 'cloze',
      prompt: 'Complete the prayer.',
      text: 'Create in me a clean ___, God. Renew a right spirit within me.',
      options: ['heart', 'mind', 'life', 'way'],
      answer: 0,
      teachingKeyword: 'CREATE.',
      insight: 'The verb is the one used in Genesis 1 — not repair, not clean up. Make something that was not there.',
      verse: 'Psalm 51:10',
    },
    {
      kind: 'mcq',
      prompt: 'What does the psalm say God does not delight in?',
      options: ['Prayer', 'Sacrifice without a broken spirit', 'Music', 'Fasting'],
      answer: 1,
      insight: 'From a king with every resource for offerings, saying the offering is not the point.',
      verse: 'Psalm 51:16',
    },
    {
      kind: 'tf',
      prompt: 'The psalm was written after David was confronted about Bathsheba.',
      answer: true,
      insight: 'The heading says so plainly. Scripture keeps both the failure and the prayer that followed it.',
      verse: 'Psalm 51:1',
    },
  ],

  'isaiah-53': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'He was ___ for our transgressions. He was crushed for our iniquities.',
      options: ['pierced', 'judged', 'broken', 'humbled'],
      answer: 0,
      teachingKeyword: 'FOR OURS.',
      insight: 'The whole chapter turns on the preposition. Not for anything he did.',
      verse: 'Isaiah 53:5',
    },
    {
      kind: 'mcq',
      prompt: 'How is the servant described in appearance?',
      options: ['Radiant', 'Nothing to attract us to him', 'Kingly', 'Terrifying'],
      answer: 1,
      insight: 'No beauty that we should desire him. The prophecy is explicit that he would be easy to overlook.',
      verse: 'Isaiah 53:2',
    },
    {
      kind: 'tf',
      prompt: 'The servant is described as silent before his accusers.',
      answer: true,
      insight: 'As a lamb before its shearers is silent. The Gospels note Pilate’s astonishment at exactly this.',
      verse: 'Isaiah 53:7',
    },
  ],

  'john-3': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['For', 'God', 'so', 'loved', 'the', 'world.'],
      teachingKeyword: 'SO LOVED.',
      insight: 'The best known sentence in the Bible, said at night to a man who came in secret.',
      verse: 'John 3:16',
    },
    {
      kind: 'mcq',
      prompt: 'What did Jesus tell Nicodemus he must do?',
      options: ['Keep the Law better', 'Be born again', 'Leave the council', 'Fast'],
      answer: 1,
      insight: 'Said to a man who had done everything right. Starting over is offered to the one least in need of it.',
      verse: 'John 3:3',
    },
    {
      kind: 'tf',
      prompt: 'Jesus compares himself to the bronze serpent Moses lifted in the wilderness.',
      answer: true,
      insight: 'An odd image to choose — people were healed by looking at the thing that was killing them.',
      verse: 'John 3:14',
    },
  ],

  'joshua-1': [
    {
      kind: 'cloze',
      prompt: 'Complete the command.',
      text: 'Be strong and ___. Don\u2019t be afraid. Yahweh your God is with you wherever you go.',
      options: ['courageous', 'faithful', 'patient', 'ready'],
      answer: 0,
      teachingKeyword: 'WHEREVER.',
      insight: 'Said three times in one chapter to a man taking over from Moses. Repetition is the point.',
      verse: 'Joshua 1:9',
    },
    {
      kind: 'tf',
      prompt: 'Joshua was told to meditate on the book of the law day and night.',
      answer: true,
      insight: 'The first instruction to a military leader is about reading, not strategy.',
      verse: 'Joshua 1:8',
    },
    {
      kind: 'mcq',
      prompt: 'What reason is given for courage?',
      options: ['A strong army', 'God\u2019s presence', 'Good ground', 'Weak enemies'],
      answer: 1,
      insight: 'Not the odds. The whole argument rests on who is going with him.',
      verse: 'Joshua 1:9',
    },
  ],

  '1-samuel-17': [
    {
      kind: 'mcq',
      prompt: 'What did David say he came against Goliath with?',
      options: ['A sword', 'His skill', 'The name of Yahweh', 'His brothers'],
      answer: 2,
      teachingKeyword: 'IN THE NAME.',
      insight: 'He names the mismatch and calls it the wrong way round — the armed man is the one at a disadvantage.',
      verse: '1 Samuel 17:45',
    },
    {
      kind: 'tf',
      prompt: 'David refused Saul\u2019s armour.',
      answer: true,
      insight: 'He had not tested it. He goes with what he knows rather than what looks adequate.',
      verse: '1 Samuel 17:39',
    },
    {
      kind: 'mcq',
      prompt: 'How many stones did David take?',
      options: ['One', 'Three', 'Five', 'Seven'],
      answer: 2,
      insight: 'Five, though he needed one. Confidence and preparation are not opposites.',
      verse: '1 Samuel 17:40',
    },
  ],

  'psalms-90': [
    {
      kind: 'cloze',
      prompt: 'Complete the prayer.',
      text: 'So teach us to ___ our days, that we may gain a heart of wisdom.',
      options: ['number', 'spend', 'fill', 'keep'],
      answer: 0,
      teachingKeyword: 'NUMBER THEM.',
      insight: 'Wisdom framed as arithmetic — knowing the days are finite is what makes them count.',
      verse: 'Psalm 90:12',
    },
    {
      kind: 'tf',
      prompt: 'The psalm is attributed to Moses.',
      answer: true,
      insight: 'The oldest psalm in the book, written by a man who watched a generation die in a wilderness.',
      verse: 'Psalm 90:1',
    },
    {
      kind: 'mcq',
      prompt: 'How does the psalm describe a thousand years to God?',
      options: ['A long age', 'As yesterday when it is past', 'Unknowable', 'A single breath'],
      answer: 1,
      insight: 'Quoted later by Peter. The scale is not cruelty but perspective.',
      verse: 'Psalm 90:4',
    },
  ],

  'psalms-103': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'As far as the east is from the west, so far has he removed our ___ from us.',
      options: ['transgressions', 'sorrows', 'enemies', 'burdens'],
      answer: 0,
      teachingKeyword: 'AS FAR AS.',
      insight: 'North and south have poles and meet. East and west never do — the image was chosen carefully.',
      verse: 'Psalm 103:12',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says God remembers that we are dust.',
      answer: true,
      insight: 'Framed as compassion rather than dismissal: he knows what he is dealing with.',
      verse: 'Psalm 103:14',
    },
    {
      kind: 'mcq',
      prompt: 'How does the psalm open?',
      options: ['With a complaint', 'By telling his own soul to bless God', 'With a question', 'With a vow'],
      answer: 1,
      insight: 'He instructs himself. The psalm is a man talking his own heart into gratitude.',
      verse: 'Psalm 103:1',
    },
  ],

  'psalms-121': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'My help comes from Yahweh, who ___ heaven and earth.',
      options: ['made', 'rules', 'holds', 'sees'],
      answer: 0,
      insight: 'The credential offered is not kindness but capacity — the one who built it can manage it.',
      verse: 'Psalm 121:2',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says the one who keeps you will not slumber.',
      answer: true,
      teachingKeyword: 'WILL NOT SLUMBER.',
      insight: 'Said twice. Every other watchman sleeps eventually.',
      verse: 'Psalm 121:4',
    },
    {
      kind: 'mcq',
      prompt: 'What kind of psalm is it?',
      options: ['A lament', 'A song of ascents', 'A royal psalm', 'A psalm of confession'],
      answer: 1,
      insight: 'Sung by pilgrims walking up to Jerusalem — a travelling song about being kept on a road.',
      verse: 'Psalm 121:1',
    },
  ],

  'psalms-139': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'I will give thanks to you, for I am ___ and wonderfully made.',
      options: ['fearfully', 'carefully', 'newly', 'freely'],
      answer: 0,
      teachingKeyword: 'FEARFULLY MADE.',
      insight: 'Not merely well made. The word carries awe — something to be reckoned with.',
      verse: 'Psalm 139:14',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says there is nowhere you can go from God\u2019s presence.',
      answer: true,
      insight: 'Heaven, the grave, the far side of the sea. Offered as comfort, though it can be read either way.',
      verse: 'Psalm 139:8',
    },
    {
      kind: 'mcq',
      prompt: 'How does the psalm end?',
      options: ['With a curse', 'Asking God to search him', 'In silence', 'With a vow'],
      answer: 1,
      insight: 'A dangerous request from a man who has spent the whole psalm describing how thoroughly he is already known.',
      verse: 'Psalm 139:23',
    },
  ],

  'isaiah-40': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['They', 'will', 'mount', 'up', 'with', 'wings', 'like', 'eagles.'],
      teachingKeyword: 'THOSE WHO WAIT.',
      insight: 'The promise is to those who wait — which is the hardest thing the chapter asks for.',
      verse: 'Isaiah 40:31',
    },
    {
      kind: 'mcq',
      prompt: 'How does the chapter open?',
      options: ['With judgement', 'Comfort my people', 'A warning', 'A genealogy'],
      answer: 1,
      insight: 'After thirty-nine chapters largely of indictment, the tone turns in a single word.',
      verse: 'Isaiah 40:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says the grass withers but the word of God stands forever.',
      answer: true,
      insight: 'Quoted by Peter to a scattered church. What lasts is deliberately contrasted with what does not.',
      verse: 'Isaiah 40:8',
    },
  ],

  'daniel-3': [
    {
      kind: 'whosaid',
      quote: 'But if not, let it be known to you, O king, that we will not serve your gods.',
      options: ['Daniel', 'The three', 'Nebuchadnezzar', 'The satraps'],
      answer: 1,
      teachingKeyword: 'BUT IF NOT.',
      insight: 'Three words that make the whole speech. They believe he can rescue them and refuse either way.',
      verse: 'Daniel 3:18',
    },
    {
      kind: 'tf',
      prompt: 'A fourth figure was seen walking in the furnace.',
      answer: true,
      insight: 'Nebuchadnezzar counts them himself. The rescue is not from the fire but inside it.',
      verse: 'Daniel 3:25',
    },
    {
      kind: 'mcq',
      prompt: 'What was unharmed when they came out?',
      options: ['Only their skin', 'Not even a hair, and no smell of fire', 'Their clothes only', 'Nothing'],
      answer: 1,
      insight: 'The detail about the smell is the one that convinces. Nothing about them had been near a fire.',
      verse: 'Daniel 3:27',
    },
  ],

  'jonah-2': [
    {
      kind: 'cloze',
      prompt: 'Complete the confession.',
      text: '___ belongs to Yahweh.',
      options: ['Salvation', 'Judgement', 'Mercy', 'The sea'],
      answer: 0,
      teachingKeyword: 'BELONGS TO HIM.',
      insight: 'The last line of the prayer, and the reason the book ends the way it does — he cannot choose who receives it.',
      verse: 'Jonah 2:9',
    },
    {
      kind: 'tf',
      prompt: 'Jonah prayed from inside the fish.',
      answer: true,
      insight: 'The prayer is thanksgiving rather than pleading. He speaks as though already rescued.',
      verse: 'Jonah 2:1',
    },
    {
      kind: 'mcq',
      prompt: 'How does Jonah describe where he had gone?',
      options: ['Into exile', 'To the roots of the mountains', 'Into darkness', 'Far from home'],
      answer: 1,
      insight: 'The bottom of the world, with the bars of the earth closed behind him. He is describing death.',
      verse: 'Jonah 2:6',
    },
  ],

  'matthew-6': [
    {
      kind: 'cloze',
      prompt: 'Complete the instruction.',
      text: 'Seek first God\u2019s Kingdom and his ___, and all these things will be given to you as well.',
      options: ['righteousness', 'mercy', 'purposes', 'peace'],
      answer: 0,
      teachingKeyword: 'SEEK FIRST.',
      insight: 'Not instead of. The ordering is the whole instruction.',
      verse: 'Matthew 6:33',
    },
    {
      kind: 'tf',
      prompt: 'Jesus taught that giving and praying should be done privately.',
      answer: true,
      insight: 'In a room with the door shut. The reward he describes is not one an audience could give.',
      verse: 'Matthew 6:6',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter say about tomorrow?',
      options: ['Plan for it', 'It will worry about itself', 'Fear it', 'Ignore it'],
      answer: 1,
      insight: 'Each day has enough trouble of its own — said in the same sermon that teaches asking for daily bread.',
      verse: 'Matthew 6:34',
    },
  ],

  'matthew-28': [
    {
      kind: 'cloze',
      prompt: 'Complete the last sentence of the Gospel.',
      text: 'Behold, I am with you ___, even to the end of the age.',
      options: ['always', 'often', 'again', 'in spirit'],
      answer: 0,
      teachingKeyword: 'WITH YOU.',
      insight: 'The Gospel opens by calling him Immanuel, God with us, and closes on the same promise. The whole book sits between them.',
      verse: 'Matthew 28:20',
    },
    {
      kind: 'mcq',
      prompt: 'Who first found the tomb empty?',
      options: ['Peter', 'The women', 'The guard', 'John'],
      answer: 1,
      insight: 'In a culture where their testimony carried little legal weight. Nobody inventing this would have written it so.',
      verse: 'Matthew 28:1',
    },
    {
      kind: 'tf',
      prompt: 'Some of the disciples still doubted when they saw him.',
      answer: true,
      insight: '“But some doubted.” Three words the writer had no reason to include, and did.',
      verse: 'Matthew 28:17',
    },
  ],

  'luke-15': [
    {
      kind: 'mcq',
      prompt: 'What did the father do when he saw his son far off?',
      options: ['Waited', 'Ran to him', 'Sent a servant', 'Turned away'],
      answer: 1,
      teachingKeyword: 'HE RAN.',
      insight: 'An elderly man in that culture did not run. The undignified detail is the point of the parable.',
      verse: 'Luke 15:20',
    },
    {
      kind: 'tf',
      prompt: 'The chapter holds three parables about something lost.',
      answer: true,
      insight: 'A sheep, a coin, a son — each more valuable, each found, each ending in a party.',
      verse: 'Luke 15:3',
    },
    {
      kind: 'mcq',
      prompt: 'How does the parable of the sons end?',
      options: ['With a feast', 'With the elder brother still outside', 'With a journey', 'With a rebuke'],
      answer: 1,
      insight: 'Unresolved, deliberately. It was told to men standing outside complaining about the company Jesus kept.',
      verse: 'Luke 15:28',
    },
  ],

  'john-1': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['The', 'Word', 'became', 'flesh,', 'and', 'lived', 'among', 'us.'],
      teachingKeyword: 'BECAME FLESH.',
      insight: 'The Greek behind “lived among us” means pitched a tent — the word used of God dwelling with Israel in the wilderness.',
      verse: 'John 1:14',
    },
    {
      kind: 'mcq',
      prompt: 'How does the Gospel of John open?',
      options: ['With a genealogy', 'In the beginning', 'At the baptism', 'With shepherds'],
      answer: 1,
      insight: 'The same three words Genesis opens with. He reaches back past the birth entirely.',
      verse: 'John 1:1',
    },
    {
      kind: 'tf',
      prompt: 'John says the light shines in the darkness and the darkness has not overcome it.',
      answer: true,
      insight: 'Present tense. The shining is described as ongoing rather than finished.',
      verse: 'John 1:5',
    },
  ],

  'john-11': [
    {
      kind: 'wordbank',
      prompt: 'Build the shortest verse in Scripture.',
      answer: ['Jesus', 'wept.'],
      teachingKeyword: 'HE WEPT.',
      insight: 'Standing outside the tomb, minutes before raising him. He grieves a death he is about to undo.',
      verse: 'John 11:35',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what Jesus said to Martha.',
      text: 'I am the ___ and the life.',
      options: ['resurrection', 'way', 'truth', 'beginning'],
      answer: 0,
      insight: 'Said before the miracle, to a woman who had just told him he was too late.',
      verse: 'John 11:25',
    },
    {
      kind: 'tf',
      prompt: 'Jesus deliberately waited two days before going to Lazarus.',
      answer: true,
      insight: 'The text says he loved them, and therefore stayed. The delay is presented as part of the love, not despite it.',
      verse: 'John 11:6',
    },
  ],

  'acts-2': [
    {
      kind: 'tf',
      prompt: 'Each person heard the disciples speaking in their own language.',
      answer: true,
      teachingKeyword: 'IN OUR OWN.',
      insight: 'The exact reverse of Babel. There one language became many to scatter; here many hear one message and gather.',
      verse: 'Acts 2:6',
    },
    {
      kind: 'mcq',
      prompt: 'What appeared over the disciples?',
      options: ['A cloud', 'Tongues like fire', 'A star', 'A dove'],
      answer: 1,
      insight: 'Fire resting on each one separately. What had filled a temple now settles on individual people.',
      verse: 'Acts 2:3',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what the first believers devoted themselves to.',
      text: 'They continued steadfastly in the apostles\u2019 teaching and fellowship, in the ___ of bread, and prayer.',
      options: ['breaking', 'blessing', 'giving', 'sharing'],
      answer: 0,
      insight: 'Four things, two of them simply eating together and talking. The church begins as a household.',
      verse: 'Acts 2:42',
    },
  ],

  'romans-8': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'There is therefore now no ___ to those who are in Christ Jesus.',
      options: ['condemnation', 'judgement', 'accusation', 'fear'],
      answer: 0,
      teachingKeyword: 'NO CONDEMNATION.',
      insight: 'Arriving directly after a chapter describing his own failure at length. The order is the argument.',
      verse: 'Romans 8:1',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter say can separate us from the love of God?',
      options: ['Sin', 'Death', 'Nothing in all creation', 'Time'],
      answer: 2,
      insight: 'He lists everything he can think of — death, life, angels, the present, the future — and rules them all out.',
      verse: 'Romans 8:39',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says the Spirit helps us when we do not know how to pray.',
      answer: true,
      insight: 'Groanings which cannot be uttered. Prayer is described as something done for us as much as by us.',
      verse: 'Romans 8:26',
    },
  ],

  '1-corinthians-13': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Love is ___ and is kind.',
      options: ['patient', 'gentle', 'faithful', 'humble'],
      answer: 0,
      teachingKeyword: 'LOVE IS.',
      insight: 'Every line is a verb or a behaviour. Nowhere is love described as a feeling.',
      verse: '1 Corinthians 13:4',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says gifts without love amount to nothing.',
      answer: true,
      insight: 'Tongues, prophecy, faith to move mountains, giving everything away. Each dismissed in turn.',
      verse: '1 Corinthians 13:2',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter say remains?',
      options: ['Knowledge', 'Faith, hope and love', 'Prophecy', 'The Law'],
      answer: 1,
      insight: 'And the greatest is love — said to a congregation that was arguing about which gifts ranked highest.',
      verse: '1 Corinthians 13:13',
    },
  ],

  'ephesians-2': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For by grace you have been saved through faith — and that not of yourselves; it is the ___ of God.',
      options: ['gift', 'work', 'promise', 'reward'],
      answer: 0,
      teachingKeyword: 'A GIFT.',
      insight: 'The next line closes the door on earning it: not of works, so that no one can boast.',
      verse: 'Ephesians 2:8',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says we are God\u2019s workmanship, created for good works.',
      answer: true,
      insight: 'Works arrive immediately after being ruled out as the means — the result rather than the cause.',
      verse: 'Ephesians 2:10',
    },
    {
      kind: 'mcq',
      prompt: 'What has been broken down between Jew and Gentile?',
      options: ['The Law', 'The dividing wall of hostility', 'The temple', 'The covenant'],
      answer: 1,
      insight: 'A literal wall stood in the temple keeping Gentiles out. Paul says it is gone.',
      verse: 'Ephesians 2:14',
    },
  ],

  'philippians-4': [
    {
      kind: 'cloze',
      prompt: 'Complete the instruction.',
      text: 'In nothing be anxious, but in everything, by prayer and petition with ___, let your requests be made known to God.',
      options: ['thanksgiving', 'patience', 'boldness', 'faith'],
      answer: 0,
      teachingKeyword: 'WITH THANKS.',
      insight: 'Gratitude asked for before the answer comes, which is the difficult part of the instruction.',
      verse: 'Philippians 4:6',
    },
    {
      kind: 'whosaid',
      quote: 'I have learned in whatever state I am, to be content.',
      options: ['Peter', 'Paul', 'James', 'John'],
      answer: 1,
      insight: 'Learned, not felt. He describes it as a skill acquired, and he had been hungry often enough to mean it.',
      verse: 'Philippians 4:11',
    },
    {
      kind: 'tf',
      prompt: 'The letter was written from prison.',
      answer: true,
      insight: 'The letter that says “rejoice always” comes from a man under arrest awaiting a verdict.',
      verse: 'Philippians 1:13',
    },
  ],

  'exodus-14': [
    {
      kind: 'cloze',
      prompt: 'Complete what Moses told the people.',
      text: 'Yahweh will fight for you, and you shall be ___.',
      options: ['still', 'ready', 'brave', 'silent'],
      answer: 0,
      teachingKeyword: 'BE STILL.',
      insight: 'Told to people trapped between an army and a sea. The instruction is to stop moving.',
      verse: 'Exodus 14:14',
    },
    {
      kind: 'tf',
      prompt: 'The people wished they had stayed in Egypt.',
      answer: true,
      insight: 'Days after being freed. The pattern repeats through the whole wilderness.',
      verse: 'Exodus 14:12',
    },
    {
      kind: 'mcq',
      prompt: 'What went between Israel and the Egyptians in the night?',
      options: ['A wall', 'The pillar of cloud', 'A storm', 'The sea'],
      answer: 1,
      insight: 'Darkness to one side, light to the other. The same pillar does both at once.',
      verse: 'Exodus 14:20',
    },
  ],

  'ecclesiastes-3': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'For everything there is a ___, and a time for every purpose under heaven.',
      options: ['season', 'reason', 'place', 'measure'],
      answer: 0,
      teachingKeyword: 'A SEASON.',
      insight: 'The list that follows includes killing and hating. It is not the comfort it is usually quoted as.',
      verse: 'Ecclesiastes 3:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says God has put eternity in human hearts.',
      answer: true,
      insight: 'And that we cannot find out what he has done from beginning to end. Both halves belong together.',
      verse: 'Ecclesiastes 3:11',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter conclude people should do?',
      options: ['Seek wisdom', 'Eat, drink and enjoy their work', 'Store up wealth', 'Withdraw'],
      answer: 1,
      insight: 'An unglamorous answer from a book that has tried everything else and found it empty.',
      verse: 'Ecclesiastes 3:13',
    },
  ],

  'galatians-5': [
    {
      kind: 'mcq',
      prompt: 'What does Paul call the fruit of the Spirit?',
      options: ['Wisdom and power', 'Love, joy, peace, patience and more', 'Faith alone', 'Knowledge'],
      answer: 1,
      teachingKeyword: 'FRUIT.',
      insight: 'Fruit, singular — nine aspects of one thing rather than a list to choose from. And fruit grows; it is not manufactured.',
      verse: 'Galatians 5:22',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For ___ you were called to freedom, brothers.',
      options: ['freedom', 'service', 'holiness', 'peace'],
      answer: 0,
      insight: 'And then immediately: only don’t use your freedom as an occasion for the flesh. The gift comes with its own warning.',
      verse: 'Galatians 5:13',
    },
    {
      kind: 'tf',
      prompt: 'Paul says the whole law is fulfilled in one commandment.',
      answer: true,
      insight: 'Love your neighbour as yourself — written to people arguing about circumcision.',
      verse: 'Galatians 5:14',
    },
  ],

  'colossians-3': [
    {
      kind: 'cloze',
      prompt: 'Complete the instruction.',
      text: 'Whatever you do, work ___, as for the Lord and not for men.',
      options: ['heartily', 'quickly', 'quietly', 'faithfully'],
      answer: 0,
      teachingKeyword: 'AS FOR THE LORD.',
      insight: 'Written in a letter that goes on to address slaves. The audience makes the instruction remarkable.',
      verse: 'Colossians 3:23',
    },
    {
      kind: 'tf',
      prompt: 'The chapter tells readers to clothe themselves with compassion and kindness.',
      answer: true,
      insight: 'Clothing as the image — put on daily, deliberately, and visible to everyone else.',
      verse: 'Colossians 3:12',
    },
    {
      kind: 'mcq',
      prompt: 'What is described as binding everything together?',
      options: ['Faith', 'Love', 'Truth', 'The Spirit'],
      answer: 1,
      insight: 'Put on above all these, love, which is the bond of perfection. The last layer rather than the first.',
      verse: 'Colossians 3:14',
    },
  ],

  'hebrews-11': [
    {
      kind: 'cloze',
      prompt: 'Complete the definition.',
      text: 'Faith is ___ of things hoped for, proof of things not seen.',
      options: ['assurance', 'evidence', 'certainty', 'the promise'],
      answer: 0,
      teachingKeyword: 'NOT SEEN.',
      insight: 'A definition offered before a long list of people who died without receiving what they were promised.',
      verse: 'Hebrews 11:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says these people did not receive what was promised in their lifetimes.',
      answer: true,
      insight: 'They saw it and greeted it from a distance. The chapter counts that as faith rather than failure.',
      verse: 'Hebrews 11:13',
    },
    {
      kind: 'mcq',
      prompt: 'Who is listed among the faithful?',
      options: ['Only prophets', 'Only kings', 'Including Rahab', 'Only priests'],
      answer: 2,
      insight: 'A foreign prostitute, named alongside Abraham and Moses without comment.',
      verse: 'Hebrews 11:31',
    },
  ],

  'james-1': [
    {
      kind: 'cloze',
      prompt: 'Complete the instruction.',
      text: 'Let every man be swift to hear, slow to ___, and slow to anger.',
      options: ['speak', 'judge', 'act', 'leave'],
      answer: 0,
      teachingKeyword: 'SWIFT TO HEAR.',
      insight: 'The whole letter is about the gap between what people say and what they do. It starts here.',
      verse: 'James 1:19',
    },
    {
      kind: 'tf',
      prompt: 'James says to count trials as joy.',
      answer: true,
      insight: 'Not because they are pleasant, but because of what testing produces. The reasoning is given immediately.',
      verse: 'James 1:2',
    },
    {
      kind: 'mcq',
      prompt: 'What does James compare hearing without doing to?',
      options: ['A closed book', 'Forgetting your face in a mirror', 'A locked door', 'An empty field'],
      answer: 1,
      insight: 'You look, you walk away, and immediately you have no idea what you look like.',
      verse: 'James 1:24',
    },
  ],

  'revelation-21': [
    {
      kind: 'cloze',
      prompt: 'Complete the promise.',
      text: 'He will wipe away every ___ from their eyes.',
      options: ['tear', 'fear', 'shadow', 'stain'],
      answer: 0,
      teachingKeyword: 'EVERY TEAR.',
      insight: 'Not that there was nothing to weep about, but that the weeping is attended to personally.',
      verse: 'Revelation 21:4',
    },
    {
      kind: 'tf',
      prompt: 'The book ends with people going up to heaven.',
      answer: false,
      insight: 'It ends with the city coming down. The dwelling of God is with people — the movement is toward earth.',
      verse: 'Revelation 21:3',
    },
    {
      kind: 'whosaid',
      quote: 'Behold, I am making all things new.',
      options: ['The angel', 'John', 'The one seated on the throne', 'The Lamb'],
      answer: 2,
      insight: 'All things new, not all new things. The same creation called good in Genesis 1, remade rather than replaced.',
      verse: 'Revelation 21:5',
    },
  ],

  'psalms-8': [
    {
      kind: 'cloze',
      prompt: 'Complete the question.',
      text: 'What is ___, that you think of him? What is the son of man, that you care for him?',
      options: ['man', 'the earth', 'a king', 'the sea'],
      answer: 0,
      teachingKeyword: 'THAT YOU THINK.',
      insight: 'Asked while looking at the night sky. The scale is meant to make the attention astonishing rather than the person large.',
      verse: 'Psalm 8:4',
    },
    {
      kind: 'tf',
      prompt: 'The psalm opens and closes with the same line.',
      answer: true,
      insight: 'How majestic is your name in all the earth. Everything in between sits inside that frame.',
      verse: 'Psalm 8:1',
    },
    {
      kind: 'mcq',
      prompt: 'From whose mouths does the psalm say praise is established?',
      options: ['Priests', 'Babies and infants', 'Kings', 'The heavens'],
      answer: 1,
      insight: 'Quoted by Jesus in the temple, to men objecting that children were shouting.',
      verse: 'Psalm 8:2',
    },
  ],

  'psalms-19': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'The ___ declare the glory of God. The expanse shows his handiwork.',
      options: ['heavens', 'mountains', 'nations', 'seas'],
      answer: 0,
      teachingKeyword: 'WITHOUT WORDS.',
      insight: 'The psalm says this speech has no words and is heard everywhere. Then it turns, halfway, to the words themselves.',
      verse: 'Psalm 19:1',
    },
    {
      kind: 'tf',
      prompt: 'The psalm compares God\u2019s law to gold and honey.',
      answer: true,
      insight: 'More desirable than much fine gold, sweeter than honey. Value and pleasure, not duty.',
      verse: 'Psalm 19:10',
    },
    {
      kind: 'mcq',
      prompt: 'What does the psalmist ask about at the end?',
      options: ['His enemies', 'Hidden faults', 'His health', 'The future'],
      answer: 1,
      insight: 'Errors he cannot see in himself. Having praised the law for exposing things, he asks it to expose him.',
      verse: 'Psalm 19:12',
    },
  ],

  'psalms-27': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'Yahweh is my light and my ___. Whom shall I fear?',
      options: ['salvation', 'refuge', 'shield', 'strength'],
      answer: 0,
      insight: 'A question rather than a claim. He is arguing himself out of fear rather than reporting he has none.',
      verse: 'Psalm 27:1',
    },
    {
      kind: 'mcq',
      prompt: 'What is the one thing the psalmist asks for?',
      options: ['Victory', 'To dwell in the house of Yahweh', 'Wealth', 'Long life'],
      answer: 1,
      teachingKeyword: 'ONE THING.',
      insight: 'From a man with armies and enemies, the single request is for proximity.',
      verse: 'Psalm 27:4',
    },
    {
      kind: 'tf',
      prompt: 'The psalm ends by telling the reader to wait.',
      answer: true,
      insight: 'Wait for Yahweh. Be strong. Wait — said twice, as though once were not enough.',
      verse: 'Psalm 27:14',
    },
  ],

  'psalms-46': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Be ___, and know that I am God.',
      options: ['still', 'silent', 'humble', 'watchful'],
      answer: 0,
      teachingKeyword: 'BE STILL.',
      insight: 'Spoken in a psalm about mountains falling into the sea and nations raging. Stillness offered inside chaos, not instead of it.',
      verse: 'Psalm 46:10',
    },
    {
      kind: 'mcq',
      prompt: 'How does the psalm describe God?',
      options: ['A distant king', 'A very present help in trouble', 'A judge', 'A watchman'],
      answer: 1,
      insight: 'Present is doing the work. Not available, not willing — already there.',
      verse: 'Psalm 46:1',
    },
    {
      kind: 'tf',
      prompt: 'The psalm inspired the hymn “A Mighty Fortress Is Our God”.',
      answer: true,
      insight: 'Luther’s paraphrase, written in a decade when he had good reason to want a fortress.',
      verse: 'Psalm 46:7',
    },
  ],

  'psalms-91': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'He who dwells in the secret place of the Most High will rest in the ___ of the Almighty.',
      options: ['shadow', 'house', 'light', 'strength'],
      answer: 0,
      insight: 'Shadow implies proximity. You cannot be in someone’s shadow from a distance.',
      verse: 'Psalm 91:1',
    },
    {
      kind: 'tf',
      prompt: 'This psalm was quoted at Jesus during the temptation.',
      answer: true,
      teachingKeyword: 'QUOTED AT HIM.',
      insight: 'The tempter quotes verses 11 and 12 accurately. Scripture can be used correctly and still be used badly.',
      verse: 'Psalm 91:11',
    },
    {
      kind: 'mcq',
      prompt: 'What image is used for shelter?',
      options: ['A tower', 'Feathers and wings', 'A cave', 'A wall'],
      answer: 1,
      insight: 'A bird covering its young — the least martial image available, in a psalm otherwise full of arrows and pestilence.',
      verse: 'Psalm 91:4',
    },
  ],

  'proverbs-16': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'A man\u2019s heart plans his course, but Yahweh directs his ___.',
      options: ['steps', 'days', 'hands', 'ways'],
      answer: 0,
      teachingKeyword: 'HIS STEPS.',
      insight: 'Planning is not discouraged. The chapter simply distinguishes the plan from the walking.',
      verse: 'Proverbs 16:9',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says pride goes before destruction.',
      answer: true,
      insight: 'And a haughty spirit before a fall. Usually quoted as one line; it is two.',
      verse: 'Proverbs 16:18',
    },
    {
      kind: 'mcq',
      prompt: 'What is grey hair called?',
      options: ['A burden', 'A crown of glory', 'A warning', 'A shadow'],
      answer: 1,
      insight: 'If it is found in the way of righteousness. The chapter attaches a condition rather than flattering age itself.',
      verse: 'Proverbs 16:31',
    },
  ],

  'proverbs-31': [
    {
      kind: 'mcq',
      prompt: 'How does the chapter open?',
      options: ['Praising a wife', 'A mother\u2019s instruction to a king', 'A warning', 'A prayer'],
      answer: 1,
      insight: 'The famous portrait is the second half. The first is a queen mother telling her son to speak for those who cannot.',
      verse: 'Proverbs 31:1',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the instruction to the king.',
      text: 'Open your mouth for the ___, in the cause of all who are left desolate.',
      options: ['mute', 'poor', 'weak', 'stranger'],
      answer: 0,
      teachingKeyword: 'FOR THE MUTE.',
      insight: 'Power described as a voice lent to people who have none.',
      verse: 'Proverbs 31:8',
    },
    {
      kind: 'tf',
      prompt: 'The woman described buys a field and plants a vineyard.',
      answer: true,
      insight: 'She trades, negotiates, and makes decisions about property. The passage is commercial before it is domestic.',
      verse: 'Proverbs 31:16',
    },
  ],

  'isaiah-6': [
    {
      kind: 'whosaid',
      quote: 'Here I am. Send me!',
      options: ['Moses', 'Isaiah', 'Samuel', 'Jeremiah'],
      answer: 1,
      teachingKeyword: 'SEND ME.',
      insight: 'Volunteered before he is told the message, which turns out to be one nobody will listen to.',
      verse: 'Isaiah 6:8',
    },
    {
      kind: 'mcq',
      prompt: 'What was Isaiah\u2019s first reaction to the vision?',
      options: ['Joy', 'Ruin — he said he was undone', 'Confusion', 'Silence'],
      answer: 1,
      insight: 'A man of unclean lips among a people of unclean lips. Seeing clearly starts with seeing himself.',
      verse: 'Isaiah 6:5',
    },
    {
      kind: 'tf',
      prompt: 'A coal from the altar touched his lips.',
      answer: true,
      insight: 'The cleansing comes before the commission, and he does not ask for it.',
      verse: 'Isaiah 6:6',
    },
  ],

  'isaiah-55': [
    {
      kind: 'cloze',
      prompt: 'Complete the invitation.',
      text: 'Come, everyone who thirsts, to the waters! Come, buy and eat without ___.',
      options: ['money', 'delay', 'fear', 'labour'],
      answer: 0,
      teachingKeyword: 'WITHOUT MONEY.',
      insight: 'A marketplace invitation with the price removed. He then asks why they spend money on what is not bread.',
      verse: 'Isaiah 55:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says God\u2019s thoughts are not our thoughts.',
      answer: true,
      insight: 'As high as the heavens are above the earth. Offered as reassurance in a passage about mercy.',
      verse: 'Isaiah 55:8',
    },
    {
      kind: 'mcq',
      prompt: 'What is God\u2019s word compared to?',
      options: ['Fire', 'Rain and snow that water the earth', 'A sword', 'A lamp'],
      answer: 1,
      insight: 'It will not return empty. The image is agricultural — slow, and certain.',
      verse: 'Isaiah 55:10',
    },
  ],

  'jeremiah-29': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'For I know the ___ that I have for you, says Yahweh, plans for peace and not for evil.',
      options: ['plans', 'ways', 'words', 'days'],
      answer: 0,
      teachingKeyword: 'IN EXILE.',
      insight: 'Written to people already deported, told to settle down and build houses. The promise is for seventy years later, not for them.',
      verse: 'Jeremiah 29:11',
    },
    {
      kind: 'tf',
      prompt: 'The exiles were told to seek the good of the city that captured them.',
      answer: true,
      insight: 'Pray for Babylon, because in its peace you will have peace. An extraordinary instruction to give prisoners.',
      verse: 'Jeremiah 29:7',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter say about seeking God?',
      options: ['It is difficult', 'You will find him when you search with all your heart', 'Wait to be found', 'Only priests may'],
      answer: 1,
      insight: 'Said to people who had every reason to think they had been abandoned.',
      verse: 'Jeremiah 29:13',
    },
  ],

  'ezekiel-37': [
    {
      kind: 'mcq',
      prompt: 'What was Ezekiel shown in the valley?',
      options: ['A city', 'Very many, very dry bones', 'An army', 'A river'],
      answer: 1,
      teachingKeyword: 'VERY DRY.',
      insight: 'The text stresses how long dead they were. The point is that nothing about them was salvageable.',
      verse: 'Ezekiel 37:2',
    },
    {
      kind: 'whosaid',
      quote: 'Lord Yahweh, you know.',
      options: ['Ezekiel', 'The bones', 'A priest', 'The angel'],
      answer: 0,
      insight: 'His answer to “can these bones live?” — refusing to say no, unable to say yes.',
      verse: 'Ezekiel 37:3',
    },
    {
      kind: 'tf',
      prompt: 'The bones came together before breath entered them.',
      answer: true,
      insight: 'Two stages. Bodies first, standing but lifeless — then breath. The restoration is deliberately not instant.',
      verse: 'Ezekiel 37:8',
    },
  ],

  'daniel-6': [
    {
      kind: 'mcq',
      prompt: 'What did Daniel do when the decree was signed?',
      options: ['Fled', 'Prayed as he always had, three times a day', 'Protested', 'Prayed in secret'],
      answer: 1,
      insight: 'With his windows open toward Jerusalem, exactly as before. He changes nothing, which is the point.',
      verse: 'Daniel 6:10',
    },
    {
      kind: 'tf',
      prompt: 'The king tried to save Daniel.',
      answer: true,
      insight: 'He laboured until sunset to find a way out of his own law, and could not. Power trapped by its own decree.',
      verse: 'Daniel 6:14',
    },
    {
      kind: 'mcq',
      prompt: 'What did the king do that night?',
      options: ['Feasted', 'Fasted and could not sleep', 'Consulted advisors', 'Left the city'],
      answer: 1,
      insight: 'No music, no food, no sleep — then to the den at first light, calling out before he arrives.',
      verse: 'Daniel 6:18',
    },
  ],

  'genesis-37': [
    {
      kind: 'mcq',
      prompt: 'Why did Joseph\u2019s brothers hate him?',
      options: ['He stole', 'Their father favoured him, and he told them his dreams', 'He lied', 'He left'],
      answer: 1,
      insight: 'The coat and the dreams together. He was favoured, and he told them about it.',
      verse: 'Genesis 37:4',
    },
    {
      kind: 'tf',
      prompt: 'One brother tried to save Joseph\u2019s life.',
      answer: true,
      insight: 'Reuben suggests the pit intending to come back for him. He returns to find the pit empty.',
      verse: 'Genesis 37:22',
    },
    {
      kind: 'mcq',
      prompt: 'What did the brothers tell Jacob?',
      options: ['The truth', 'Nothing', 'They showed him the bloodied coat', 'That Joseph ran away'],
      answer: 2,
      teachingKeyword: 'THEY LET HIM.',
      insight: 'They do not lie outright. They show him the coat and let him reach the conclusion himself.',
      verse: 'Genesis 37:32',
    },
  ],

  'genesis-50': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['You', 'meant', 'evil', 'against', 'me,', 'but', 'God', 'meant', 'it', 'for', 'good.'],
      teachingKeyword: 'MEANT IT.',
      insight: 'Said to brothers who sold him, decades later, with power to destroy them. He names the evil plainly and then names something larger.',
      verse: 'Genesis 50:20',
    },
    {
      kind: 'whosaid',
      quote: 'Am I in the place of God?',
      options: ['Pharaoh', 'Jacob', 'Joseph', 'Judah'],
      answer: 2,
      insight: 'His answer to brothers expecting revenge. He refuses a role that was his to take.',
      verse: 'Genesis 50:19',
    },
    {
      kind: 'tf',
      prompt: 'Joseph wept when his brothers spoke to him.',
      answer: true,
      insight: 'They had rehearsed a message from their dead father to protect themselves. That they still feared him is what breaks him.',
      verse: 'Genesis 50:17',
    },
  ],

  'exodus-32': [
    {
      kind: 'mcq',
      prompt: 'What did the people make while Moses was on the mountain?',
      options: ['An altar', 'A golden calf', 'A tent', 'A banner'],
      answer: 1,
      insight: 'Weeks after hearing “you shall have no other gods”. The covenant is broken before the tablets come down.',
      verse: 'Exodus 32:4',
    },
    {
      kind: 'tf',
      prompt: 'Moses pleaded with God on behalf of the people.',
      answer: true,
      teachingKeyword: 'HE STOOD BETWEEN.',
      insight: 'Offered a nation of his own descendants instead, he argues God out of it and asks to be blotted out with them.',
      verse: 'Exodus 32:32',
    },
    {
      kind: 'mcq',
      prompt: 'What did Aaron say when asked how it happened?',
      options: ['He confessed', 'That the calf came out of the fire by itself', 'He blamed Moses', 'Nothing'],
      answer: 1,
      insight: 'One of the least convincing sentences in Scripture, recorded without comment.',
      verse: 'Exodus 32:24',
    },
  ],

  'ruth-1': [
    {
      kind: 'whosaid',
      quote: 'Where you go, I will go. Your people will be my people, and your God my God.',
      options: ['Naomi', 'Ruth', 'Orpah', 'Boaz'],
      answer: 1,
      teachingKeyword: 'YOUR GOD.',
      insight: 'A Moabite widow binding herself to a bitter mother-in-law with nothing to offer. She is later named in Matthew’s genealogy.',
      verse: 'Ruth 1:16',
    },
    {
      kind: 'tf',
      prompt: 'Naomi asked to be called by a different name.',
      answer: true,
      insight: 'Call me Mara — bitter. The book lets her say it without correcting her.',
      verse: 'Ruth 1:20',
    },
    {
      kind: 'mcq',
      prompt: 'Why had the family left Bethlehem?',
      options: ['War', 'Famine', 'Exile', 'Trade'],
      answer: 1,
      insight: 'Bethlehem means house of bread, and they left it because there was none.',
      verse: 'Ruth 1:1',
    },
  ],

  '1-kings-19': [
    {
      kind: 'mcq',
      prompt: 'How did God come to Elijah at the mountain?',
      options: ['In the wind', 'In the earthquake', 'In the fire', 'In a still small voice'],
      answer: 3,
      teachingKeyword: 'A LOW WHISPER.',
      insight: 'Wind, earthquake and fire pass first, and the text says he was not in any of them. To a prophet who had just called down fire.',
      verse: '1 Kings 19:12',
    },
    {
      kind: 'tf',
      prompt: 'Elijah asked to die.',
      answer: true,
      insight: 'Days after his greatest public victory. Scripture puts the collapse immediately after the triumph.',
      verse: '1 Kings 19:4',
    },
    {
      kind: 'mcq',
      prompt: 'What did the angel give him first?',
      options: ['A message', 'Food and sleep', 'A rebuke', 'A new commission'],
      answer: 1,
      insight: 'Twice. Before any conversation about his despair, he is fed and allowed to rest.',
      verse: '1 Kings 19:5',
    },
  ],

  'job-38': [
    {
      kind: 'mcq',
      prompt: 'How does God answer Job?',
      options: ['With explanations', 'With questions', 'With silence', 'With a rebuke of his friends'],
      answer: 1,
      teachingKeyword: 'WHERE WERE YOU?',
      insight: 'Sixty-odd questions and not one answer. Job asked why; he is shown the size of what he was asking about.',
      verse: 'Job 38:4',
    },
    {
      kind: 'tf',
      prompt: 'God speaks to Job out of a whirlwind.',
      answer: true,
      insight: 'Out of the storm — the same kind of weather that killed his children in chapter one.',
      verse: 'Job 38:1',
    },
    {
      kind: 'mcq',
      prompt: 'What does God ask about the morning?',
      options: ['Whether Job made it', 'Whether Job has ever commanded it', 'Where it goes', 'Who names it'],
      answer: 1,
      insight: 'Have you commanded the morning since your days began? The questions are about scale, not blame.',
      verse: 'Job 38:12',
    },
  ],

  'luke-2': [
    {
      kind: 'mcq',
      prompt: 'Who were the first told of the birth?',
      options: ['Priests', 'Shepherds', 'Kings', 'Scribes'],
      answer: 1,
      insight: 'Night-shift labourers on a hillside, in a trade that kept them from the temple. The announcement goes to them first.',
      verse: 'Luke 2:8',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the sign given to the shepherds.',
      text: 'You will find a baby wrapped in strips of cloth, lying in a ___.',
      options: ['manger', 'house', 'stable', 'cradle'],
      answer: 0,
      teachingKeyword: 'A FEEDING TROUGH.',
      insight: 'The sign is not glory but ordinariness — a feeding trough. That is how they will know.',
      verse: 'Luke 2:12',
    },
    {
      kind: 'tf',
      prompt: 'Mary kept these things and pondered them in her heart.',
      answer: true,
      insight: 'Luke says it twice, here and after finding him in the temple. A small window into where he got the story.',
      verse: 'Luke 2:19',
    },
  ],

  'luke-10': [
    {
      kind: 'mcq',
      prompt: 'Who stopped to help the wounded man?',
      options: ['A priest', 'A Levite', 'A Samaritan', 'A merchant'],
      answer: 2,
      teachingKeyword: 'A SAMARITAN.',
      insight: 'The one group his audience despised. Jesus makes the outsider the hero and lets the lawyer say it himself.',
      verse: 'Luke 10:33',
    },
    {
      kind: 'tf',
      prompt: 'The parable answers the question “who is my neighbour?”',
      answer: true,
      insight: 'Though Jesus reverses it — not who qualifies as my neighbour, but which of these was a neighbour.',
      verse: 'Luke 10:36',
    },
    {
      kind: 'mcq',
      prompt: 'What did Jesus say to Martha?',
      options: ['To work harder', 'That Mary had chosen the good part', 'To rest', 'Nothing'],
      answer: 1,
      insight: 'Said gently, and twice by name. The complaint was reasonable; the answer still did not grant it.',
      verse: 'Luke 10:42',
    },
  ],

  'john-13': [
    {
      kind: 'mcq',
      prompt: 'What did Jesus do before the last supper?',
      options: ['Prayed alone', 'Washed the disciples\u2019 feet', 'Taught in the temple', 'Wept'],
      answer: 1,
      teachingKeyword: 'HE WASHED THEM.',
      insight: 'A servant’s job, done knowing the Father had given all things into his hands. John notes both facts in the same sentence.',
      verse: 'John 13:5',
    },
    {
      kind: 'tf',
      prompt: 'Judas was present when his feet were washed.',
      answer: true,
      insight: 'John has already told us what Judas will do. He is washed anyway.',
      verse: 'John 13:11',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the new commandment.',
      text: 'By this everyone will know that you are my disciples, if you have ___ for one another.',
      options: ['love', 'faith', 'peace', 'unity'],
      answer: 0,
      insight: 'Not doctrine, not zeal. The identifying mark he chooses is how they treat each other.',
      verse: 'John 13:35',
    },
  ],

  'john-20': [
    {
      kind: 'mcq',
      prompt: 'How did Mary recognise him?',
      options: ['By his face', 'When he said her name', 'By his hands', 'By his voice singing'],
      answer: 1,
      teachingKeyword: 'MARY.',
      insight: 'She had taken him for the gardener. One word — her name — and she knows.',
      verse: 'John 20:16',
    },
    {
      kind: 'tf',
      prompt: 'Thomas was invited to touch the wounds.',
      answer: true,
      insight: 'Jesus repeats Thomas’s own words back to him, which means he had heard them. The doubt is met rather than scolded.',
      verse: 'John 20:27',
    },
    {
      kind: 'mcq',
      prompt: 'Why does John say he wrote his Gospel?',
      options: ['For the record', 'That you may believe and have life', 'For the church', 'To correct others'],
      answer: 1,
      insight: 'He admits leaving much out. The book is selected rather than complete, and says so.',
      verse: 'John 20:31',
    },
  ],

  '1-corinthians-15': [
    {
      kind: 'mcq',
      prompt: 'What does Paul say if Christ has not been raised?',
      options: ['We are still forgiven', 'Our faith is worthless', 'It changes little', 'We should wait'],
      answer: 1,
      teachingKeyword: 'IF NOT.',
      insight: 'He stakes everything on a single historical claim and says so plainly — if it did not happen, we are to be pitied.',
      verse: '1 Corinthians 15:17',
    },
    {
      kind: 'tf',
      prompt: 'Paul lists people who saw the risen Jesus.',
      answer: true,
      insight: 'Including more than five hundred at once, most of whom, he notes, are still alive. An invitation to go and ask them.',
      verse: '1 Corinthians 15:6',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the taunt.',
      text: 'Death, where is your ___?',
      options: ['sting', 'power', 'throne', 'end'],
      answer: 0,
      insight: 'Quoted from Hosea. The chapter ends by mocking the thing it has spent forty verses taking seriously.',
      verse: '1 Corinthians 15:55',
    },
  ],

  'judges-6': [
    {
      kind: 'mcq',
      prompt: 'How did the angel greet Gideon?',
      options: ['Fearful one', 'Mighty man of valour', 'Servant', 'Son of Joash'],
      answer: 1,
      teachingKeyword: 'MIGHTY MAN.',
      insight: 'Said to a man hiding in a winepress threshing wheat so the Midianites would not find it. He is addressed as what he will be.',
      verse: 'Judges 6:12',
    },
    {
      kind: 'tf',
      prompt: 'Gideon asked for a sign more than once.',
      answer: true,
      insight: 'The fleece, twice, in opposite directions. The book records the hedging without comment.',
      verse: 'Judges 6:39',
    },
    {
      kind: 'mcq',
      prompt: 'What was Gideon\u2019s objection?',
      options: ['He was too old', 'His clan was the weakest and he the least in it', 'He had no weapons', 'He was afraid of his father'],
      answer: 1,
      insight: 'He argues from the bottom up, and the answer is simply: I will be with you.',
      verse: 'Judges 6:15',
    },
  ],

  '1-samuel-3': [
    {
      kind: 'whosaid',
      quote: 'Speak, for your servant hears.',
      options: ['Eli', 'Samuel', 'Saul', 'David'],
      answer: 1,
      teachingKeyword: 'SPEAK.',
      insight: 'A boy who had mistaken the voice three times, taught the answer by an old priest whose own house was being judged.',
      verse: '1 Samuel 3:10',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says the word of Yahweh was rare in those days.',
      answer: true,
      insight: 'There was no frequent vision. The scarcity is stated before the calling, and explains why nobody recognised it.',
      verse: '1 Samuel 3:1',
    },
    {
      kind: 'mcq',
      prompt: 'Who told Samuel it was God calling?',
      options: ['His mother', 'Eli', 'A prophet', 'No one'],
      answer: 1,
      insight: 'Eli works it out on the third attempt, and sends the boy back with the message that will condemn him.',
      verse: '1 Samuel 3:9',
    },
  ],

  '2-kings-5': [
    {
      kind: 'mcq',
      prompt: 'Why was Naaman angry at first?',
      options: ['The price', 'The cure was too ordinary', 'The prophet insulted him', 'The journey'],
      answer: 1,
      teachingKeyword: 'TOO SIMPLE.',
      insight: 'He expected ceremony and got instructions to wash in a muddy river. He nearly went home over it.',
      verse: '2 Kings 5:11',
    },
    {
      kind: 'tf',
      prompt: 'A captured servant girl set the whole story in motion.',
      answer: true,
      insight: 'A slave taken from Israel, telling her mistress about a prophet at home. Unnamed, and the reason any of it happens.',
      verse: '2 Kings 5:2',
    },
    {
      kind: 'mcq',
      prompt: 'Who persuaded Naaman to try?',
      options: ['The king', 'Elisha', 'His servants', 'His wife'],
      answer: 2,
      insight: 'They reason with him: if he had asked something great, you would have done it. Twice in one chapter, servants carry the sense.',
      verse: '2 Kings 5:13',
    },
  ],

  'nehemiah-8': [
    {
      kind: 'mcq',
      prompt: 'What happened when the law was read aloud?',
      options: ['They celebrated', 'They wept', 'They argued', 'They slept'],
      answer: 1,
      insight: 'A whole city weeping at hearing a book. They are then told to stop and go and eat.',
      verse: 'Nehemiah 8:9',
    },
    {
      kind: 'cloze',
      prompt: 'Complete what they were told.',
      text: 'The ___ of Yahweh is your strength.',
      options: ['joy', 'fear', 'word', 'peace'],
      answer: 0,
      teachingKeyword: 'JOY.',
      insight: 'Said to people crying over their own failure, and paired with an instruction to send portions to anyone with nothing prepared.',
      verse: 'Nehemiah 8:10',
    },
    {
      kind: 'tf',
      prompt: 'The readers explained the sense so people could understand it.',
      answer: true,
      insight: 'They gave the sense and caused them to understand — the oldest description of teaching in the book.',
      verse: 'Nehemiah 8:8',
    },
  ],

  'esther-4': [
    {
      kind: 'cloze',
      prompt: 'Complete Mordecai\u2019s question.',
      text: 'Who knows if you haven\u2019t come to the kingdom for such a ___ as this?',
      options: ['time', 'day', 'cause', 'purpose'],
      answer: 0,
      teachingKeyword: 'FOR SUCH A TIME.',
      insight: 'A question rather than an assurance. He does not tell her it will work — only that she may be there for it.',
      verse: 'Esther 4:14',
    },
    {
      kind: 'whosaid',
      quote: 'If I perish, I perish.',
      options: ['Mordecai', 'Esther', 'The king', 'Haman'],
      answer: 1,
      insight: 'Approaching the king uninvited carried a death sentence. She goes having decided the outcome does not change the decision.',
      verse: 'Esther 4:16',
    },
    {
      kind: 'tf',
      prompt: 'God is never named in the book of Esther.',
      answer: true,
      insight: 'Not once, in ten chapters. The book is about providence working entirely out of sight.',
      verse: 'Esther 4:14',
    },
  ],

  'matthew-25': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Inasmuch as you did it to one of the ___ of these my brothers, you did it to me.',
      options: ['least', 'last', 'greatest', 'nearest'],
      answer: 0,
      teachingKeyword: 'TO ME.',
      insight: 'Neither group saw it. Both ask when they had ever seen him hungry — the point is that nobody was keeping score.',
      verse: 'Matthew 25:40',
    },
    {
      kind: 'mcq',
      prompt: 'What did the servant with one talent do?',
      options: ['Traded it', 'Buried it', 'Gave it away', 'Lost it'],
      answer: 1,
      insight: 'Out of fear, which he says plainly. The parable treats caution as the failure.',
      verse: 'Matthew 25:25',
    },
    {
      kind: 'tf',
      prompt: 'The wise bridesmaids shared their oil.',
      answer: false,
      insight: 'They refuse, and the parable does not criticise them for it. Some things cannot be borrowed at the last moment.',
      verse: 'Matthew 25:9',
    },
  ],

  'luke-24': [
    {
      kind: 'mcq',
      prompt: 'When did the travellers recognise him?',
      options: ['On the road', 'When he broke the bread', 'At the tomb', 'When he spoke their names'],
      answer: 1,
      teachingKeyword: 'IN THE BREAKING.',
      insight: 'He had walked and talked with them for hours. It is the ordinary gesture at a table that opens their eyes.',
      verse: 'Luke 24:31',
    },
    {
      kind: 'tf',
      prompt: 'Jesus explained the Scriptures to them on the road.',
      answer: true,
      insight: 'Beginning with Moses and all the prophets. The oldest sermon on the subject, and Luke does not record a word of it.',
      verse: 'Luke 24:27',
    },
    {
      kind: 'mcq',
      prompt: 'What did they say afterwards?',
      options: ['That they were afraid', 'That their hearts burned within them', 'That they doubted', 'Nothing'],
      answer: 1,
      insight: 'Recognised in hindsight. They had felt something on the road and only later knew what it was.',
      verse: 'Luke 24:32',
    },
  ],

  'acts-9': [
    {
      kind: 'mcq',
      prompt: 'What did the voice ask Saul?',
      options: ['Where are you going?', 'Why do you persecute me?', 'Who are you?', 'What do you want?'],
      answer: 1,
      teachingKeyword: 'PERSECUTE ME.',
      insight: 'Not “why do you persecute them”. The question identifies Jesus with the people Saul was arresting.',
      verse: 'Acts 9:4',
    },
    {
      kind: 'tf',
      prompt: 'Ananias argued with God about going to Saul.',
      answer: true,
      insight: 'He points out, reasonably, what this man has done. He goes anyway, and calls him brother.',
      verse: 'Acts 9:13',
    },
    {
      kind: 'mcq',
      prompt: 'How did the disciples first respond to Saul?',
      options: ['With joy', 'They were afraid of him', 'They ignored him', 'They tested him'],
      answer: 1,
      insight: 'They did not believe he was a disciple. Barnabas has to vouch for him before anyone will listen.',
      verse: 'Acts 9:26',
    },
  ],

  'romans-12': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'Don\u2019t be conformed to this world, but be ___ by the renewing of your mind.',
      options: ['transformed', 'separated', 'strengthened', 'guided'],
      answer: 0,
      teachingKeyword: 'TRANSFORMED.',
      insight: 'The word behind it is the one used of the transfiguration. Not adjustment — a change of form.',
      verse: 'Romans 12:2',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says to bless those who persecute you.',
      answer: true,
      insight: 'And then, in case it was ambiguous: bless, and do not curse.',
      verse: 'Romans 12:14',
    },
    {
      kind: 'mcq',
      prompt: 'What is offered as \u201cyour spiritual service\u201d?',
      options: ['Prayer', 'Presenting your bodies as a living sacrifice', 'Giving', 'Teaching'],
      answer: 1,
      insight: 'A living sacrifice — the one kind that can climb back off the altar. Which is rather the difficulty.',
      verse: 'Romans 12:1',
    },
  ],

  'philippians-2': [
    {
      kind: 'mcq',
      prompt: 'What did Christ do with equality with God?',
      options: ['Held it', 'Did not consider it something to be grasped', 'Hid it', 'Shared it'],
      answer: 1,
      teachingKeyword: 'EMPTIED HIMSELF.',
      insight: 'The passage is probably an early hymn Paul is quoting. The movement is all downward until the last verses.',
      verse: 'Philippians 2:6',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says to regard others as more important than yourselves.',
      answer: true,
      insight: 'Written to a congregation with two women in a public disagreement, named later in the letter.',
      verse: 'Philippians 2:3',
    },
    {
      kind: 'mcq',
      prompt: 'How far down does the passage say he went?',
      options: ['To poverty', 'To death, even the death of the cross', 'To exile', 'To silence'],
      answer: 1,
      insight: 'The phrase “even the death of the cross” reads like something added for emphasis. It is the bottom of the descent.',
      verse: 'Philippians 2:8',
    },
  ],

  '1-john-4': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'There is no fear in love; but perfect love casts out ___.',
      options: ['fear', 'doubt', 'shame', 'anger'],
      answer: 0,
      teachingKeyword: 'CASTS IT OUT.',
      insight: 'Not manages or reduces. The two are described as unable to occupy the same space.',
      verse: '1 John 4:18',
    },
    {
      kind: 'tf',
      prompt: 'The chapter says we love because he first loved us.',
      answer: true,
      insight: 'The order matters to John. Ours is a response rather than an initiative.',
      verse: '1 John 4:19',
    },
    {
      kind: 'mcq',
      prompt: 'What test does John give for loving God?',
      options: ['Prayer', 'Whether you love your brother', 'Knowledge', 'Endurance'],
      answer: 1,
      insight: 'He is blunt about it: anyone who does not love the brother he has seen cannot love the God he has not.',
      verse: '1 John 4:20',
    },
  ],

  'job-1': [
    {
      kind: 'whosaid',
      quote: 'Yahweh gave, and Yahweh has taken away. Blessed be Yahweh\u2019s name.',
      options: ['Job', 'His wife', 'Eliphaz', 'The messenger'],
      answer: 0,
      teachingKeyword: 'BLESSED BE.',
      insight: 'Said on the day he lost everything, having torn his robe and shaved his head first. Grief and worship in the same paragraph.',
      verse: 'Job 1:21',
    },
    {
      kind: 'tf',
      prompt: 'Job did not know about the conversation in heaven.',
      answer: true,
      insight: 'The reader is told and Job never is. He argues for thirty-five chapters without the information we were given in the first.',
      verse: 'Job 1:12',
    },
    {
      kind: 'mcq',
      prompt: 'How do the disasters arrive?',
      options: ['Over years', 'One messenger after another, on the same day', 'In a dream', 'After a warning'],
      answer: 1,
      insight: 'Each one begins before the last has finished speaking. The pacing is the cruelty.',
      verse: 'Job 1:16',
    },
  ],

  'job-42': [
    {
      kind: 'cloze',
      prompt: 'Complete what Job says at the end.',
      text: 'I had heard of you by the hearing of the ear, but now my ___ sees you.',
      options: ['eye', 'heart', 'soul', 'mind'],
      answer: 0,
      teachingKeyword: 'NOW I SEE.',
      insight: 'He never receives an answer to his question. What changes is that he has met the one he was asking.',
      verse: 'Job 42:5',
    },
    {
      kind: 'tf',
      prompt: 'God rebukes Job\u2019s friends.',
      answer: true,
      insight: 'For not speaking rightly of him — the men who defended God are corrected, and Job, who argued, is not.',
      verse: 'Job 42:7',
    },
    {
      kind: 'mcq',
      prompt: 'What was Job asked to do for his friends?',
      options: ['Forgive them', 'Pray for them', 'Rebuke them', 'Send them away'],
      answer: 1,
      insight: 'His own restoration begins while he is praying for the people who spent the book accusing him.',
      verse: 'Job 42:10',
    },
  ],

  'hosea-11': [
    {
      kind: 'mcq',
      prompt: 'How does God describe caring for Israel?',
      options: ['As a king', 'As a parent teaching a child to walk', 'As a judge', 'As a shepherd'],
      answer: 1,
      teachingKeyword: 'I TAUGHT HIM.',
      insight: 'Taking them by the arms, bending down to feed them. The tenderest image in the prophets, in a book about betrayal.',
      verse: 'Hosea 11:3',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the verse Matthew later quotes.',
      text: 'Out of ___ I called my son.',
      options: ['Egypt', 'exile', 'darkness', 'Judah'],
      answer: 0,
      insight: 'Originally about Israel leaving slavery. Matthew reads Jesus as walking his people’s history again.',
      verse: 'Hosea 11:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter has God turning back from judgement.',
      answer: true,
      insight: '“My heart is turned within me.” The judgement is announced and then withdrawn mid-sentence.',
      verse: 'Hosea 11:8',
    },
  ],

  'micah-6': [
    {
      kind: 'cloze',
      prompt: 'Complete the requirement.',
      text: 'To act ___, to love mercy, and to walk humbly with your God.',
      options: ['justly', 'wisely', 'gently', 'faithfully'],
      answer: 0,
      teachingKeyword: 'THREE THINGS.',
      insight: 'Asked after a passage listing ever more extravagant offerings. The answer is smaller and much harder.',
      verse: 'Micah 6:8',
    },
    {
      kind: 'tf',
      prompt: 'The chapter is framed as a legal case.',
      answer: true,
      insight: 'The mountains are called as witnesses, and God asks what he has done to weary them.',
      verse: 'Micah 6:2',
    },
    {
      kind: 'mcq',
      prompt: 'What escalating offerings does the chapter mention?',
      options: ['Grain and oil', 'Thousands of rams, rivers of oil, a firstborn child', 'Gold', 'Silence'],
      answer: 1,
      insight: 'The list runs to the unthinkable, and then the answer arrives as an anticlimax on purpose.',
      verse: 'Micah 6:7',
    },
  ],

  'habakkuk-3': [
    {
      kind: 'cloze',
      prompt: 'Complete the ending.',
      text: 'Though the fig tree doesn\u2019t flourish… yet I will ___ in Yahweh.',
      options: ['rejoice', 'trust', 'wait', 'hope'],
      answer: 0,
      teachingKeyword: 'YET I WILL.',
      insight: 'A list of everything failing at once — crops, flocks, harvest — and then the conjunction that carries the whole book.',
      verse: 'Habakkuk 3:17',
    },
    {
      kind: 'tf',
      prompt: 'The book begins with the prophet complaining to God.',
      answer: true,
      insight: 'How long shall I cry, and you will not hear? The complaint is preserved rather than answered.',
      verse: 'Habakkuk 1:2',
    },
    {
      kind: 'mcq',
      prompt: 'What does the prophet ask God to remember?',
      options: ['His promises', 'Mercy, in the midst of wrath', 'His people\u2019s suffering', 'The covenant'],
      answer: 1,
      insight: 'In wrath, remember mercy — four words asking for one thing to survive inside another.',
      verse: 'Habakkuk 3:2',
    },
  ],

  'matthew-13': [
    {
      kind: 'mcq',
      prompt: 'What happened to the seed on good ground?',
      options: ['It withered', 'It was eaten', 'It produced a crop', 'It was choked'],
      answer: 2,
      insight: 'A hundred, sixty, thirty times over. The parable expects most of the sowing to fail and sows anyway.',
      verse: 'Matthew 13:8',
    },
    {
      kind: 'tf',
      prompt: 'The wheat and weeds were to be separated immediately.',
      answer: false,
      teachingKeyword: 'LET BOTH GROW.',
      insight: 'Pulling the weeds would uproot the wheat. Patience is commanded rather than tolerated.',
      verse: 'Matthew 13:29',
    },
    {
      kind: 'mcq',
      prompt: 'What is the kingdom compared to in the field?',
      options: ['A crown', 'Treasure a man reburies and sells everything to buy', 'A road', 'A city'],
      answer: 1,
      insight: 'And he does it for joy. The selling of everything is not presented as a sacrifice.',
      verse: 'Matthew 13:44',
    },
  ],

  'john-15': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'I am the vine. You are the branches… apart from me you can do ___.',
      options: ['nothing', 'little', 'no good', 'no lasting work'],
      answer: 0,
      teachingKeyword: 'REMAIN.',
      insight: 'The instruction is not to try harder but to stay attached. Fruit is what happens, not what is achieved.',
      verse: 'John 15:5',
    },
    {
      kind: 'tf',
      prompt: 'Jesus calls the disciples friends rather than servants.',
      answer: true,
      insight: 'Because a servant does not know what his master is doing. The distinction he draws is about being told things.',
      verse: 'John 15:15',
    },
    {
      kind: 'mcq',
      prompt: 'What does the gardener do to fruitful branches?',
      options: ['Leaves them', 'Prunes them', 'Ties them', 'Moves them'],
      answer: 1,
      insight: 'Cutting back what is working, so it works more. The chapter does not soften what that feels like.',
      verse: 'John 15:2',
    },
  ],

  'hebrews-12': [
    {
      kind: 'cloze',
      prompt: 'Complete the instruction.',
      text: 'Let\u2019s run with patience the race that is set before us, looking to ___.',
      options: ['Jesus', 'the prize', 'the end', 'heaven'],
      answer: 0,
      teachingKeyword: 'LAY IT ASIDE.',
      insight: 'Runners are told to put down every weight — including things that are not sins, merely heavy.',
      verse: 'Hebrews 12:1',
    },
    {
      kind: 'tf',
      prompt: 'The chapter describes a great cloud of witnesses.',
      answer: true,
      insight: 'The people listed in chapter eleven, none of whom received what was promised, watching those who might.',
      verse: 'Hebrews 12:1',
    },
    {
      kind: 'mcq',
      prompt: 'How is discipline described?',
      options: ['As punishment', 'As evidence of being a son', 'As a warning', 'As rare'],
      answer: 1,
      insight: 'The argument is uncomfortable and honest: it is painful at the time, and not pleasant.',
      verse: 'Hebrews 12:7',
    },
  ],

  '1-peter-1': [
    {
      kind: 'mcq',
      prompt: 'How does Peter describe trials?',
      options: ['Meaningless', 'Like fire testing gold', 'Deserved', 'Brief'],
      answer: 1,
      insight: 'Gold perishes even after refining; he says faith is worth more. Written to people scattered by persecution.',
      verse: '1 Peter 1:7',
    },
    {
      kind: 'tf',
      prompt: 'Peter says they love someone they have not seen.',
      answer: true,
      teachingKeyword: 'NOT SEEN.',
      insight: 'From a man who had seen him. He does not present his own eyewitness as the better position.',
      verse: '1 Peter 1:8',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the contrast.',
      text: 'All flesh is like grass… but the ___ of the Lord endures forever.',
      options: ['word', 'love', 'promise', 'name'],
      answer: 0,
      insight: 'Quoting Isaiah 40 to a church losing everything — the same passage, put to work six centuries later.',
      verse: '1 Peter 1:24',
    },
  ],

  'revelation-5': [
    {
      kind: 'mcq',
      prompt: 'What did John see when he turned to look at the Lion?',
      options: ['A throne', 'A Lamb, standing as though slain', 'An angel', 'A scroll'],
      answer: 1,
      teachingKeyword: 'A LAMB.',
      insight: 'He is told to look at a Lion and sees a slaughtered Lamb. The image swaps and never swaps back.',
      verse: 'Revelation 5:6',
    },
    {
      kind: 'tf',
      prompt: 'John wept because no one could open the scroll.',
      answer: true,
      insight: 'He weeps much, the text says. The pause before the answer is allowed to be genuinely bleak.',
      verse: 'Revelation 5:4',
    },
    {
      kind: 'mcq',
      prompt: 'Who is included in the song?',
      options: ['Israel', 'Every tribe, language, people and nation', 'The apostles', 'The angels only'],
      answer: 1,
      insight: 'The reach named at the call of Abraham, arriving at the end of the book as a completed fact.',
      verse: 'Revelation 5:9',
    },
  ],

  'psalms-34': [
    {
      kind: 'cloze',
      prompt: 'Complete the invitation.',
      text: 'Oh ___ and see that Yahweh is good.',
      options: ['taste', 'come', 'wait', 'listen'],
      answer: 0,
      teachingKeyword: 'TASTE.',
      insight: 'An invitation to try rather than to agree. The psalm asks for experiment, not assent.',
      verse: 'Psalm 34:8',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says God is near to the brokenhearted.',
      answer: true,
      insight: 'And saves those crushed in spirit. Nearness offered as the response to being broken, not to being strong.',
      verse: 'Psalm 34:18',
    },
    {
      kind: 'mcq',
      prompt: 'What circumstance is the psalm attached to?',
      options: ['A coronation', 'David feigning madness to escape a king', 'A battle', 'A festival'],
      answer: 1,
      insight: 'Written out of a humiliating escape. The heading keeps the undignified detail.',
      verse: 'Psalm 34:1',
    },
  ],

  'psalms-42': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'As the deer pants for the water brooks, so my soul ___ after you.',
      options: ['pants', 'cries', 'reaches', 'waits'],
      answer: 0,
      insight: 'Thirst rather than devotion. The image is an animal in distress, not a worshipper at ease.',
      verse: 'Psalm 42:1',
    },
    {
      kind: 'tf',
      prompt: 'The psalmist speaks to his own soul.',
      answer: true,
      teachingKeyword: 'WHY, MY SOUL?',
      insight: 'Why are you in despair? He interrogates himself, twice, and both times answers with hope he does not yet feel.',
      verse: 'Psalm 42:5',
    },
    {
      kind: 'mcq',
      prompt: 'What does he remember?',
      options: ['His victories', 'Going to the house of God with the crowd', 'His youth', 'His enemies'],
      answer: 1,
      insight: 'The memory makes it worse before it helps. Grief here is being cut off from something he had.',
      verse: 'Psalm 42:4',
    },
  ],

  'psalms-130': [
    {
      kind: 'cloze',
      prompt: 'Complete the opening.',
      text: 'Out of the ___ I have cried to you, Yahweh.',
      options: ['depths', 'darkness', 'dust', 'grave'],
      answer: 0,
      teachingKeyword: 'OUT OF THE DEPTHS.',
      insight: 'No introduction and no setting. The psalm begins already at the bottom.',
      verse: 'Psalm 130:1',
    },
    {
      kind: 'tf',
      prompt: 'The psalm says that if God kept a record of sins, no one could stand.',
      answer: true,
      insight: 'Then, immediately: but there is forgiveness with you, that you may be feared. Mercy as the reason for awe.',
      verse: 'Psalm 130:3',
    },
    {
      kind: 'mcq',
      prompt: 'What image is used for waiting?',
      options: ['A traveller', 'Watchmen waiting for the morning', 'A farmer', 'A child'],
      answer: 1,
      insight: 'More than watchmen for the morning — said twice. People whose whole job is waiting for a light that always comes.',
      verse: 'Psalm 130:6',
    },
  ],

  'psalms-150': [
    {
      kind: 'mcq',
      prompt: 'How does the book of Psalms end?',
      options: ['With a lament', 'With everything that breathes praising', 'With a warning', 'With a prayer'],
      answer: 1,
      teachingKeyword: 'EVERYTHING.',
      insight: 'After a hundred and fifty psalms including some of the bleakest words in Scripture, the collection ends with instruments and breath.',
      verse: 'Psalm 150:6',
    },
    {
      kind: 'tf',
      prompt: 'The psalm lists musical instruments.',
      answer: true,
      insight: 'Trumpet, harp, tambourine, strings, pipe, cymbals — loud ones, and then louder ones.',
      verse: 'Psalm 150:3',
    },
    {
      kind: 'mcq',
      prompt: 'What is the only qualification given?',
      options: ['Being righteous', 'Having breath', 'Being Israelite', 'Being a priest'],
      answer: 1,
      insight: 'Let everything that has breath praise Yahweh. The entry requirement is being alive.',
      verse: 'Psalm 150:6',
    },
  ],

  'matthew-18': [
    {
      kind: 'mcq',
      prompt: 'How often did Jesus say to forgive?',
      options: ['Seven times', 'Seventy times seven', 'Three times', 'Once'],
      answer: 1,
      teachingKeyword: 'SEVENTY TIMES.',
      insight: 'Peter offers seven thinking it generous. The answer is a number large enough to stop anyone counting.',
      verse: 'Matthew 18:22',
    },
    {
      kind: 'tf',
      prompt: 'The forgiven servant then refused to forgive a smaller debt.',
      answer: true,
      insight: 'The sums are deliberately absurd — a lifetime’s wages against a few months’. The parable is about proportion.',
      verse: 'Matthew 18:28',
    },
    {
      kind: 'mcq',
      prompt: 'What does the shepherd do about one lost sheep?',
      options: ['Counts the loss', 'Leaves the ninety-nine to look', 'Waits', 'Sends another'],
      answer: 1,
      insight: 'Poor arithmetic, deliberately. The chapter is arguing that the maths is not the point.',
      verse: 'Matthew 18:12',
    },
  ],

  'mark-10': [
    {
      kind: 'mcq',
      prompt: 'What did Jesus tell the rich young man?',
      options: ['To pray more', 'To sell what he had and follow', 'To keep the law', 'To wait'],
      answer: 1,
      insight: 'Mark adds a detail the others leave out: Jesus looked at him and loved him. The hard word comes from affection.',
      verse: 'Mark 10:21',
    },
    {
      kind: 'tf',
      prompt: 'Jesus was indignant when the disciples turned children away.',
      answer: true,
      teachingKeyword: 'LET THEM COME.',
      insight: 'The word is strong. Of the few times Mark records him angry, this is one.',
      verse: 'Mark 10:14',
    },
    {
      kind: 'mcq',
      prompt: 'What did Jesus ask blind Bartimaeus?',
      options: ['Do you believe?', 'What do you want me to do for you?', 'Who sent you?', 'Why are you here?'],
      answer: 1,
      insight: 'The same question he had just asked James and John, who wanted thrones. Bartimaeus asks to see.',
      verse: 'Mark 10:51',
    },
  ],

  'john-17': [
    {
      kind: 'mcq',
      prompt: 'What does Jesus pray for his followers?',
      options: ['Success', 'That they may be one', 'Comfort', 'Wisdom'],
      answer: 1,
      teachingKeyword: 'THAT THEY MAY BE ONE.',
      insight: 'Prayed hours before his arrest, for people who were about to abandon him — and for everyone who would believe through them.',
      verse: 'John 17:21',
    },
    {
      kind: 'tf',
      prompt: 'Jesus prays that they be taken out of the world.',
      answer: false,
      insight: 'Not that you take them from the world, but that you keep them from the evil one. Withdrawal is specifically not asked for.',
      verse: 'John 17:15',
    },
    {
      kind: 'mcq',
      prompt: 'How does he define eternal life?',
      options: ['Endless duration', 'Knowing God and the one he sent', 'A place', 'A reward'],
      answer: 1,
      insight: 'Relationship rather than length. The definition is given inside a prayer rather than a sermon.',
      verse: 'John 17:3',
    },
  ],

  'acts-17': [
    {
      kind: 'mcq',
      prompt: 'What did Paul use as his starting point in Athens?',
      options: ['The Law', 'An altar to an unknown god', 'A miracle', 'The synagogue'],
      answer: 1,
      teachingKeyword: 'UNKNOWN.',
      insight: 'He begins with something they built, and quotes their own poets rather than Scripture they had never read.',
      verse: 'Acts 17:23',
    },
    {
      kind: 'tf',
      prompt: 'The Bereans checked the Scriptures daily to test what they were told.',
      answer: true,
      insight: 'Luke calls them more noble for it. Verifying the preacher is presented as a compliment.',
      verse: 'Acts 17:11',
    },
    {
      kind: 'mcq',
      prompt: 'How did the Athenians respond?',
      options: ['All believed', 'Some mocked, some wanted to hear more, some believed', 'All rejected it', 'They arrested him'],
      answer: 1,
      insight: 'A mixed result, recorded without embarrassment. Not every sermon in Acts ends in three thousand converts.',
      verse: 'Acts 17:32',
    },
  ],

  '2-corinthians-5': [
    {
      kind: 'cloze',
      prompt: 'Complete the verse.',
      text: 'If anyone is in Christ, he is a new ___. The old things have passed away.',
      options: ['creation', 'person', 'man', 'beginning'],
      answer: 0,
      teachingKeyword: 'NEW CREATION.',
      insight: 'The word is the one used of Genesis. Paul reaches for the largest available term rather than a smaller one.',
      verse: '2 Corinthians 5:17',
    },
    {
      kind: 'tf',
      prompt: 'Paul calls believers ambassadors.',
      answer: true,
      insight: 'As though God were making his appeal through us — a startling thing to say about ordinary people.',
      verse: '2 Corinthians 5:20',
    },
    {
      kind: 'mcq',
      prompt: 'What does the chapter say we walk by?',
      options: ['Sight', 'Faith', 'Law', 'Wisdom'],
      answer: 1,
      insight: 'Written by a man who had been shipwrecked, beaten and imprisoned. He is not describing an easy confidence.',
      verse: '2 Corinthians 5:7',
    },
  ],

  'ephesians-6': [
    {
      kind: 'mcq',
      prompt: 'What is the struggle described as being against?',
      options: ['Rome', 'Flesh and blood', 'Not flesh and blood, but spiritual forces', 'False teachers'],
      answer: 2,
      insight: 'Written from prison, by a man with obvious human enemies, saying they are not the real ones.',
      verse: 'Ephesians 6:12',
    },
    {
      kind: 'tf',
      prompt: 'The armour described is entirely defensive.',
      answer: false,
      teachingKeyword: 'ONE WEAPON.',
      insight: 'Belt, breastplate, shoes, shield, helmet — and one thing to attack with: the sword of the Spirit, which is the word of God.',
      verse: 'Ephesians 6:17',
    },
    {
      kind: 'mcq',
      prompt: 'What does the passage say to do having done everything?',
      options: ['Advance', 'Stand', 'Rest', 'Return'],
      answer: 1,
      insight: 'Stand — said four times in as many verses. Holding ground rather than taking it.',
      verse: 'Ephesians 6:13',
    },
  ],

  'james-2': [
    {
      kind: 'mcq',
      prompt: 'What does James say about faith without works?',
      options: ['It is enough', 'It is dead', 'It is rare', 'It is hidden'],
      answer: 1,
      teachingKeyword: 'SHOW ME.',
      insight: 'Show me your faith without works, and I will show you my faith by my works. He is asking for evidence, not payment.',
      verse: 'James 2:18',
    },
    {
      kind: 'tf',
      prompt: 'The chapter warns against favouring the rich in the assembly.',
      answer: true,
      insight: 'A specific scene: a man in fine clothes given a seat, a poor man told to stand. He calls it becoming judges with evil thoughts.',
      verse: 'James 2:3',
    },
    {
      kind: 'mcq',
      prompt: 'What does he call the royal law?',
      options: ['Honour the king', 'Love your neighbour as yourself', 'Keep the Sabbath', 'Do not steal'],
      answer: 1,
      insight: 'The same command Jesus paired with loving God, put to work here as a test of impartiality.',
      verse: 'James 2:8',
    },
  ],

  'revelation-3': [
    {
      kind: 'wordbank',
      prompt: 'Build the verse.',
      answer: ['Behold,', 'I', 'stand', 'at', 'the', 'door', 'and', 'knock.'],
      teachingKeyword: 'AND KNOCK.',
      insight: 'Written to a church, not to outsiders — the one being asked to open is already inside.',
      verse: 'Revelation 3:20',
    },
    {
      kind: 'mcq',
      prompt: 'What is said to the church at Laodicea?',
      options: ['They are faithful', 'They are lukewarm', 'They are persecuted', 'They are poor'],
      answer: 1,
      insight: 'The city was known for water that arrived neither hot nor cold. The insult was local and would have landed.',
      verse: 'Revelation 3:16',
    },
    {
      kind: 'tf',
      prompt: 'The church that thought itself rich was told it was poor.',
      answer: true,
      insight: 'Wretched, miserable, poor, blind and naked — said to people who had just described themselves as needing nothing.',
      verse: 'Revelation 3:17',
    },
  ],
};

/** Whether a chapter has questions — most do not, and that is deliberate. */
export const hasChapterQuestions = (chapter: string): boolean =>
  chapter in CHAPTER_QUESTIONS;

/**
 * TOPIC INTRODUCTIONS
 *
 * Shown once, before a topic is first opened — not on every replay, which
 * would turn anticipation into an obstacle.
 *
 * “You will discover” names themes rather than answers. It should make someone
 * curious about what is coming without giving away the questions.
 */
export const TOPIC_INTRO: Record<
  string,
  { range: string; line: string; discover: string[] }
> = {
  creation: {
    range: 'Genesis 1–2',
    line: 'Everything begins with speech, and ends with rest.',
    discover: ['order out of formlessness', 'the image of God', 'the first “not good”', 'a day set apart'],
  },
  'the-fall': {
    range: 'Genesis 3',
    line: 'A question, then a lie, then a world that has to be lived in differently.',
    discover: ['how doubt precedes denial', 'blame passed along', 'a promise inside a curse', 'the first covering'],
  },
  noah: {
    range: 'Genesis 6–9',
    line: 'Judgement and mercy arrive in the same story, and neither cancels the other.',
    discover: ['grace before righteousness', 'a God who grieves', 'the door shut from outside', 'a weapon hung up'],
  },
  abraham: {
    range: 'Genesis 12–22',
    line: 'One man is called, and the promise reaches every family on earth.',
    discover: ['leaving without a destination', 'faith counted as righteousness', 'twenty-five years of waiting', 'a mountain named for provision'],
  },
  joseph: {
    range: 'Genesis 37–50',
    line: 'Betrayed, enslaved, imprisoned, and none of it wasted.',
    discover: ['favouritism and its cost', 'integrity that is punished', 'power without revenge', 'evil meant for good'],
  },
  moses: {
    range: 'Exodus 3–16',
    line: 'A reluctant man, an unpronounceable name, and a people brought out.',
    discover: ['fire that consumes nothing', 'I AM', 'blood on the doorframe', 'bread that cannot be stored'],
  },
  'the-law': {
    range: 'Exodus 20 – Deuteronomy 6',
    line: 'Rescue comes first. The commands come to people already saved.',
    discover: ['why the order matters', 'rest as a right', 'the poor and the stranger', 'a covenant broken at the foot of the mountain'],
  },
  david: {
    range: '1 Samuel 16 – 2 Samuel 12',
    line: 'A shepherd, a king, an adulterer, and a psalm written afterwards.',
    discover: ['what God looks at', 'refusing the shortcut to a throne', 'confession without excuse', 'a promise that outlives the dynasty'],
  },
  isaiah: {
    range: 'Isaiah 1–53',
    line: 'Seven centuries early, and unmistakably about someone.',
    discover: ['a volunteer for an impossible message', 'God with us', 'a servant nobody wanted', 'scarlet made white'],
  },
  birth: {
    range: 'Matthew 1 – Luke 2',
    line: 'The announcement goes first to the people least likely to be told.',
    discover: ['a name that is a job description', 'shepherds before priests', 'a young woman’s answer', 'the Word pitching a tent'],
  },
  ministry: {
    range: 'Matthew 5 – John 14',
    line: 'Three years of stories, arguments, meals and impossible instructions.',
    discover: ['two commands that cannot be separated', 'rest offered to the burdened', 'greatness redefined', 'the bread of life'],
  },
  miracles: {
    range: 'Mark 4 – John 11',
    line: 'Signs that point somewhere, done mostly for people nobody was watching.',
    discover: ['a wedding saved from embarrassment', 'a storm spoken to', 'faith credited to the one who had it', 'grief before a resurrection'],
  },
  cross: {
    range: 'Matthew 27–28 – John 19',
    line: 'The worst day, and then the morning nobody expected.',
    discover: ['forgiveness prayed mid-execution', 'a curtain torn from the top', 'women as first witnesses', 'disciples who did not believe it'],
  },
  acts: {
    range: 'Acts 2–15',
    line: 'Babel run backwards, and a movement that keeps outgrowing its own rules.',
    discover: ['fire on individual people', 'many languages, one message', 'a martyr who forgives', 'the decision that opened the door'],
  },
  letters: {
    range: 'Romans – Philippians',
    line: 'Letters to real congregations with real problems, written mostly under arrest.',
    discover: ['grace as gift rather than wage', 'love described as behaviour', 'contentment as a learned skill', 'gratitude before the answer'],
  },
  revelation: {
    range: 'Revelation 3–21',
    line: 'Not an escape from the world, but its remaking.',
    discover: ['a Lion who turns out to be a Lamb', 'tears wiped away personally', 'a city that comes down', 'all things new'],
  },
};
