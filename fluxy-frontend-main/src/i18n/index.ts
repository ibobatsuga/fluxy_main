import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import id from "./locales/id.json";

export const SUPPORTED_LANGUAGES = ["id", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "fluxy-language";

function getStoredLanguage(): SupportedLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { language?: string } };
      const lang = parsed.state?.language;
      if (lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
        return lang as SupportedLanguage;
      }
    }
  } catch {
    // ignore malformed storage, fall back to default
  }
  return "id";
}

void i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: "id",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
