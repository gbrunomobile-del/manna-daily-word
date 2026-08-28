import type { ScripturePassage } from '@/types';

/**
 * Verbatim World English Bible (public domain).
 * Sourced from bible-api.com WEB. Re-verify against an authoritative WEB
 * edition before production release — no verse here may be edited for style.
 */
export const PASSAGES: Readonly<Record<string, ScripturePassage>> = {
  'john-6-35': {
    id: 'john-6-35',
    ref: { book: 'John', chapter: 6, verseStart: 35 },
    translation: 'WEB',
    text: 'Jesus said to them, “I am the bread of life. He who comes to me will not be hungry, and he who believes in me will never be thirsty.”',
    illuminate: ['bread', 'life'],
  },
  'john-6-31': {
    id: 'john-6-31',
    ref: { book: 'John', chapter: 6, verseStart: 31 },
    translation: 'WEB',
    text: '“Our fathers ate the manna in the wilderness. As it is written, ‘He gave them bread out of heaven to eat.’”',
    illuminate: ['manna'],
  },
  'john-6-32-33': {
    id: 'john-6-32-33',
    ref: { book: 'John', chapter: 6, verseStart: 32, verseEnd: 33 },
    translation: 'WEB',
    text: '“Most certainly, I tell you, it wasn’t Moses who gave you the bread out of heaven, but my Father gives you the true bread out of heaven. For the bread of God is that which comes down out of heaven, and gives life to the world.”',
    illuminate: ['true'],
  },
  'exodus-16-4': {
    id: 'exodus-16-4',
    ref: { book: 'Exodus', chapter: 16, verseStart: 4 },
    translation: 'WEB',
    text: 'Then Yahweh said to Moses, “Behold, I will rain bread from the sky for you, and the people shall go out and gather a day’s portion every day, that I may test them, whether they will walk in my law, or not.”',
    illuminate: ['gather', 'portion'],
  },
  'exodus-16-15': {
    id: 'exodus-16-15',
    ref: { book: 'Exodus', chapter: 16, verseStart: 15 },
    translation: 'WEB',
    text: 'When the children of Israel saw it, they said to one another, “What is it?” For they didn’t know what it was. Moses said to them, “It is the bread which Yahweh has given you to eat.”',
    illuminate: ['What is it?'],
  },
  'matthew-6-11': {
    id: 'matthew-6-11',
    ref: { book: 'Matthew', chapter: 6, verseStart: 11 },
    translation: 'WEB',
    text: 'Give us today our daily bread.',
  },
};
