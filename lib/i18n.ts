import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { LanguageDetectorAsyncModule } from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enTranslation from "@/translations/en.json";
import hiTranslation from "@/translations/hi.json";
import knTranslation from "@/translations/kn.json";
import mlTranslation from "@/translations/ml.json";

export const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
];

const LANGUAGE_DETECTOR: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  detect: (callback: (lng: string | readonly string[] | undefined) => void) => {
    AsyncStorage.getItem("user-language")
      .then((storedLanguage) => {
        if (storedLanguage) {
          callback(storedLanguage);
        } else {
          callback("en");
        }
      })
      .catch((error) => {
        console.log("Error reading language from AsyncStorage", error);
        callback("en");
      });
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem("user-language", lng);
    } catch (error) {
      console.log("Error storing language to AsyncStorage", error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      kn: { translation: knTranslation },
      ml: { translation: mlTranslation },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
