import { describe, it, expect } from "vitest";
import { isGoalEvent, resolveGoalScorer } from "./scoring-adapter";

const realGoalEvent = {
  FixtureId: 18241006,
  Action: "goal",
  Participant: 2,
  Data: { GoalType: "Head", PlayerId: 948167 },
};

const realNonGoalEvent = {
  FixtureId: 18241006,
  Action: "corner",
  Participant: 1,
};

describe("isGoalEvent", () => {
  it("reconhece um gol real capturado da TxLINE", () => {
    expect(isGoalEvent(realGoalEvent)).toBe(true);
  });

  it("não confunde outra ação com gol", () => {
    expect(isGoalEvent(realNonGoalEvent)).toBe(false);
  });
});

describe("resolveGoalScorer", () => {
  it("identifica o participant2 como quem marcou, no gol real", () => {
    expect(resolveGoalScorer(realGoalEvent)).toBe("participant2");
  });

  it("retorna null se o campo Participant não vier", () => {
    expect(resolveGoalScorer({ Action: "goal" })).toBe(null);
  });
});