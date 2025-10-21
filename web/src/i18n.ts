
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const defaultLng = import.meta.env.VITE_DEFAULT_LANG || "tr";

await i18n
  .use(initReactI18next)
  .init({
    lng: defaultLng,
    fallbackLng: "en",
    resources: {
      en: { translation: await (await fetch("/locales/en/translation.json")).json() },
      tr: { translation: await (await fetch("/locales/tr/translation.json")).json() }
    },
    interpolation: { escapeValue: false }
  });

export default i18n;
