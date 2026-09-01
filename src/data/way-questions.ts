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
};

/** Whether a chapter has questions — most do not, and that is deliberate. */
export const hasChapterQuestions = (chapter: string): boolean =>
  chapter in CHAPTER_QUESTIONS;
