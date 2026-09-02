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
