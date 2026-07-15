export type ChallengeType = "next_goal";

export type Challenge = {
  id: number;
  fixtureId: number;
  type: ChallengeType;
  opensAt: Date;
  closesAt: Date;
  status: "open" | "resolved" | "void";
  correctAnswer: string | null;
};

export type UserStats = {
  walletPubkey: string;
  currentStreak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
};

/**
 * Cria um novo desafio "próximo gol" com janela de resposta fixa.
 * windowSeconds é quanto tempo o usuário tem pra responder antes do desafio travar.
 */
export function createNextGoalChallenge(
  fixtureId: number,
  opensAt: Date,
  windowSeconds: number
): Omit<Challenge, "id"> {
  return {
    fixtureId,
    type: "next_goal",
    opensAt,
    closesAt: new Date(opensAt.getTime() + windowSeconds * 1000),
    status: "open",
    correctAnswer: null,
  };
}

/**
 * Decide se uma resposta ainda pode ser aceita, usando o timestamp do
 * EVENTO DO SERVIDOR TxLINE — nunca o relógio do navegador do usuário.
 * Isso é o que impede alguém de responder depois que o gol já saiu.
 */
export function isResponseWindowOpen(challenge: Challenge, serverEventTime: Date): boolean {
  if (challenge.status !== "open") return false;
  return serverEventTime.getTime() < challenge.closesAt.getTime();
}

/**
 * Resolve um desafio dado o resultado real, e retorna a lista de respostas
 * marcadas como certas ou erradas — sem mutar nada, só calcula.
 */
export function gradeResponses(
  responses: { walletPubkey: string; answer: string }[],
  correctAnswer: string
): { walletPubkey: string; answer: string; isCorrect: boolean }[] {
  return responses.map((r) => ({
    ...r,
    isCorrect: r.answer === correctAnswer,
  }));
}

/**
 * Aplica o resultado de uma resposta ao streak/score do usuário.
 * Acerto: streak sobe, e bestStreak atualiza se for um novo recorde.
 * Erro: streak zera, best e totais continuam contando.
 */
export function applyResultToStats(stats: UserStats, isCorrect: boolean): UserStats {
  const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
  return {
    ...stats,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    totalCorrect: stats.totalCorrect + (isCorrect ? 1 : 0),
    totalAnswered: stats.totalAnswered + 1,
  };
}

export function emptyStats(walletPubkey: string): UserStats {
  return { walletPubkey, currentStreak: 0, bestStreak: 0, totalCorrect: 0, totalAnswered: 0 };
}