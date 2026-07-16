/**
 * Confirmado contra dado real capturado via /api/scores/historical
 * (fixture 18241006, evento de gol real, "Action": "goal", "Participant": 2).
 * A doc pública mostrava um schema genérico (dataSoccer.Goal) que NÃO bate
 * com a resposta real da API — o formato real usa campos na raiz do objeto.
 */
export function isGoalEvent(payload: any): boolean {
  return payload.Action === "goal";
}

export function resolveGoalScorer(payload: any): "participant1" | "participant2" | null {
  if (payload.Participant === 1) return "participant1";
  if (payload.Participant === 2) return "participant2";
  return null;
}