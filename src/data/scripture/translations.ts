import type { Translation, TranslationId } from '@/types';

export const TRANSLATIONS: Record<TranslationId, Translation> = {
  WEB: {
    id: 'WEB',
    name: 'World English Bible',
    abbreviation: 'WEB',
    bundled: true,
    copyright: 'Public domain.',
  },
  KJV: {
    id: 'KJV', name: 'King James Version', abbreviation: 'KJV',
    bundled: true, copyright: 'Public domain.',
  },
  ESV: {
    id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV',
    bundled: false, copyright: 'Licence required. Fetch from an authorised API.',
  },
  NIV: {
    id: 'NIV', name: 'New International Version', abbreviation: 'NIV',
    bundled: false, copyright: 'Licence required. Fetch from an authorised API.',
  },
};

export const DEFAULT_TRANSLATION: TranslationId = 'WEB';
