/**
 * Lightweight i18n with Hindi support and Devanagari numerals
 */

export type Locale = 'en' | 'hi';

export const dict = {
  en: {
    counter: 'Counter',
    increment: 'Tap to Count',
    undo: 'Undo',
    reset: 'Reset',
    goal: 'Goal',
    completed: 'Completed',
    remaining: 'Remaining',
    today: 'Today',
    streak: 'Streak',
    malas: 'Malas',
    mala: 'Mala',
    malaComplete: 'Mala Complete!',
    dailyTargetAchieved: 'Daily Target Achieved!',
    resetConfirm: 'Are you sure you want to reset your counter?',
    radhaRadha: 'Radha Radha',
    moreToComplete: 'more to complete this mala',
    radhaJap: 'Radha Naam Jap',
    stats: 'Statistics',
    spiritual: 'Spiritual',
    timer: 'Timer',
    settings: 'Settings',
  },
  hi: {
    counter: 'काउंटर',
    increment: 'गिनने के लिए टैप करें',
    undo: 'वापस',
    reset: 'रीसेट',
    goal: 'लक्ष्य',
    completed: 'पूर्ण',
    remaining: 'शेष',
    today: 'आज',
    streak: 'स्ट्रीक',
    malas: 'माला',
    mala: 'माला',
    malaComplete: 'माला पूर्ण!',
    dailyTargetAchieved: 'दैनिक लक्ष्य प्राप्त!',
    resetConfirm: 'क्या आप वाकई अपना काउंटर रीसेट करना चाहते हैं?',
    radhaRadha: 'राधा राधा',
    moreToComplete: 'और इस माला को पूरा करने के लिए',
    radhaJap: 'राधा नाम जप',
    stats: 'सांख्यिकी',
    spiritual: 'आध्यात्मिक',
    timer: 'टाइमर',
    settings: 'सेटिंग्स',
  }
} as const;

export function formatNumber(n: number, locale: Locale = 'en', useDevanagari: boolean = false): string {
  if (locale === 'hi' && useDevanagari) {
    return new Intl.NumberFormat('hi-IN-u-nu-deva').format(n);
  }
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN').format(n);
}

export function t(key: keyof typeof dict.en, locale: Locale = 'en'): string {
  return dict[locale][key] || dict.en[key];
}
