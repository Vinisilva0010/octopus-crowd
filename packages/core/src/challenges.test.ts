import { describe, it, expect } from "vitest";
import {
  createNextGoalChallenge,
  isResponseWindowOpen,
  gradeResponses,
  applyResultToStats,
  emptyStats,
} from "./challenges";

describe("createNextGoalChallenge", () => {
  it("fecha a janela no horário certo", () => {
    const opensAt = new Date("2026-07-16T16:00:00Z");
    const challenge = createNextGoalChallenge(123, opensAt, 120);
    expect(challenge.closesAt.getTime()).toBe(opensAt.getTime() + 120_000);
    expect(challenge.status).toBe("open");
  });
});

describe("isResponseWindowOpen", () => {
  const base = createNextGoalChallenge(123, new Date("2026-07-16T16:00:00Z"), 60);
  const challenge = { ...base, id: 1 };

  it("aceita resposta dentro da janela", () => {
    const eventTime = new Date("2026-07-16T16:00:30Z");
    expect(isResponseWindowOpen(challenge, eventTime)).toBe(true);
  });

  it("rejeita resposta depois da janela fechar", () => {
    const eventTime = new Date("2026-07-16T16:01:01Z");
    expect(isResponseWindowOpen(challenge, eventTime)).toBe(false);
  });

  it("rejeita resposta se o desafio já não está mais aberto", () => {
    const resolved = { ...challenge, status: "resolved" as const };
    const eventTime = new Date("2026-07-16T16:00:10Z");
    expect(isResponseWindowOpen(resolved, eventTime)).toBe(false);
  });
});

describe("gradeResponses", () => {
  it("marca certo e errado corretamente", () => {
    const graded = gradeResponses(
      [
        { walletPubkey: "wallet_a", answer: "participant1" },
        { walletPubkey: "wallet_b", answer: "participant2" },
      ],
      "participant1"
    );
    expect(graded[0].isCorrect).toBe(true);
    expect(graded[1].isCorrect).toBe(false);
  });
});

describe("applyResultToStats", () => {
  it("acerto consecutivo sobe o streak e atualiza recorde", () => {
    let stats = emptyStats("wallet_a");
    stats = applyResultToStats(stats, true);
    stats = applyResultToStats(stats, true);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(2);
  });

  it("erro zera o streak mas mantém o recorde e os totais", () => {
    let stats = emptyStats("wallet_a");
    stats = applyResultToStats(stats, true);
    stats = applyResultToStats(stats, true);
    stats = applyResultToStats(stats, false);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(2);
    expect(stats.totalAnswered).toBe(3);
    expect(stats.totalCorrect).toBe(2);
  });
});