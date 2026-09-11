// lib/perfilLeitura.js — o que a pessoa conta sobre si pra leitura de tarô
// (gênero, idade, profissão, relacionamento), guardado LOCAL em AsyncStorage.
//
// Por que existe (11/09/2026): a referência do dono é o concorrente que
// mostra "Suas Informações" em cima da tiragem e usa isso na interpretação.
// Nada aqui exige login — quem não tem conta também preenche. Regra "NUNCA
// FABRICAR": sem nada salvo, getPerfilLeitura devolve null e a tela mostra o
// convite; a idade só é sugerida quando existe data de nascimento REAL salva
// (getAnyBirthData), nunca um chute.
//
// Enums fechados de propósito: um valor fora da lista vira null ao gravar —
// o prompt da IA monta texto a partir destes campos, e um valor livre aqui
// seria uma porta pra injeção no prompt.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnyBirthData } from './birthData';

const KEY = 'gff-perfil-leitura';

export const GENEROS = ['feminino', 'masculino', 'outro'];
export const ESTADOS_CIVIS = ['solteiro', 'namorando', 'casado', 'separado'];

// Idade e profissão também passam por régua: 0 e >130 não são idades de gente,
// e a profissão respeita o mesmo maxLength 40 do TextInput do componente.
function normalizar(p) {
  const o = p && typeof p === 'object' ? p : {};
  const idade = Number(o.idade);
  const profissao = typeof o.profissao === 'string' ? o.profissao.trim().slice(0, 40) : '';
  return {
    genero: GENEROS.includes(o.genero) ? o.genero : null,
    idade: Number.isInteger(idade) && idade > 0 && idade < 130 ? idade : null,
    profissao: profissao || null,
    estadoCivil: ESTADOS_CIVIS.includes(o.estadoCivil) ? o.estadoCivil : null,
  };
}

// null | { genero, idade, profissao, estadoCivil } — nunca lança.
export async function getPerfilLeitura() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? normalizar(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

// Grava já normalizado e devolve o que gravou, pra quem chama atualizar o
// estado com o MESMO objeto que vai voltar no próximo getPerfilLeitura.
export async function setPerfilLeitura(perfil) {
  const limpo = normalizar(perfil);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(limpo));
  } catch {}
  return limpo;
}

// number | null — anos COMPLETOS entre a data de nascimento salva (casal →
// solo → espelho web, mesma ordem do Céu de Hoje) e `agora`. Sem data → null.
// `agora` é injetável pra o teste fixar o dia; a conta é feita em ano/mês/dia
// locais, sem Date.parse da string, porque 'YYYY-MM-DD' no construtor de Date
// é lido como UTC e à noite (fuso −3) o dia do aniversário cairia pra véspera.
export async function idadeDeNascimento(agora = new Date()) {
  try {
    const nasc = await getAnyBirthData();
    if (!nasc || !nasc.date) return null;
    const [ano, mes, dia] = String(nasc.date).split('-').map(Number);
    if (!ano || !mes || !dia) return null;
    let idade = agora.getFullYear() - ano;
    const mesAtual = agora.getMonth() + 1;
    if (mesAtual < mes || (mesAtual === mes && agora.getDate() < dia)) idade -= 1;
    return idade >= 0 && idade < 130 ? idade : null;
  } catch {
    return null;
  }
}
