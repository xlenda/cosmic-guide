// A VITRINE DAS PEÇAS — a tela escondida que empilha as seis peças de
// diagramação de uma vez. (12/09/2026)
//
// PRA QUE SERVE. Duas coisas, e só elas:
//   1. PROVAR que as peças empilham sem fresta, sem sobreposição feia e sem
//      matar o céu do CosmicScene por baixo — é impossível ver isso lendo
//      arquivo, e é exatamente onde diagramação dá errado;
//   2. servir de EXEMPLO COPIÁVEL: quem for aplicar as peças numa tela de
//      verdade abre este arquivo e vê cada uma em uso, com os degraus certos.
//
// ESCONDIDA DE PROPÓSITO. Está no HomeStack (ROUTES.PECAS_DEMO) e o deep link
// é /pecas — mas NENHUM menu, card ou botão do app leva até aqui. Só quem
// digita a URL chega. Não é tela de produto e não deve virar uma.
//
// OS DADOS SÃO DE EXEMPLO E ESTÃO MARCADOS COMO TAIS — texto fixo em
// português, sem i18n, porque isto não é conteúdo do app. O que NÃO é exemplo
// é o comportamento: as duas linhas sem dado da tabela e a coluna sem dado da
// fileira estão ali de propósito, pra a vitrine mostrar a lei de não fabricar
// funcionando (a linha some, o convite aparece).
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CosmicScene from '../components/CosmicScene';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import TabelaDados from '../components/TabelaDados';
import FileiraDeTres from '../components/FileiraDeTres';
import ListaCheck from '../components/ListaCheck';
import HeroiDoTopo from '../components/HeroiDoTopo';
import { CENAS } from '../lib/ilustracoes';
import { colors, space, type } from '../theme';

export default function PecasDemoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* O fundo do app, o de sempre. As faixas são translúcidas por cima
          dele — se as estrelas sumirem aqui, a translucidez quebrou. */}
      <CosmicScene />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: space.fimDaLista }}
        testID="pecas-demo"
      >
        {/* 5 · O HERÓI DO TOPO — arte grande ancorando o terço de cima. */}
        <HeroiDoTopo
          fonte={CENAS.guia}
          titulo="O próximo passo"
          apoio="Uma leitura do seu mapa, feita com as posições reais do céu no dia em que você nasceu."
        />

        {/* 1 + 6 · FAIXA CURVA (onda A) com a LISTA COM CHECK dentro. */}
        <FaixaCurva tom="ameixa" semente="oferta" style={styles.primeira}>
          <ColunaLeitura centralizado>
            <Text style={styles.tituloSecao}>O que vem na leitura</Text>
          </ColunaLeitura>
          <ListaCheck
            style={styles.aposTitulo}
            itens={[
              { chave: 'a', texto: 'As posições reais do céu' },
              { chave: 'b', texto: 'Seus talentos e forças', destaque: true },
              { chave: 'c', texto: 'O que pede atenção agora' },
              { chave: 'd', texto: 'Seus ideais interiores', destaque: true },
              { chave: 'e', texto: 'Um convite de prática pra semana' },
            ]}
          />
        </FaixaCurva>

        {/* 1 + 2 · FAIXA (onda B, outra curva) com a COLUNA DE LEITURA. */}
        <FaixaCurva tom="noite" semente="sobre" grude="ameixa">
          <ColunaLeitura>
            <Text style={styles.tituloSecao}>Como funciona?</Text>
            <Text style={styles.paragrafo}>
              O Cosmic calcula as posições dos planetas no instante do seu
              nascimento com efemérides de verdade — não são frases sorteadas de
              uma lista. A partir delas, a leitura fala do desenho que aquele céu
              formou, das tensões que ele carrega e das aberturas que ele
              propõe. O que a leitura não faz é dizer o que vai acontecer: o céu
              descreve um terreno, e quem caminha nele é você.
            </Text>
          </ColunaLeitura>
        </FaixaCurva>

        {/* 1 + 3 · FAIXA (onda C) com a TABELA DE DADOS.
            Repare: 'Hora de nasc.' aparece como CONVITE (não tem valor, tem
            convite) e 'Local de nasc.' NÃO APARECE (não tem nem um nem
            outro). É a lei de não fabricar desenhada. */}
        <FaixaCurva tom="violeta" semente="dados" grude="noite">
          <ColunaLeitura>
            <Text style={styles.tituloSecao}>Seus dados</Text>
          </ColunaLeitura>
          <TabelaDados
            style={styles.aposTitulo}
            itens={[
              { chave: 'nome', rotulo: 'Nome', valor: 'Guilherme' },
              { chave: 'signo', rotulo: 'Signo solar', valor: 'Capricórnio' },
              { chave: 'nasc', rotulo: 'Data de nasc.', valor: '9 de jan. de 1989', pilula: true },
              { chave: 'hora', rotulo: 'Hora de nasc.', valor: null, convite: 'adicione sua hora' },
              { chave: 'local', rotulo: 'Local de nasc.', valor: null },
            ]}
          />
        </FaixaCurva>

        {/* 1 + 4 · FAIXA (dourado, o acento) com a FILEIRA DE TRÊS.
            A quarta coluna não tem valor nem convite: não entra. */}
        <FaixaCurva tom="dourado" semente="numeros" grude="violeta">
          <FileiraDeTres
            itens={[
              { chave: 'dias', valor: '12', rotulo: 'dias seguidos' },
              { chave: 'cartas', valor: '48', rotulo: 'cartas viradas' },
              { chave: 'leituras', valor: '7', rotulo: 'leituras guardadas' },
              { chave: 'fantasma', valor: null, rotulo: 'coluna sem dado' },
            ]}
          />
        </FaixaCurva>

        {/* 1 · FAIXA rosa, pra provar que a quinta onda ainda é outra curva. */}
        <FaixaCurva tom="rosa" semente="fim" grude="dourado">
          <ColunaLeitura centralizado>
            <Text style={styles.paragrafo}>
              Cinco faixas empilhadas, cinco ondas diferentes, o céu aparecendo
              por trás de todas.
            </Text>
          </ColunaLeitura>
        </FaixaCurva>

        {/* O HERÓI SEM ARTE — o estado vazio, que é o print da tela de uma
            ideia só com metade em céu vazio. */}
        <HeroiDoTopo
          titulo="Sem arte, ainda funciona"
          apoio="O fundo estrelado já é bonito o bastante pra carregar uma tela."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  // A primeira faixa não leva `grude`: ela emenda no herói, não em outra faixa.
  primeira: { marginTop: space.secao },
  tituloSecao: { ...type.secao, color: colors.text, textAlign: 'center' },
  aposTitulo: { marginTop: space.entre },
  paragrafo: { ...type.corpo, color: colors.textSecondary, marginTop: space.bloco },
});
