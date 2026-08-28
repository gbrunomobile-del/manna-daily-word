export type AnalyticsEvent =
  | { name: 'onboarding_started' }
  | { name: 'onboarding_completed'; goals: readonly string[]; minutes: number }
  | { name: 'daily_manna_started'; lessonId: string }
  | { name: 'lesson_step_completed'; lessonId: string; stepId: string }
  | { name: 'answer_correct'; lessonId: string; stepId: string }
  | { name: 'answer_incorrect'; lessonId: string; stepId: string }
  | { name: 'reveal_opened'; connectionId: string }
  | { name: 'reveal_completed'; connectionId: string }
  | { name: 'daily_manna_gathered'; lessonId: string; seconds: number }
  | { name: 'scripture_saved'; passageId: string }
  | { name: 'subscription_viewed' };

export interface AnalyticsSink { track(event: AnalyticsEvent): void }

const noopSink: AnalyticsSink = {
  track: (event) => {
    if (__DEV__) console.log('[analytics]', event.name, event);
  },
};

let sink: AnalyticsSink = noopSink;
export const setAnalyticsSink = (next: AnalyticsSink) => { sink = next; };
export const track = (event: AnalyticsEvent) => sink.track(event);
