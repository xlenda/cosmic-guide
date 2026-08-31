# Cosmic Guide — regras para qualquer agente

Leia `CONTEXTO-PARA-AGENTE.md` por inteiro antes de tocar no projeto. Ele registra
os incidentes, as fontes de verdade, os limites do produto e o estado histórico.
Snapshots antigos nunca substituem uma medição atual de Git, testes ou produção.

Este arquivo incorpora somente o modelo reutilizável de apps móveis de
`D:\Projetos\TextMarker\docs\AGENTS_MOBILE_STORES_TEMPLATE.md`, preenchido para o
Cosmic Guide. Não copiar o `AGENTS.md` completo do NatureLens: ele contém regras,
IDs e decisões exclusivas daquele app.

## Produto e plataformas

- App React Native 0.81 / Expo SDK 54.
- Alvos oficiais: Android (Google Play) e iOS (App Store), além da web/PWA já
  publicada.
- Android package: `cloud.cosmicguide.app`.
- iOS bundle identifier: `cloud.cosmicguide.app`.
- EAS slug: `cosmic-guide`.
- O owner e o `extra.eas.projectId` do EAS ainda não estão configurados. Nunca
  inventar, copiar ou reaproveitar esses valores de outro app. Somente o dono
  pode executar `npx eas login` e `npx eas init`; o projeto criado deve ser
  exclusivo do Cosmic Guide.
- O site/PWA serve para construir e revisar, mas não substitui a validação dos
  recursos nativos em aparelhos reais.

## Armazenamento local

- A cópia de trabalho existente está em
  `C:\Users\XuXa\Downloads\Cosmic Guide`; não movê-la nem duplicá-la como efeito
  colateral de outra tarefa.
- Novos artefatos de build e desenvolvimento ficam em
  `D:\Projetos\CosmicGuide\artifacts`.
- Temporários e exports descartáveis ficam em `D:\Temp\User`.
- Caches de ferramentas ficam em `D:\DevCache` quando configurável, inclusive
  Android SDK/AVDs, Playwright, Gradle, npm e EAS.
- Não criar ou duplicar builds, vídeos, emuladores ou caches grandes no drive C:.
- Assets gerados devem nascer em D:, ser revisados e otimizados, e somente a
  versão final que pertence ao produto pode entrar no repositório.

## Um código, duas lojas

- Compartilhar lógica e interface entre Android e iOS.
- Usar `.native.js` para código comum nativo e `.android.js` / `.ios.js` apenas
  quando o sistema realmente exigir comportamento diferente.
- Para excluir uma dependência do bundle web, usar extensão de plataforma.
  `require()` tardio não impede o Metro de empacotá-la.
- Toda função prometida precisa existir nas duas plataformas ou ser claramente
  marcada como exclusiva; nunca deixar botão morto.
- Não chamar uma função nativa de pronta até testá-la em Android e iPhone reais.
- Simulador não valida câmera, notificações, compras, restauração nem
  comportamento de segundo plano.
- Toda afirmação de estado deve distinguir: código implementado, build concluído,
  teste em aparelho, envio à loja, revisão aprovada e produção liberada.

## Desenvolvimento a partir de Windows + iPhone

- Xcode e o simulador oficial de iOS exigem macOS. No Windows, usar EAS Build e
  instalar um development build no iPhone físico.
- Para Android no Windows, usar Android Studio + Android Emulator com SDK e AVDs
  em D:. Instalar no emulador um development build do mesmo commit e executar
  `npm run android` para Metro + Fast Refresh.
- Alterações somente em JavaScript, estilos e assets entram por Fast Refresh.
  Mudanças em módulo nativo, plugin Expo, permissões, `app.json` ou versão do SDK
  exigem novo development build.
- `expo-dev-client` deve ser compatível com o SDK instalado. Não adicionar ou
  atualizar o pacote sem validar a compatibilidade com Expo SDK 54.
- `eas.json` contém hoje `development`, `preview` e `production`. Antes de usar
  simulador iOS, criar e validar, sem copiar IDs de outro app:

  - `development-simulator`: herda `development`, usa `ios.simulator: true`;
  - `preview-simulator`: herda `preview`, usa `ios.simulator: true` e leva o
    bundle final embutido para validar abertura autônoma em iOS.

- Manter os perfis atuais com estas finalidades:

  - `development`: development client e distribuição interna;
  - `preview`: distribuição interna para QA;
  - `production`: artefato de loja, versão remota e incremento automático.

