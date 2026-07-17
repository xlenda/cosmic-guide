// context/LanguageContext.js
// Idioma do app — detectado uma vez, na primeira visita, a partir do parâmetro
// ?lang= da URL de handoff (o funil web em espanhol já vai passar lang=es no
// redirect final, ver gilfforever/web quiz page.js). Depois disso, persiste no
// AsyncStorage — trocar de idioma não é algo que a pessoa vai querer refazer
// toda vez que abrir o app.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { translate, DEFAULT_LANGUAGE, LANGUAGES } from '../lib/i18n';

const LANGUAGE_KEY = 'app-language';
const LanguageContext = createContext(null);

function readUrlLang() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.search) return null;
  const p = new URLSearchParams(window.location.search);
  const lang = p.get('lang');
  return LANGUAGES.includes(lang) ? lang : null;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const urlLang = readUrlLang();
      if (urlLang) {
        setLang(urlLang);
        try {
          await AsyncStorage.setItem(LANGUAGE_KEY, urlLang);
        } catch {}
        setReady(true);
        return;
      }
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved && LANGUAGES.includes(saved)) setLang(saved);
      } catch {}
      setReady(true);
    })();
  }, []);

  const changeLanguage = async (nextLang) => {
    if (!LANGUAGES.includes(nextLang)) return;
    setLang(nextLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, nextLang);
    } catch {}
  };

  const t = (key, vars) => translate(lang, key, vars);

  return (
    <LanguageContext.Provider value={{ lang, ready, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
