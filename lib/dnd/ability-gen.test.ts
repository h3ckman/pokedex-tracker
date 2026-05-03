import {
  STANDARD_ARRAY,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  pointBuyCost,
  totalPointBuyCost,
  isValidPointBuy,
  roll4d6DropLowest,
  rollStandard4d6DropLowest,
  priorityForClass,
  assignScoresForClass,
  defaultAbilities,
  pointBuyStartingScores,
} from "./ability-gen";
import { getClass } from "./classes";

describe("ability-gen", () => {
  describe("STANDARD_ARRAY", () => {
    test("matches 5e standard array", () => {
      expect([...STANDARD_ARRAY]).toEqual([15, 14, 13, 12, 10, 8]);
    });
  });

  describe("pointBuyCost", () => {
    test("returns expected costs", () => {
      expect(pointBuyCost(8)).toBe(0);
      expect(pointBuyCost(10)).toBe(2);
      expect(pointBuyCost(13)).toBe(5);
      expect(pointBuyCost(14)).toBe(7);
      expect(pointBuyCost(15)).toBe(9);
    });

    test("returns infinity for out-of-range scores", () => {
      expect(pointBuyCost(7)).toBe(Number.POSITIVE_INFINITY);
      expect(pointBuyCost(16)).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe("totalPointBuyCost / isValidPointBuy", () => {
    test("starting all-8 spread costs 0", () => {
      expect(totalPointBuyCost(pointBuyStartingScores())).toBe(0);
    });

    test("standard 15/15/15/8/8/8 spread is exactly the budget", () => {
      const scores = { STR: 15, DEX: 15, CON: 15, INT: 8, WIS: 8, CHA: 8 };
      expect(totalPointBuyCost(scores)).toBe(POINT_BUY_BUDGET);
      expect(isValidPointBuy(scores)).toBe(true);
    });

    test("rejects spreads above budget", () => {
      const scores = { STR: 15, DEX: 15, CON: 15, INT: 9, WIS: 8, CHA: 8 };
      expect(isValidPointBuy(scores)).toBe(false);
    });

    test("rejects scores outside [min, max]", () => {
      const tooLow = { STR: 7, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 };
      expect(isValidPointBuy(tooLow)).toBe(false);
      expect(POINT_BUY_MIN).toBe(8);
      expect(POINT_BUY_MAX).toBe(15);
    });
  });

  describe("roll4d6DropLowest", () => {
    test("yields 3-18", () => {
      for (let i = 0; i < 50; i++) {
        const v = roll4d6DropLowest();
        expect(v).toBeGreaterThanOrEqual(3);
        expect(v).toBeLessThanOrEqual(18);
      }
    });

    test("rollStandard4d6DropLowest returns 6 values", () => {
      const arr = rollStandard4d6DropLowest();
      expect(arr).toHaveLength(6);
      arr.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(3);
        expect(v).toBeLessThanOrEqual(18);
      });
    });
  });

  describe("priorityForClass", () => {
    test("Wizard puts INT first", () => {
      const wiz = getClass("Wizard")!;
      expect(priorityForClass(wiz)[0]).toBe("INT");
    });

    test("Barbarian puts STR first", () => {
      const barb = getClass("Barbarian")!;
      expect(priorityForClass(barb)[0]).toBe("STR");
    });

    test("priority always covers all 6 abilities", () => {
      const fighter = getClass("Fighter")!;
      const p = priorityForClass(fighter);
      expect(new Set(p).size).toBe(6);
    });
  });

  describe("assignScoresForClass", () => {
    test("Wizard with standard array gets 15 INT", () => {
      const wiz = getClass("Wizard")!;
      const result = assignScoresForClass(STANDARD_ARRAY, wiz);
      expect(result.INT).toBe(15);
    });

    test("Barbarian with standard array gets 15 STR, 14 CON", () => {
      const barb = getClass("Barbarian")!;
      const result = assignScoresForClass(STANDARD_ARRAY, barb);
      expect(result.STR).toBe(15);
      expect(result.CON).toBe(14);
    });

    test("Rogue with standard array gets 15 DEX", () => {
      const rogue = getClass("Rogue")!;
      const result = assignScoresForClass(STANDARD_ARRAY, rogue);
      expect(result.DEX).toBe(15);
    });

    test("returns all 6 abilities", () => {
      const cleric = getClass("Cleric")!;
      const result = assignScoresForClass(STANDARD_ARRAY, cleric);
      expect(Object.keys(result).sort()).toEqual(
        ["CHA", "CON", "DEX", "INT", "STR", "WIS"],
      );
    });
  });

  describe("defaultAbilities", () => {
    test("returns all 10s", () => {
      const d = defaultAbilities();
      expect(d).toEqual({ STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 });
    });
  });
});
