import type { Lesson } from '@/types';
import { PASSAGES } from '../scripture/passages';

export const BREAD_OF_LIFE: Lesson = {
  id: 'bread-of-life',
  courseId: 'jesus',
  eyebrow: 'John 6',
  title: 'Bread of Life',
  subtitle: 'What the crowd was really asking for',
  description:
    'Jesus has just fed thousands. The next morning the crowd finds Him again — and the conversation turns into one of the most quoted sentences He ever said.',
  estimatedMinutes: 7,
  difficulty: 'foundation',
  passages: PASSAGES,
  closingPassageId: 'matthew-6-11',
  steps: [
    {
      id: 'scripture-opening',
      type: 'SCRIPTURE',
      passageId: 'john-6-35',
      eyebrow: 'Today’s portion',
    },
    {
      id: 'context-1',
      type: 'CONTEXT',
      title: 'What’s happening?',
      commentary: {
        id: 'c-context-1',
        body: [
          'The day before, Jesus fed more than five thousand people from five loaves and two fish.',
          'Overnight He crosses the lake. The crowd follows and finds Him on the other side — and He tells them plainly why they came. Not because of what the sign meant. Because of the bread.',
          'What follows is not a rebuke. It is an invitation to want something better than what they came for.',
        ],
      },
    },
    {
      id: 'q-why-following',
      type: 'MULTIPLE_CHOICE',
      prompt: 'Why does Jesus say the crowd is following Him?',
      choices: [
        { id: 'a', text: 'They understood the miracle', response: 'Jesus says the opposite — the sign is exactly what they missed.' },
        { id: 'b', text: 'They ate and were filled', correct: true },
        { id: 'c', text: 'They wanted to hear Him teach', response: 'Look again at what He names as their reason.' },
        { id: 'd', text: 'They wanted to be healed', response: 'Not here. This crowd came from a meal.' },
      ],
      affirmation: 'Exactly.',
      explanation:
        'They came back for more bread. Jesus names it without shaming them — and then offers them something that will not run out by tomorrow morning.',
    },
    {
      id: 'q-who-said-it',
      type: 'WHO_SAID_IT',
      prompt: 'Who says this?',
      quote: '“Our fathers ate the manna in the wilderness.”',
      quoteRefLabel: 'John 6:31',
      choices: [
        { id: 'a', text: 'Moses', response: 'Moses is being spoken about here, not speaking.' },
        { id: 'b', text: 'Jesus', response: 'Not quite — this is said to Jesus, and He answers it next.' },
        { id: 'c', text: 'The crowd', correct: true },
        { id: 'd', text: 'The disciples', response: 'Look at who is asking Jesus for a sign in John 6.' },
      ],
      affirmation: 'Yes — and this changes everything.',
      explanation:
        'The crowd raises the manna themselves. They are asking Jesus to match Moses. His answer goes somewhere they did not expect.',
    },
    {
      id: 'reveal-manna',
      type: 'REVEAL',
      connectionId: 'exodus16-john6',
      prompt: 'Where does the manna they mention come from?',
      quote: '“He gave them bread out of heaven to eat.”',
      choices: [
        { id: 'a', text: 'Genesis 1', response: 'Not here — try the wilderness.' },
        { id: 'b', text: 'Exodus 16', correct: true },
        { id: 'c', text: 'Isaiah 53', response: 'Isaiah 53 is a different thread entirely.' },
        { id: 'd', text: 'Psalm 23', response: 'Close in spirit, but not the passage they are quoting.' },
      ],
    },
    {
      id: 'memory-fill',
      type: 'FILL_BLANK',
      prompt: 'Hold onto this one.',
      template: 'I am the ___ of life.',
      options: ['light', 'bread', 'way', 'vine'],
      answer: 'bread',
      affirmation: 'Gathered.',
    },
    {
      id: 'live-it',
      type: 'REFLECTION',
      statement: [
        'Jesus doesn’t merely give bread.',
        'He says He is the bread.',
      ],
      question:
        'What are you looking to satisfy today that cannot ultimately satisfy you?',
    },
  ],
};
