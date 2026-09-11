// lib/nomeLocal.js — o nome de quem NÃO tem login.
//
// Por que existe (decisão 11/09/2026): a Home cumprimentava só pelo signo
// ("Olá, Touro") e nome só existia pra quem criou conta
// (ProfileScreen: user.user_metadata.full_name). Quem entra sem cadastro — a
// maioria, no web — nunca era chamado pelo nome. Aqui ele vive em AsyncStorage
// ('gff-nome') pelos wrappers de lib/storage.js, e é isso que garante o
// "nunca lança": disco quebrado cai em memória em vez de derrubar o onboarding
// por causa de um campo opcional.
//
// NUNCA FABRICAR: sem nome salvo → null. Quem lê mostra o convite (ou o
// cumprimento pelo signo), nunca um "Visitante" inventado.
import { getItemSeguro, setItemSeguro, removeItemSeguro } from './storage';

export const NOME_KEY = 'gff-nome';

export async function getNome() {
  const bruto = await getItemSeguro(NOME_KEY);
  const nome = typeof bruto === 'string' ? bruto.trim() : '';
  return nome || null;
}

// String vazia (ou não-string) REMOVE a chave: apagar o nome no Perfil tem que
// voltar ao estado "sem nome", não gravar '' e enganar o getNome.
export async function setNome(nome) {
  const limpo = typeof nome === 'string' ? nome.trim() : '';
  if (!limpo) {
    await removeItemSeguro(NOME_KEY);
    return;
  }
  await setItemSeguro(NOME_KEY, limpo);
}