- Registrar o iPhone com `eas device:create` antes de build ad hoc.
- Development build exige Apple Developer ativa, Apple ID com 2FA, equipe Apple
  correta e UDID no provisioning profile.
- O simulador remoto do EAS pode não estar disponível para todas as contas. Um
  build de simulador concluído prova Xcode/link/bundle; não prova que a tela
  montou sem uma execução real ou remota.
- `eas build` compila. `eas submit` envia à loja. Liberar para usuários é uma
  terceira decisão. Nunca tratar essas ações como equivalentes.
- Nunca enviar à revisão ou liberar produção sem autorização explícita do dono.

## Permissões nativas

- O produto usa câmera/galeria para leituras simbólicas, notificações quando há
  consentimento e reprodução de áudio. Não usa gravação de microfone nem
  localização do aparelho.
- `expo-audio` e `expo-image-picker` devem continuar com permissão de microfone e
  gravação de áudio desativadas.
- Pedir câmera, galeria e notificações somente depois de uma ação que explique
  por que o acesso é necessário.
- Negar uma permissão não pode bloquear recursos não relacionados.
- Toda finalidade de iOS deve estar no Info.plist e localizada em PT, ES e EN.
- Manter `CFBundleAllowMixedLocalizations: true` enquanto houver prompts nativos
  localizados.
- Declarar no Android apenas permissões usadas pelo fluxo real. Manter
  `android.permission.SYSTEM_ALERT_WINDOW` bloqueada.
- Não habilitar localização precisa, background audio, telefone, Bluetooth,
  sobreposição, alarme exato ou microfone sem necessidade funcional documentada
  e autorização explícita.
- Gerar o projeto nativo para conferir o AndroidManifest e o config resolvido;
  ler apenas o `app.json` não prova as permissões finais.

## Câmera, voz e arquivos temporários

- Requisições de análise de imagem devem aceitar cancelamento e timeout. Uma
  resposta antiga nunca pode navegar, salvar ou mostrar alerta depois que a tela
  perdeu o foco.
- Imagem temporária deve ficar em cache exclusivo do app, ser validada, usada
  somente na solicitação atual e apagada assim que o fluxo permitir. Não enviar
  para Documents, galeria, backup, logs ou analytics.
- Nunca limpar pasta ampla de dependência. Uma migração só pode remover nomes
  legados que o app consiga provar que são seus.
- Se uma biblioteca nativa precisar de patch, versionar o patch, fixar a versão,
  aplicar no `postinstall` e provar a correção com instalação limpa.
- Validar tipo, tamanho e conteúdo antes do upload; não confiar apenas na
  extensão do arquivo.
- A voz do Órbi usa o backend próprio e ElevenLabs. Não existe fallback para TTS
  robótico do navegador/aparelho. Chaves e voice IDs ficam somente no servidor.
- O MP3 é privado, exige conta e e-mail confirmado, e o cache físico do backend
  não pode ultrapassar 24 horas. Qualquer mudança exige atualizar código,
  privacidade, testes e fichas das lojas juntos.
- Não declarar processamento efêmero ou retenção menor sem validar API, VPS,
  logs, observabilidade e caches reais de produção.
- Dependência nativa que elevar o deployment target deve ter o mínimo declarado
  e testado; nunca copiar esse número de outro app.

## Idioma

- Abrir no idioma do aparelho e manter a tela inteira no mesmo idioma.
- Todo texto visível existe em PT, ES e EN, inclusive erro, permissão, paywall,
  termos, conteúdo e ficha de loja.
- Nenhuma tela pode cair para inglês no meio de outro idioma.
- Preservar placeholders, nomes de obras, citações e códigos técnicos quando o
  contrato do conteúdo exigir; traduzir os rótulos visíveis.
- Adicionar e executar testes de paridade para cada chave nova.
- Procurar texto hardcoded no JSX: o portão de chaves não detecta tudo.

## Compras e assinatura

- Build Android vende somente por Google Play Billing.
- Build iOS vende somente por Apple In-App Purchase / StoreKit.
- Não exibir checkout externo, preço hardcoded ou CTA web dentro do app nativo.
- Produtos e preços vêm da loja; o direito de acesso é validado no servidor.
- RevenueCat permanece atrás do gate de configuração. Não ativar chaves antes de
  implementar e validar o webhook do servidor; hoje esse webhook é uma pendência
  conhecida.
