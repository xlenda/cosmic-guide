const fs = require('node:fs');
const path = require('node:path');

const {
  APP_STORE_LOCALE_BY_LISTING,
  STORE_LOCALES,
  listings,
  shared,
} = require('./store-listings');

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const outputRoot = path.resolve(
  argumentValue('--output') || 'D:\\Projetos\\Cosmic Guide Store\\release-final\\metadata',
);

function googlePlayText(locale) {
  const listing = listings[locale];
  const store = listing.googlePlay;
  return `COSMIC GUIDE — GOOGLE PLAY — ${listing.language}

NOME DO APP (${store.title.length}/30)
${store.title}

DESCRIÇÃO BREVE (${store.shortDescription.length}/80)
${store.shortDescription}

DESCRIÇÃO COMPLETA (${store.fullDescription.length}/4000)
${store.fullDescription}

CATEGORIA
${shared.googlePlayCategory}

POLÍTICA DE PRIVACIDADE
${shared.privacyPolicyUrl}

EXCLUSÃO DE CONTA
${shared.accountDeletionUrl}
`;
}

function appStoreText(locale) {
  const listing = listings[locale];
  const store = listing.appStore;
  const support = shared.supportUrl || 'PENDENTE — ativar um canal de suporte que realmente receba mensagens';
  return `COSMIC GUIDE — APP STORE — ${listing.language}

NAME (${store.name.length}/30)
${store.name}

SUBTITLE (${store.subtitle.length}/30)
${store.subtitle}

PROMOTIONAL TEXT (${store.promotionalText.length}/170)
${store.promotionalText}

KEYWORDS (${Buffer.byteLength(store.keywords, 'utf8')}/100 bytes)
${store.keywords}

DESCRIPTION (${store.description.length}/4000)
${store.description}

PRIMARY CATEGORY
${shared.appStorePrimaryCategory}

SECONDARY CATEGORY
${shared.appStoreSecondaryCategory}

PRIVACY POLICY URL
${shared.privacyPolicyUrl}

SUPPORT URL
${support}
`;
}

function screenshotsText(locale) {
  const listing = listings[locale];
  const lines = [`COSMIC GUIDE — SCREENSHOTS — ${listing.language}`, ''];
  listing.screenshots.forEach((shot, index) => {
    lines.push(`${index + 1}. ${shot.slug}`);
    lines.push(`   Selo: ${shot.eyebrow}`);
    lines.push(`   Headline: ${shot.headline}`);
    lines.push(`   Alt text: ${shot.altText}`);
    lines.push(`   Cena real: ${shot.scene}`);
    lines.push('');
  });
  return `${lines.join('\n')}\n`;
}

fs.mkdirSync(outputRoot, { recursive: true });

for (const locale of STORE_LOCALES) {
  const googleDir = path.join(outputRoot, 'google-play', locale);
  const appleDir = path.join(outputRoot, 'app-store', APP_STORE_LOCALE_BY_LISTING[locale]);
  const screenshotsDir = path.join(outputRoot, 'screenshots', locale);
  fs.mkdirSync(googleDir, { recursive: true });
  fs.mkdirSync(appleDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.writeFileSync(path.join(googleDir, 'listing.txt'), googlePlayText(locale), 'utf8');
  fs.writeFileSync(path.join(appleDir, 'listing.txt'), appStoreText(locale), 'utf8');
  fs.writeFileSync(path.join(screenshotsDir, 'ordem-e-textos.txt'), screenshotsText(locale), 'utf8');
}

const readme = `COSMIC GUIDE — PACOTE DE METADADOS

Gerado de: play-store/metadata/store-listings.js
Google Play: ${STORE_LOCALES.join(', ')}
App Store Connect: ${STORE_LOCALES.map((locale) => APP_STORE_LOCALE_BY_LISTING[locale]).join(', ')}

Pastas:
- google-play/<locale>/listing.txt: campos para o Play Console;
- app-store/<locale>/listing.txt: campos para o App Store Connect;
- screenshots/<locale>/ordem-e-textos.txt: ordem, headline e alt text.

O espanhol usa es-419 no Google Play e es-MX na App Store. Não trocar o locale
da Apple por es-419: essa opção não existe no App Store Connect.

O Support URL da App Store permanece pendente de propósito. Não use uma página
que não ofereça contato real. Veja play-store/ASO-ESTRATEGIA.md.
`;
fs.writeFileSync(path.join(outputRoot, 'LEIA-ME.txt'), readme, 'utf8');

console.log(`Metadados exportados para ${outputRoot}`);
