// components/MissionPing.js
// Plug de UMA linha pras telas marcarem "essa ação aconteceu hoje" no motor
// de missões diárias (lib/missions.js) sem nenhuma lógica local: basta
// renderizar <MissionPing action={MISSION_ACTIONS.X} /> em qualquer lugar da
// tela — no foco, o marcador do dia é gravado via recordMissionAction (que é
// idempotente e recusa chave desconhecida, então o pior caso é um no-op).
//
// ATUALIZAÇÃO (auditoria 27/07): NENHUM plug pendente. As missões de
// Horóscopo e Calendário Lunar passaram a verificar pela entrada que essas
// telas JÁ criam no Diário Cósmico ao abrir (ver MISSION_POOL em
// lib/missions.js) — plugar MissionPing nelas virou desnecessário (e é
// inofensivo se acontecer). O componente fica pra futuras missões de ação em
// telas cujo consumo não deixa rastro persistido. Não renderiza nada e não
// segura o foco.
//
// AINDA SEM CONSUMIDOR (13/09/2026). As duas missões do céu ('ceu-de-hoje' e
// 'proximos-dias') eram a candidata óbvia — verificam por marcador de ação e
// ninguém gravava o marcador, o que as tornava impossíveis de completar. O
// conserto NÃO passou por aqui: as telas de destino estão com outro time, e
// registrar no toque (MISSION_ACTION_ON_TAP, em components/DailyMissionsCard.js)
// não exige tocar nelas. Este componente segue guardado de propósito.
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { recordMissionAction } from '../lib/missions';

export default function MissionPing({ action }) {
  useFocusEffect(
    useCallback(() => {
      // fire-and-forget: o motor serializa e deduplica; a tela não espera.
      recordMissionAction(action);
    }, [action])
  );
  return null;
}
