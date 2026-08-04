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
import { setLanguageProvider } from '../lib/aiClient';

const LANGUAGE_KEY = 'app-language';
const LanguageContext = createContext(null);

// O idioma escolhido também precisa VIAJAR NA CHAMADA DE IA (03/08/2026) —
// senão o servidor, cujos prompts são em português, devolve leitura em
// português pra quem está com o app em espanhol ou inglês. aiClient.js não
// pode importar este arquivo (React/AsyncStorage não existem no node:test que
// exercita ele), então a dependência anda no sentido contrário: aqui guardamos
// o idioma vigente e registramos um leitor síncrono lá.
let langVigente = DEFAULT_LANGUAGE;
setLanguageProvider(() => langVigente);

function readUrlLang() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.search) return null;
  const p = new URLSearchParams(window.location.search);
  const lang = p.get('lang');
  return LANGUAGES.includes(lang) ? lang : null;
}

// Idioma real do navegador/aparelho — só usado quando não há nem link
// explícito (?lang=) nem preferência já salva. Não tenta adivinhar por IP/
// região (não temos esse dado, e localização geográfica não é o mesmo que
// idioma preferido) — usa o idioma que o próprio navegador já expõe.
function detectDeviceLanguage() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const locale = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  const lower = locale.toLowerCase();
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const urlLang = readUrlLang();
      if (urlLang) {
        langVigente = urlLang;
        setLang(urlLang);
        try {
          await AsyncStorage.setItem(LANGUAGE_KEY, urlLang);
        } catch {}
        setReady(true);
        return;
      }
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved && LANGUAGES.includes(saved)) {
          langVigente = saved;
          setLang(saved);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const changeLanguage = async (nextLang) => {
    if (!LANGUAGES.includes(nextLang)) return;
    langVigente = nextLang;
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
