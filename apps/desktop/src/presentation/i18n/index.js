import ko from './locales/ko.js';
import en from './locales/en.js';

export const SUPPORTED_LANGUAGES = ['ko', 'en'];

const COPY = {
    ko,
    en
};

function getTextByPath(dict, path) {
    return path.split('.').reduce((value, key) => {
        if (value && Object.prototype.hasOwnProperty.call(value, key)) {
            return value[key];
        }
        return undefined;
    }, dict);
}

function normalizeLocaleToken(value) {
    return typeof value === 'string' ? value.trim().toLowerCase().replace('_', '-') : '';
}

export function normalizeLanguage(value, fallback = 'en') {
    const normalized = normalizeLocaleToken(value);
    if (SUPPORTED_LANGUAGES.includes(normalized)) {
        return normalized;
    }

    const languageOnly = normalized.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(languageOnly)) {
        return languageOnly;
    }

    return fallback;
}

export function resolveLanguageFromLocales(locales, fallback = 'en') {
    if (!Array.isArray(locales)) {
        return fallback;
    }

    for (const locale of locales) {
        const language = normalizeLanguage(locale, '');
        if (language) {
            return language;
        }
    }

    return fallback;
}

export function detectRendererDefaultLanguage() {
    const preferred = Array.isArray(window.navigator?.languages)
        ? window.navigator.languages
        : [];
    const fallbackLocale = window.navigator?.language ? [window.navigator.language] : [];
    return resolveLanguageFromLocales(
        [...preferred, ...fallbackLocale],
        'en'
    );
}

export function getText(language, path) {
    const dict = COPY[normalizeLanguage(language, 'en')] || COPY.en;
    const localized = getTextByPath(dict, path);
    if (typeof localized === 'string') {
        return localized;
    }
    const fallback = getTextByPath(COPY.en, path);
    return typeof fallback === 'string' ? fallback : path;
}
