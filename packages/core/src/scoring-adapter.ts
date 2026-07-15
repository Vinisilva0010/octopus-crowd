/**
 * ÚNICA peça do sistema que depende de ver um gol real da TxLINE.
 * Teste real agendado: amanhã, jogo das 16h. Assim que o primeiro evento
 * de scores chegar no worker de ingestão, roda a query do raw_events,
 * cola o payload aqui, e a gente fecha essa função com valor confirmado.
 *
 * Por segurança, até lá: se não reconhecer o formato do evento com certeza,
 * retorna null (não decide nada) em vez de arriscar um palpite errado sobre
 * quem fez gol. Falhar quieto é melhor que resolver um desafio errado.
 */
export function isGoalEvent(payload: any): boolean {
  const action = String(payload.action ?? payload.Action ?? "").toLowerCase();
  return action.includes("goal");
}

export function resolveGoalScorer(payload: any): "participant1" | "participant2" | null {
  if (payload.participant1IsHome === true) return "participant1";
  if (payload.participant1IsHome === false) return "participant2";
  return null;
}