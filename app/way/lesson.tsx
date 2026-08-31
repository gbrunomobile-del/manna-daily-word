import React, { useState, useCallback } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { X, Heart, ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { useTheme } from '@/theme';
import { feedback } from '@/services/feedback';
import { useWay } from '@/store/way';
import { useGathered } from '@/store/gathered';
import { useProgress } from '@/store/progress';

const { width: W } = Dimensions.get('window');

// ── Question bank (subset — expandable) ──────────────────────────────────────

interface Question {
  type: 'mcq' | 'tf';
  q: string;
  opts?: string[];
  answer: number | boolean;
  insight: string;
  verse?: string;
}

const QUESTIONS: Record<string, Question[]> = {
  creation: [
    { type:'mcq', q:'How many days did God take to create the world?', opts:['5','6','7','8'], answer:1, insight:'God created in 6 days and rested on the 7th.', verse:'Genesis 1:31' },
    { type:'tf', q:'God created light on the very first day.', answer:true, insight:'"Let there be light" — Day 1. The sun and moon came on Day 4.', verse:'Genesis 1:3' },
    { type:'mcq', q:'What did God create on the sixth day?', opts:['Fish and birds','Sun and moon','Animals and humans','Plants'], answer:2, insight:'Day 6: land animals and humanity — his final act of creation.', verse:'Genesis 1:24-27' },
    { type:'tf', q:'God formed humans from the dust of the ground.', answer:true, insight:'"The Lord God formed a man from the dust of the ground and breathed life into him."', verse:'Genesis 2:7' },
    { type:'mcq', q:'What was the first thing God declared "not good"?', opts:['Darkness','Man being alone','The serpent','Death'], answer:1, insight:'"It is not good for man to be alone." God created Eve as a companion.', verse:'Genesis 2:18' },
  ],
  'the-fall': [
    { type:'mcq', q:'What did Adam and Eve eat in the Garden?', opts:['An apple','A fig','Fruit of the Tree of Knowledge','A pomegranate'], answer:2, insight:'The Bible never says "apple" — it was fruit of the tree of knowledge of good and evil.', verse:'Genesis 3:6' },
    { type:'tf', q:'The serpent told Eve she would die if she ate the fruit.', answer:false, insight:'The serpent said the opposite: "You will not certainly die." The first recorded lie.', verse:'Genesis 3:4' },
    { type:'mcq', q:'Who made the first clothing for Adam and Eve?', opts:['Adam','Eve','The serpent','God'], answer:3, insight:'"The Lord God made garments of skin for Adam and his wife and clothed them."', verse:'Genesis 3:21' },
    { type:'tf', q:'Adam blamed Eve when confronted by God.', answer:true, insight:'Adam said "The woman you put here with me gave me some fruit" — blaming both Eve and God.', verse:'Genesis 3:12' },
    { type:'mcq', q:'What guarded the east of Eden after the Fall?', opts:['A wall','Cherubim and a flaming sword','The Tree of Life','A river'], answer:1, insight:'God placed cherubim and a flaming sword to guard the way to the Tree of Life.', verse:'Genesis 3:24' },
  ],
  noah: [
    { type:'mcq', q:'How many days and nights did it rain during the flood?', opts:['20','40','60','80'], answer:1, insight:'"Rain fell for forty days and forty nights." 40 is significant throughout Scripture.', verse:'Genesis 7:12' },
    { type:'tf', q:'Noah took exactly two of every animal onto the ark.', answer:false, insight:'7 pairs of clean animals, 1 pair of unclean. The "two of every kind" is a simplification.', verse:'Genesis 7:2-3' },
    { type:'mcq', q:'What sign did God give as a covenant after the flood?', opts:['A dove','A rainbow','A burning bush','A star'], answer:1, insight:'The rainbow — God\'s promise never to flood the entire earth again.', verse:'Genesis 9:13' },
    { type:'tf', q:'Noah was 600 years old when the flood came.', answer:true, insight:'"Noah was six hundred years old when the floodwaters came on the earth."', verse:'Genesis 7:6' },
    { type:'mcq', q:'What was Noah\'s occupation after the flood?', opts:['Fisherman','Shepherd','Farmer / winemaker','Carpenter'], answer:2, insight:'"Noah, a man of the soil, proceeded to plant a vineyard." The first recorded winemaker.', verse:'Genesis 9:20' },
  ],
  abraham: [
    { type:'mcq', q:'What was Abraham\'s original name?', opts:['Abram','Aram','Adram','Abiram'], answer:0, insight:'God changed Abram ("exalted father") to Abraham ("father of many nations").', verse:'Genesis 17:5' },
    { type:'tf', q:'God told Abraham to sacrifice his son Isaac.', answer:true, insight:'The ultimate test. Abraham obeyed — and God provided a ram as a substitute.', verse:'Genesis 22:2' },
    { type:'mcq', q:'God promised Abraham\'s descendants would be as numerous as what?', opts:['Grains of sand only','Stars only','Both stars and sand','Drops of rain'], answer:2, insight:'"As numerous as the stars in the sky and as the sand on the seashore."', verse:'Genesis 22:17' },
    { type:'tf', q:'Abraham was 75 years old when God first called him.', answer:true, insight:'"Abram was seventy-five years old when he set out from Harran."', verse:'Genesis 12:4' },
    { type:'mcq', q:'Who was Abraham\'s wife?', opts:['Rebekah','Rachel','Leah','Sarah'], answer:3, insight:'Sarah (originally Sarai). God changed her name as part of the covenant too.', verse:'Genesis 17:15' },
  ],
  joseph: [
    { type:'mcq', q:'How many brothers did Joseph have?', opts:['10','11','12','13'], answer:1, insight:'11 brothers — together the 12 tribes of Israel. Benjamin was the youngest.', verse:'Genesis 35:22' },
    { type:'tf', q:'Joseph\'s brothers sold him for 30 pieces of silver.', answer:false, insight:'Joseph was sold for 20 pieces of silver. Judas later betrayed Jesus for 30.', verse:'Genesis 37:28' },
    { type:'mcq', q:'What gift did Jacob give Joseph?', opts:['A golden ring','A coat of many colours','A staff','A sword'], answer:1, insight:'The coat symbolised Jacob\'s favouritism — stirring his brothers\' jealousy.', verse:'Genesis 37:3' },
    { type:'tf', q:'Joseph correctly interpreted Pharaoh\'s dream.', answer:true, insight:'7 fat cows + 7 lean = 7 years abundance then 7 years famine. Proved exactly right.', verse:'Genesis 41:25-32' },
    { type:'mcq', q:'What did Joseph say to his brothers who had sold him?', opts:['"I will punish you."','"You meant it for evil, God meant it for good."','"Leave and never return."','"I have forgotten."'], answer:1, insight:'One of the most powerful statements of forgiveness in Scripture.', verse:'Genesis 50:20' },
  ],
  moses: [
    { type:'mcq', q:'Where did God first speak to Moses?', opts:['Mount Sinai','In a dream','A burning bush','By the Red Sea'], answer:2, insight:'A burning bush that was not consumed — a sign of God\'s holy presence.', verse:'Exodus 3:2' },
    { type:'tf', q:'Moses was raised in the Egyptian royal household.', answer:true, insight:'Hidden in a basket, found by Pharaoh\'s daughter, raised as an Egyptian prince.', verse:'Exodus 2:10' },
    { type:'mcq', q:'How many plagues did God send on Egypt?', opts:['7','8','9','10'], answer:3, insight:'10 plagues culminated in the death of the firstborn, breaking Pharaoh\'s resistance.', verse:'Exodus 7-12' },
    { type:'tf', q:'Moses parted the Red Sea by stretching out his hand.', answer:true, insight:'"Moses stretched out his hand and the Lord drove the sea back with a strong east wind."', verse:'Exodus 14:21' },
    { type:'mcq', q:'What did God provide to eat in the wilderness?', opts:['Bread and fish','Manna and quail','Fruit and water','Milk and honey'], answer:1, insight:'Manna each morning and quail each evening — 40 years of daily provision.', verse:'Exodus 16:13-15' },
  ],
  'the-law': [
    { type:'mcq', q:'On which mountain did God give the Ten Commandments?', opts:['Mount Carmel','Mount Zion','Mount Sinai','Mount Nebo'], answer:2, insight:'Mount Sinai — where God also met Moses in the burning bush.', verse:'Exodus 19:20' },
    { type:'tf', q:'The first commandment is "You shall not murder."', answer:false, insight:'The first is "You shall have no other gods before me." Murder is the sixth.', verse:'Exodus 20:3' },
    { type:'mcq', q:'Which commandment concerns the Sabbath?', opts:['2nd','3rd','4th','5th'], answer:2, insight:'"Remember the Sabbath day by keeping it holy." One day of rest each week.', verse:'Exodus 20:8' },
    { type:'tf', q:'Moses broke the first set of stone tablets.', answer:true, insight:'When he saw the Israelites worshipping the golden calf, he shattered them in grief.', verse:'Exodus 32:19' },
    { type:'mcq', q:'Jesus summarised the Law in how many commandments?', opts:['1','2','3','10'], answer:1, insight:'"Love God" and "Love your neighbour" — all the Law hangs on these two.', verse:'Matthew 22:37-40' },
  ],
  david: [
    { type:'mcq', q:'What was David\'s job before becoming king?', opts:['Carpenter','Fisherman','Shepherd','Soldier'], answer:2, insight:'A shepherd boy tending his father Jesse\'s flocks when Samuel anointed him.', verse:'1 Samuel 16:11' },
    { type:'tf', q:'David killed Goliath with a sword.', answer:false, insight:'He killed him with a stone from a sling, then used Goliath\'s own sword to finish him.', verse:'1 Samuel 17:50' },
    { type:'mcq', q:'Who was David\'s closest friend?', opts:['Saul','Solomon','Jonathan','Nathan'], answer:2, insight:'Jonathan, Saul\'s son, loved David as himself — a great example of loyalty in Scripture.', verse:'1 Samuel 18:1' },
    { type:'tf', q:'David wrote most of the Psalms.', answer:true, insight:'73 of the 150 Psalms are attributed to David — the "sweet singer of Israel."', verse:'Psalm 3:1' },
    { type:'mcq', q:'What sin did David commit with Bathsheba?', opts:['Theft','Adultery','Idolatry','Blasphemy'], answer:1, insight:'Adultery and the murder of her husband Uriah — confronted by the prophet Nathan.', verse:'2 Samuel 11-12' },
  ],
  isaiah: [
    { type:'mcq', q:'Why is Isaiah called the "Fifth Gospel"?', opts:['It has 5 sections','Its Messianic prophecies','It follows the Gospels','Its length'], answer:1, insight:'Isaiah contains stunning prophecies about Jesus — written 700 years before his birth.', verse:'Isaiah 53' },
    { type:'tf', q:'"For unto us a child is born" is from Isaiah.', answer:true, insight:'"For to us a child is born, to us a son is given, and the government will be on his shoulders."', verse:'Isaiah 9:6' },
    { type:'mcq', q:'What did the seraphim cry in Isaiah\'s temple vision?', opts:['"Glory, glory, glory"','"Holy, holy, holy"','"Lord, Lord, Lord"','"Worthy, worthy, worthy"'], answer:1, insight:'"Holy, holy, holy is the Lord Almighty; the whole earth is full of his glory."', verse:'Isaiah 6:3' },
    { type:'tf', q:'Isaiah 53 describes one "pierced for our transgressions."', answer:true, insight:'The most detailed OT prophecy of the crucifixion — written 700 years before it happened.', verse:'Isaiah 53:5' },
    { type:'mcq', q:'Isaiah 40:31 says those who hope in the Lord will soar like what?', opts:['Doves','Sparrows','Eagles','Hawks'], answer:2, insight:'"They will soar on wings like eagles; they will run and not grow weary."', verse:'Isaiah 40:31' },
  ],
  birth: [
    { type:'mcq', q:'In which town was Jesus born?', opts:['Jerusalem','Nazareth','Bethlehem','Jericho'], answer:2, insight:'Bethlehem — fulfilling Micah 5:2. He grew up in Nazareth.', verse:'Luke 2:4-7' },
    { type:'tf', q:'The Bible says three wise men visited Jesus.', answer:false, insight:'The Bible never specifies the number — only three gifts. Tradition assumed three givers.', verse:'Matthew 2:1-12' },
    { type:'mcq', q:'Who announced Jesus\'s birth to Mary?', opts:['Gabriel','Michael','An unnamed angel','The Holy Spirit'], answer:0, insight:'The angel Gabriel appeared to Mary with the annunciation.', verse:'Luke 1:26-38' },
    { type:'tf', q:'Jesus was laid in a manger because there was no room at the inn.', answer:true, insight:'"She placed him in a manger, because there was no guest room available."', verse:'Luke 2:7' },
    { type:'mcq', q:'Which king tried to kill the baby Jesus?', opts:['Caesar Augustus','Herod Antipas','Herod the Great','Pontius Pilate'], answer:2, insight:'Herod the Great ordered the massacre of boys under 2 in Bethlehem.', verse:'Matthew 2:16' },
  ],
  ministry: [
    { type:'mcq', q:'How long did Jesus fast in the wilderness?', opts:['20 days','30 days','40 days','50 days'], answer:2, insight:'40 days and nights — echoing Israel\'s 40 years in the wilderness.', verse:'Matthew 4:2' },
    { type:'tf', q:'Turning water into wine was Jesus\'s first miracle.', answer:true, insight:'At the wedding in Cana — "the first of the signs through which he revealed his glory."', verse:'John 2:1-11' },
    { type:'mcq', q:'The Sermon on the Mount begins with which words?', opts:['"In the beginning"','"Blessed are the poor in spirit"','"The Kingdom is near"','"Love your neighbour"'], answer:1, insight:'"Blessed are the poor in spirit, for theirs is the kingdom of heaven." — The Beatitudes.', verse:'Matthew 5:3' },
    { type:'mcq', q:'How many disciples did Jesus choose?', opts:['7','10','12','15'], answer:2, insight:'12 disciples — matching the 12 tribes, signalling a new covenant people.', verse:'Mark 3:14' },
    { type:'tf', q:'Jesus walked on water.', answer:true, insight:'On the Sea of Galilee. Peter also walked briefly before sinking in doubt.', verse:'Matthew 14:25-29' },
  ],
  miracles: [
    { type:'mcq', q:'How many people did Jesus feed with 5 loaves and 2 fish?', opts:['2,000','4,000','5,000','10,000'], answer:2, insight:'5,000 men — plus women and children. 12 baskets of leftovers were collected.', verse:'Matthew 14:21' },
    { type:'tf', q:'Jesus raised Lazarus from the dead after 4 days.', answer:true, insight:'"He has been there four days." Jesus said "I am the resurrection and the life."', verse:'John 11:17,25' },
    { type:'mcq', q:'Jesus healed 10 lepers — how many came back to thank him?', opts:['1','3','5','All 10'], answer:0, insight:'Only 1 returned — a Samaritan. "Were not all ten cleansed? Where are the other nine?"', verse:'Luke 17:17' },
    { type:'tf', q:'Jesus calmed a storm by speaking to it.', answer:true, insight:'"Quiet! Be still!" The wind died and there was complete calm. The disciples were amazed.', verse:'Mark 4:39' },
    { type:'mcq', q:'At whose wedding did Jesus perform his first miracle?', opts:['Cana','Jerusalem','Galilee','Bethany'], answer:0, insight:'The wedding at Cana — where he turned water into wine at his mother\'s request.', verse:'John 2:1' },
  ],
  cross: [
    { type:'mcq', q:'What were Jesus\'s last words in John\'s Gospel?', opts:['"My God, why have you forsaken me?"','"Father forgive them"','"It is finished"','"Into your hands"'], answer:2, insight:'"It is finished" — tetelestai in Greek, meaning a debt paid in full. Salvation complete.', verse:'John 19:30' },
    { type:'tf', q:'Jesus rose from the dead on the third day.', answer:true, insight:'Crucified Friday, tomb Saturday, risen Sunday — exactly as he predicted three times.', verse:'Luke 24:7' },
    { type:'mcq', q:'Who was first to see Jesus after the resurrection?', opts:['Peter','John','Mary Magdalene','Thomas'], answer:2, insight:'Mary Magdalene — she initially mistook him for the gardener.', verse:'John 20:14-16' },
    { type:'tf', q:'Thomas doubted until he saw Jesus\'s wounds.', answer:true, insight:'"Unless I see the nail marks..." When Jesus appeared, Thomas declared "My Lord and my God!"', verse:'John 20:25-28' },
    { type:'mcq', q:'For how many days did Jesus appear after the resurrection?', opts:['10','30','40','50'], answer:2, insight:'40 days — appearing and teaching about the Kingdom before his ascension.', verse:'Acts 1:3' },
  ],
  acts: [
    { type:'mcq', q:'What happened on the Day of Pentecost?', opts:['Jesus ascended','The Holy Spirit came','The first church was built','Paul was converted'], answer:1, insight:'Wind, fire, speaking in languages — 3,000 people baptised in one day.', verse:'Acts 2:1-41' },
    { type:'tf', q:'Paul originally persecuted Christians before his conversion.', answer:true, insight:'Saul of Tarsus approved of Stephen\'s stoning — dramatically converted on the road to Damascus.', verse:'Acts 8:1, 9:3-5' },
    { type:'mcq', q:'Who was the first Christian martyr?', opts:['Peter','James','Stephen','Philip'], answer:2, insight:'Stephen was stoned to death. His dying prayer: "Lord, do not hold this sin against them."', verse:'Acts 7:59-60' },
    { type:'tf', q:'Peter and Paul both wrote letters in the New Testament.', answer:true, insight:'Peter wrote 1 & 2 Peter. Paul wrote 13 letters — together 15 of the 27 NT books.', verse:'Various' },
    { type:'mcq', q:'Where was Paul going when he was converted?', opts:['Jerusalem','Athens','Damascus','Corinth'], answer:2, insight:'On his way to arrest Christians in Damascus when Jesus appeared to him in blinding light.', verse:'Acts 9:3' },
  ],
  letters: [
    { type:'mcq', q:'Which Paul letter contains "I can do all things through Christ"?', opts:['Romans','Galatians','Philippians','Colossians'], answer:2, insight:'"I can do all this through him who gives me strength." — Philippians 4:13', verse:'Philippians 4:13' },
    { type:'tf', q:'"Faith without works is dead" is from Paul\'s letters.', answer:false, insight:'That\'s from James 2:17. Paul emphasised faith alone — James emphasised its fruit.', verse:'James 2:17' },
    { type:'mcq', q:'What does Paul call the "fruit of the Spirit"?', opts:['Faith, hope, love','Love, joy, peace...','Grace, mercy, truth','Wisdom, knowledge, faith'], answer:1, insight:'"Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control."', verse:'Galatians 5:22-23' },
    { type:'tf', q:'"All Scripture is God-breathed" is from 2 Timothy.', answer:true, insight:'"All Scripture is God-breathed and useful for teaching, correcting and training in righteousness."', verse:'2 Timothy 3:16' },
    { type:'mcq', q:'Romans 8:28 says God works all things for good for whom?', opts:['Everyone','Those who are good','Those who love him','The righteous'], answer:2, insight:'"We know that in all things God works for the good of those who love him."', verse:'Romans 8:28' },
  ],
  revelation: [
    { type:'mcq', q:'Who wrote the book of Revelation?', opts:['Paul','Peter','John','Luke'], answer:2, insight:'The apostle John, while exiled on the island of Patmos — the last living apostle.', verse:'Revelation 1:1,9' },
    { type:'tf', q:'The number of the beast in Revelation is 666.', answer:true, insight:'"Let the person who has insight calculate the number of the beast... That number is 666."', verse:'Revelation 13:18' },
    { type:'mcq', q:'What is the very last word of the Bible?', opts:['Amen','Forever','Maranatha','Christ'], answer:0, insight:'Revelation 22:21 ends with "Amen" — sealing all of Scripture with affirmation.', verse:'Revelation 22:21' },
    { type:'tf', q:'In Revelation, God declares "I am making everything new."', answer:true, insight:'"I am making everything new!" — The final vision is renewal, not escape.', verse:'Revelation 21:5' },
    { type:'mcq', q:'What does Revelation 21-22 describe?', opts:['The Great Tribulation','The New Jerusalem','Only the Last Judgment','Armageddon'], answer:1, insight:'The New Jerusalem — a city where God dwells with his people for eternity.', verse:'Revelation 21:1-4' },
  ],
};

const TOTAL_QUESTIONS = 5;
const MAX_HEARTS = 3;

// ── Lesson screen ─────────────────────────────────────────────────────────────

export default function WayLesson() {
  const t = useTheme();
  const router = useRouter();
  const { skillId } = useLocalSearchParams<{ skillId: string }>();

  const { recordAttempt } = useWay();
  const { gather } = useGathered();
  const recordDay = useProgress((s) => s.gather);

  const questions = QUESTIONS[skillId ?? ''] ?? QUESTIONS.creation;
  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const handleAnswer = useCallback((ans: number | boolean) => {
    if (showResult) return;
    setSelected(ans);
    const isCorrect = ans === q.answer;
    setCorrect(isCorrect);
    setShowResult(true);
    if (isCorrect) {
      feedback.success?.();
      setScore(s => s + 1);
    } else {
      feedback.error?.();
      setHearts(h => h - 1);
      shake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [q, showResult, shake]);

  /** Save progress and gather every verse this topic taught. */
  const finish = useCallback(async (finalScore: number) => {
    setDone(true);
    const verses = questions.map((x) => x.verse).filter(Boolean) as string[];
    await Promise.all([
      recordAttempt(skillId ?? 'creation', finalScore, TOTAL_QUESTIONS),
      gather(verses),
      // Passing a topic counts toward the day as much as a reading does.
      finalScore >= 3
        ? recordDay(`way-${skillId ?? 'creation'}`, 0)
        : Promise.resolve(),
    ]);
  }, [questions, recordAttempt, gather, recordDay, skillId]);

  const handleNext = useCallback(() => {
    if (hearts <= 0) { void finish(score); return; }
    if (qIdx >= TOTAL_QUESTIONS - 1) { void finish(score); return; }
    setQIdx(i => i + 1);
    setSelected(null);
    setShowResult(false);
    setCorrect(false);
  }, [qIdx, hearts, score, finish]);

  if (done) {
    const passed = score >= 3;
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]}>
        <View style={styles.complete}>
          <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: 20 }}>
            <Text style={{ fontSize: 64 }}>{passed ? '✨' : '📖'}</Text>
            <Text variant="title" style={{ color: t.colors.text, textAlign: 'center' }}>
              {passed ? 'Well gathered!' : 'Keep studying'}
            </Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center', paddingHorizontal: 32 }}>
              {passed
                ? `You answered ${score}/${TOTAL_QUESTIONS} correctly. +${score * 10} XP gathered.`
                : `You answered ${score}/${TOTAL_QUESTIONS}. Try again to gather this topic.`}
            </Text>
            <View style={[styles.xpRow, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
              <Text style={{ color: t.colors.accent, fontSize: 20, fontWeight: '700' }}>
                +{score * 10} XP
              </Text>
            </View>
            <Button label="Return to The Way" variant="primary" onPress={() => router.back()} />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.colors.background }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={t.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
        {/* Progress */}
        <View style={[styles.progress, { backgroundColor: t.colors.surface }]}>
          <View style={[styles.progressFill, { backgroundColor: t.colors.accent, width: `${((qIdx) / TOTAL_QUESTIONS) * 100}%` }]} />
        </View>
        {/* Hearts */}
        <View style={styles.hearts}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              size={18}
              fill={i < hearts ? '#E05555' : 'transparent'}
              color={i < hearts ? '#E05555' : t.colors.border}
              strokeWidth={1.5}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(300)} style={shakeStyle}>
          {/* Question */}
          <Text variant="body" tone="muted" style={styles.qCounter}>
            Question {qIdx + 1} of {TOTAL_QUESTIONS}
          </Text>
          <Text variant="title" style={[styles.question, { color: t.colors.text }]}>
            {q.q}
          </Text>

          {/* Answer options */}
          <View style={styles.options}>
            {q.type === 'mcq' && q.opts?.map((opt, i) => {
              const isSelected = selected === i;
              const isAnswer = i === q.answer;
              let bg = t.colors.surface;
              let border = t.colors.border;
              let textColor = t.colors.text;
              if (showResult && isAnswer) { bg = '#1A5535'; border = '#1A5535'; textColor = '#F8F4EA'; }
              else if (showResult && isSelected && !isAnswer) { bg = '#5E1A1A'; border = '#5E1A1A'; textColor = '#F8F4EA'; }
              return (
                <Pressable
                  key={i}
                  onPress={() => handleAnswer(i)}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={{ color: textColor, fontSize: 16, lineHeight: 22 }}>{opt}</Text>
                </Pressable>
              );
            })}

            {q.type === 'tf' && [true, false].map((val, i) => {
              const isSelected = selected === val;
              const isAnswer = val === q.answer;
              let bg = t.colors.surface;
              let border = t.colors.border;
              let textColor = t.colors.text;
              if (showResult && isAnswer) { bg = '#1A5535'; border = '#1A5535'; textColor = '#F8F4EA'; }
              else if (showResult && isSelected && !isAnswer) { bg = '#5E1A1A'; border = '#5E1A1A'; textColor = '#F8F4EA'; }
              return (
                <Pressable
                  key={i}
                  onPress={() => handleAnswer(val)}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={{ color: textColor, fontSize: 16 }}>{val ? 'True' : 'False'}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Insight panel */}
          {showResult && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={[styles.insight, { backgroundColor: correct ? '#1A5535' + '18' : '#5E1A1A' + '18', borderColor: correct ? '#1A5535' + '40' : '#5E1A1A' + '40' }]}
            >
              <Text style={{ color: correct ? '#356653' : '#A85A55', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>
                {correct ? '✓ Correct!' : '✗ Not quite'}
              </Text>
              <Text style={{ color: t.colors.text, fontSize: 14, lineHeight: 21 }}>{q.insight}</Text>
              {q.verse && (
                <Text style={{ color: t.colors.textMuted, fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                  {q.verse}
                </Text>
              )}
              <Pressable
                onPress={handleNext}
                style={[styles.nextBtn, { backgroundColor: correct ? '#356653' : t.colors.surface, borderColor: correct ? '#356653' : t.colors.border }]}
              >
                <Text style={{ color: correct ? '#F8F4EA' : t.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {qIdx >= TOTAL_QUESTIONS - 1 ? 'See results' : 'Next'}
                </Text>
                <ArrowRight size={16} color={correct ? '#F8F4EA' : t.colors.text} strokeWidth={2} />
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  closeBtn: { padding: 4 },
  progress: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  hearts: { flexDirection: 'row', gap: 4 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 },
  qCounter: { marginBottom: 10 },
  question: { fontSize: 22, lineHeight: 30, marginBottom: 28 },
  options: { gap: 12, marginBottom: 20 },
  option: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20 },
  insight: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 0 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, borderWidth: 1, borderRadius: 12, paddingVertical: 13,
  },
  complete: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  xpRow: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 12 },
});
