const ko = require('./locales/main.ko.json');
const en = require('./locales/main.en.json');

const SUPPORTED_LANGUAGES = ['ko', 'en'];
const COPY = { ko, en };

function normalizeLocaleToken(value) {
    return typeof value === 'string' ? value.trim().toLowerCase().replace('_', '-') : '';
}

function normalizeLanguage(value, fallback = 'en') {
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

function resolveLanguageFromLocales(locales, fallback = 'en') {
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

function detectMainDefaultLanguage(app) {
    const preferredSystemLocales = typeof app.getPreferredSystemLanguages === 'function'
        ? app.getPreferredSystemLanguages()
        : [];
    const appLocale = typeof app.getLocale === 'function'
        ? app.getLocale()
        : '';
    return resolveLanguageFromLocales(
        [...preferredSystemLocales, appLocale],
        'en'
    );
}

function getMainText(app, key) {
    const language = detectMainDefaultLanguage(app);
    const localized = COPY[language]?.[key];
    if (typeof localized === 'string') {
        return localized;
    }
    const fallback = COPY.en?.[key];
    return typeof fallback === 'string' ? fallback : key;
}

module.exports = {
    detectMainDefaultLanguage,
    getMainText,
    normalizeLanguage
};
