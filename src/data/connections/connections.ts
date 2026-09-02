import type { Connection } from '@/types';

/**
 * REVEAL — connections between passages.
 *
 * Every entry here is one the New Testament makes explicitly: a writer quotes
 * the passage, names it, or states outright that it speaks of Christ. None is
 * an inference of ours, which is the point — a connection that needs arguing
 * for does not belong in a reading app, however striking it looks.
 *
 * That rule excludes a great deal of legitimate typology. It is meant to. The
 * bar can be lowered later with proper theological review; it cannot easily be
 * raised once someone has met a connection here and taken it as settled.
 */
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
    source: { book: 'Psalms', chapter: 22, verseStart: 1 },
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

  {
    id: 'numbers21-john3',
    source: { book: 'Numbers', chapter: 21, verseStart: 8, verseEnd: 9 },
    target: { book: 'John', chapter: 3, verseStart: 14, verseEnd: 15 },
    type: 'TYPOLOGY',
    summary: 'Jesus names the bronze serpent himself, and says it was about him.',
    explanation: [
      'In the wilderness, people bitten by snakes were told to look at a bronze serpent lifted on a pole. Looking at it was the whole cure.',
      'It is an uncomfortable image. They were healed by looking at a likeness of the thing that was killing them.',
      'Jesus reaches for it himself, in conversation with Nicodemus at night, and says the Son of Man must be lifted up in the same way.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'exodus12-1corinthians5',
    source: { book: 'Exodus', chapter: 12, verseStart: 13 },
    target: { book: '1 Corinthians', chapter: 5, verseStart: 7 },
    type: 'TYPOLOGY',
    summary: 'Paul states it plainly: Christ, our Passover lamb, has been sacrificed.',
    explanation: [
      'In Egypt, a household was passed over because of blood on the doorframe. Not their record, not their goodness — the sign was the only thing being looked for.',
      'Paul does not argue the comparison or build up to it. He states it in passing, as something the Corinthians already knew.',
      'The timing was not lost on anyone. Jesus died during Passover, in a city full of people killing lambs.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'isaiah53-acts8',
    source: { book: 'Isaiah', chapter: 53, verseStart: 7, verseEnd: 8 },
    target: { book: 'Acts', chapter: 8, verseStart: 32, verseEnd: 35 },
    type: 'QUOTATION',
    summary: 'An official asks who the passage is about. Philip answers.',
    explanation: [
      'An Ethiopian official is reading Isaiah 53 in his chariot and asks the obvious question: is the prophet speaking of himself, or of someone else?',
      'Luke records the answer without hedging. Philip began from this Scripture and preached Jesus to him.',
      'It is the earliest recorded reading of the chapter, given by someone who had known Jesus’ followers, to a stranger who asked.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'isaiah7-matthew1',
    source: { book: 'Isaiah', chapter: 7, verseStart: 14 },
    target: { book: 'Matthew', chapter: 1, verseStart: 22, verseEnd: 23 },
    type: 'QUOTATION',
    summary: 'Matthew quotes Isaiah directly, and translates the name.',
    explanation: [
      'Isaiah gives a sign to a frightened king: a child will be born, and his name will be Immanuel.',
      'Matthew quotes it at the birth and then does something unusual — he stops to translate the name for readers who might not catch it. God with us.',
      'He then closes his Gospel on the same promise, in the last sentence: I am with you always. The whole book sits between them.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'genesis15-romans4',
    source: { book: 'Genesis', chapter: 15, verseStart: 6 },
    target: { book: 'Romans', chapter: 4, verseStart: 3 },
    type: 'QUOTATION',
    summary: 'One sentence about Abraham, which Paul builds an argument on.',
    explanation: [
      'Abraham believed God, and it was counted to him as righteousness. Counted, not earned — the word is an accounting term.',
      'Paul quotes it and presses on the timing: this was said before the law existed and before Abraham was circumcised.',
      'James quotes the same verse to a different end. The two are usually read together rather than against each other.',
    ],
    strength: 5,
    courseIds: ['grace'],
  },

  {
    id: 'joel2-acts2',
    source: { book: 'Joel', chapter: 2, verseStart: 28, verseEnd: 29 },
    target: { book: 'Acts', chapter: 2, verseStart: 16, verseEnd: 17 },
    type: 'QUOTATION',
    summary: 'Peter, explaining Pentecost, says simply: this is that.',
    explanation: [
      'Joel promised a day when the Spirit would be poured out on all people — sons and daughters, old and young, and servants alongside them.',
      'Standing in front of a confused crowd, Peter does not explain the noise. He quotes Joel and says this is what was spoken by the prophet.',
      'The detail Joel insists on is who receives it. Not a caste of prophets, but everybody.',
    ],
    strength: 5,
    courseIds: ['church'],
  },

  {
    id: 'psalm118-matthew21',
    source: { book: 'Psalms', chapter: 118, verseStart: 22 },
    target: { book: 'Matthew', chapter: 21, verseStart: 42 },
    type: 'QUOTATION',
    summary: 'Jesus quotes the psalm about a rejected stone, days before his arrest.',
    explanation: [
      'The stone the builders rejected has become the chief cornerstone — a line from a psalm sung at festivals.',
      'Jesus quotes it to the chief priests at the end of a parable about tenants who kill the owner’s son. Matthew notes that they understood he was speaking about them.',
      'Peter quotes the same verse to the same council a few chapters into Acts, standing where Jesus had stood.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'deuteronomy6-matthew22',
    source: { book: 'Deuteronomy', chapter: 6, verseStart: 5 },
    target: { book: 'Matthew', chapter: 22, verseStart: 37 },
    type: 'QUOTATION',
    summary: 'Asked to rank the whole law, Jesus quotes the Shema.',
    explanation: [
      'Love Yahweh your God with all your heart, soul and strength — recited twice daily by observant Jews then and now.',
      'A lawyer asks which commandment is greatest. Jesus quotes this, then adds a second from Leviticus that nobody asked for, and refuses to separate them.',
      'He is not offering a new teaching. He is telling them what the one they already had was for.',
    ],
    strength: 5,
    courseIds: ['law'],
  },

  {
    id: 'jonah1-matthew12',
    source: { book: 'Jonah', chapter: 1, verseStart: 17 },
    target: { book: 'Matthew', chapter: 12, verseStart: 39, verseEnd: 40 },
    type: 'TYPOLOGY',
    summary: 'Asked for a sign, Jesus offers only Jonah.',
    explanation: [
      'Three days and three nights in the belly of the fish — Jonah’s own prayer describes it as the bottom of the world, with the bars of the earth shut behind him.',
      'Pressed for a miraculous sign, Jesus refuses and names this one instead.',
      'He then adds a sharper point: the people of Nineveh repented at Jonah’s preaching, and something greater than Jonah is standing here.',
    ],
    strength: 5,
    courseIds: ['jesus'],
  },

  {
    id: 'genesis1-john1',
    source: { book: 'Genesis', chapter: 1, verseStart: 1 },
    target: { book: 'John', chapter: 1, verseStart: 1, verseEnd: 3 },
    type: 'TYPOLOGY',
    summary: 'John opens his Gospel with the first three words of the Bible.',
    explanation: [
      'In the beginning. John could have started anywhere — Matthew starts with a genealogy, Mark with the Jordan, Luke with an orderly account.',
      'John reaches back past the birth entirely and uses the opening words of Genesis, then says that everything made was made through the Word.',
      'The echo is not subtle and was not meant to be. He is placing the story he is about to tell inside the first one.',
    ],
    strength: 4,
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