- Implementar e testar compra, restauração, expiração, reembolso e gerenciamento
  da assinatura antes de ativar o paywall de loja.
- Uma assinatura concede o acesso que o produto realmente promete; não criar
  planos ou bloqueios novos sem decisão explícita do dono.

## Privacidade, IA, Comunidade e loja

- Manter Política de Privacidade e Termos coerentes no app e no site.
- App Privacy da Apple e Data Safety do Google têm definições diferentes; não
  copiar respostas mecanicamente entre os formulários.
- A conta tem exclusão dentro do app e URL pública de exclusão. Preservar o fluxo
  real e nunca prometer apagar dados que o código não apaga.
- A Comunidade exige regras, denúncia, bloqueio, exclusão pelo autor e moderação
  humana contínua conforme `docs/OPERACAO-MODERACAO.md`.
- Informar Anthropic, ElevenLabs, Supabase e demais fornecedores, finalidade,
  retenção, compartilhamento e limites sem prometer o que o código não prova.
- Órbi deve se identificar como IA da Anthropic antes da primeira pergunta. Não
  apresentá-lo como pessoa, médium ou mecanismo de previsão.
- O Diário, dados brutos de nascimento e contexto de casal não entram no contexto
  do chat. Não ampliar a allowlist sem alinhar privacidade e testes.
- Preparar screenshots reais, ícone, ASO localizado, suporte e notas de revisão.
- Testar sempre também em contexto limpo, sem storage ou conta do dono.

## Backend, Git e segredos

- `server-patches/` é a única fonte de verdade versionada do backend. Nunca
  sincronizar a pasta obsoleta `C:\tmp\gilfforever\backend`.
- A VPS executa outros negócios. Reiniciar ou alterar somente `forja-backend`.
- Antes de build/release: entender o working tree, preservar mudanças do usuário,
  commitar o escopo e confirmar que `origin/master` aponta para o mesmo commit.
- Nunca versionar `.env`, tokens, service-role keys, chaves da Anthropic ou
  ElevenLabs, `google-play-service-account.json`, certificados, profiles, senhas
  ou códigos 2FA.
- Preservar diretórios explicitamente fora do escopo, inclusive `CONTEXTO/` se
  continuar local e não rastreado.
- Não usar `git reset --hard`, não apagar caches/diretórios amplos e não publicar
  por atalhos diferentes dos scripts oficiais.
- Mudança somente documental em `AGENTS.md` não exige deploy de backend ou web.

## Portões obrigatórios para builds de loja

Executar antes de qualquer build de loja e registrar o resultado real:

1. `npm test`;
2. `npx expo install --check`;
3. `npx expo-doctor --verbose`;
4. `npx expo-modules-autolinking verify --platform both --verbose`;
5. `npx expo export --platform android` e `npx expo export --platform ios`, com
   saída descartável em D: quando a ferramenta permitir;
6. `npx expo prebuild --platform android --no-install` e inspeção do
   AndroidManifest/config resolvido; remover somente a pasta gerada e validada;
7. inspeção dos IDs, deployment target, permissões e ausência de background modes
   não autorizados;
8. teste em Android físico;
9. teste em iPhone físico / TestFlight;
10. compra/restauração, câmera, galeria, notificações, idioma, offline,
    salvamento, restauração e exclusão de conta;
11. conferência final das fichas Google Play Data Safety e Apple App Privacy.

Um portão vermelho bloqueia build, envio e publicação. Não contornar o teste nem
transformar falha em aviso.

## Publicação

- Backend deve ser publicado antes da web, sempre:

  1. `bash server-patches/deploy.sh`;
  2. `bash scripts/deploy-vercel.sh`.

- No Windows, usar a instalação existente do Git Bash se `bash` não estiver no
  PATH; não reescrever nem executar manualmente as etapas internas dos scripts.
- Nunca executar `vercel deploy` diretamente na raiz. O app depende da base
  `/cosmic-guide/` e de chunks lazy preparados pelo script oficial.
- Build Android: `npm run build:android`.
- Build iOS: `npm run build:ios`.
- Build das duas lojas: `npm run build:stores`.
- Envio Google Play: `npm run submit:android`, somente com aprovação explícita.
- Envio App Store: `npm run submit:ios`, somente com aprovação explícita.
- `eas submit` não autoriza revisão nem liberação pública. Confirmar cada etapa
  externa com o dono.
- Se qualquer portão falhar, não enviar nem publicar.
