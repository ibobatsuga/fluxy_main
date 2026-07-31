import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { type SupportedLanguage } from "@/i18n";

interface LanguageStore {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: (i18n.language as SupportedLanguage) || "id",
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "fluxy-language",
    }
  )
);
