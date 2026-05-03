import { rollDice } from "./dice";

describe("rollDice", () => {
  test("parses basic roll", () => {
    const result = rollDice("1d20");
    if ("error" in result) throw new Error(result.error);
    expect(result.rolls).toHaveLength(1);
    expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeLessThanOrEqual(20);
    expect(result.modifier).toBe(0);
    expect(result.total).toBe(result.rolls[0]);
  });

  test("parses modifier", () => {
    const result = rollDice("2d6+3");
    if ("error" in result) throw new Error(result.error);
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(3);
    expect(result.total).toBe(result.rolls.reduce((a, b) => a + b, 0) + 3);
  });

  test("handles negative modifier", () => {
    const result = rollDice("1d8-2");
    if ("error" in result) throw new Error(result.error);
    expect(result.modifier).toBe(-2);
  });

  test("advantage keeps high on d20", () => {
    const result = rollDice("1d20", "advantage");
    if ("error" in result) throw new Error(result.error);
    expect(result.rolls).toHaveLength(2);
    expect(result.kept).toBe("high");
    expect(result.total).toBe(Math.max(...result.rolls));
  });

  test("disadvantage keeps low on d20", () => {
    const result = rollDice("1d20", "disadvantage");
    if ("error" in result) throw new Error(result.error);
    expect(result.rolls).toHaveLength(2);
    expect(result.kept).toBe("low");
    expect(result.total).toBe(Math.min(...result.rolls));
  });

  test("rejects malformed input", () => {
    const result = rollDice("bad");
    expect("error" in result).toBe(true);
  });

  test("rejects extreme count", () => {
    const result = rollDice("500d6");
    expect("error" in result).toBe(true);
  });
});
