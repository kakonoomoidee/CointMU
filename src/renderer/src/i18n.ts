import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import idTranslations from "./locales/id.json";
import esTranslations from "./locales/es.json";
import zhTranslations from "./locales/zh.json";
import ruTranslations from "./locales/ru.json";
import deTranslations from "./locales/de.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  id: {
    translation: idTranslations,
  },
  es: {
    translation: esTranslations,
  },
  zh: {
    translation: zhTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
  de: {
    translation: deTranslations,
  },
};

const savedLanguage = localStorage.getItem("appLanguage") || "en";

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("appLanguage", lng);
});

export default i18n;
