export type DiceRollResult = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
  kept?: "high" | "low";
};

const DICE_RE = /^\s*(\d+)?d(\d+)\s*([+-]\s*\d+)?\s*$/i;

export function rollDice(
  expression: string,
  advantage: "normal" | "advantage" | "disadvantage" = "normal",
): DiceRollResult | { error: string } {
  const match = expression.trim().match(DICE_RE);
  if (!match) return { error: "Use format like 1d20+5 or 3d6" };

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, ""), 10) : 0;

  if (count < 1 || count > 100) return { error: "Count must be 1-100" };
  if (sides < 2 || sides > 1000) return { error: "Sides must be 2-1000" };

  if (advantage !== "normal" && count === 1 && sides === 20) {
    const a = roll(sides);
    const b = roll(sides);
    const kept = advantage === "advantage" ? Math.max(a, b) : Math.min(a, b);
    return {
      expression,
      rolls: [a, b],
      modifier,
      total: kept + modifier,
      kept: advantage === "advantage" ? "high" : "low",
    };
  }

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(roll(sides));
  const sum = rolls.reduce((a, b) => a + b, 0);
  return { expression, rolls, modifier, total: sum + modifier };
}

function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}
