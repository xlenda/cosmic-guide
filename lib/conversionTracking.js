// Tracking de conversão (Meta Pixel + GA4) do app — espelha exatamente o
// mesmo padrão já usado no funil web (gilfforever/web/app/layout.js e
// (funil)/planos/page.js:trackInitiateCheckout), pra medir o mesmo funil
// independente de o cliente vir pelo site ou pelo app. Só existe de verdade
// quando EXPO_PUBLIC_FB_PIXEL_ID/EXPO_PUBLIC_GA_ID estiverem configurados
// (nenhum dos dois tem valor real ainda — são só placeholders no funil web
// também, achado real de auditoria, 19/07/2026) e só roda na web, já que o
// app não é publicado em loja hoje.
import { Platform } from 'react-native';

const FB_PIXEL_ID = process.env.EXPO_PUBLIC_FB_PIXEL_ID || '';
const GA_ID = process.env.EXPO_PUBLIC_GA_ID || '';

let injected = false;

function injectScripts() {
  if (injected || Platform.OS !== 'web' || typeof document === 'undefined') return;
  injected = true;

  if (FB_PIXEL_ID) {
    const fbScript = document.createElement('script');
    fbScript.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fbScript);
  }

  if (GA_ID) {
    const gtagSrc = document.createElement('script');
    gtagSrc.async = true;
    gtagSrc.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(gtagSrc);

    const gtagInit = document.createElement('script');
    gtagInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(gtagInit);
  }
}

// Chamar uma vez perto da raiz do app (App.js). No-op se os IDs não
// estiverem configurados ou se a plataforma não for web.
export function initConversionTracking() {
  injectScripts();
}

// Mesmo evento e mesmos valores do funil web — $5 USD é o default real de
// InitiateCheckoutUseCase (plan='monthly', amountCents=500, currency='USD').
export function trackInitiateCheckout() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.fbq && window.fbq('track', 'InitiateCheckout', { value: 5, currency: 'USD' });
  window.gtag && window.gtag('event', 'begin_checkout', { value: 5, currency: 'USD' });
}
