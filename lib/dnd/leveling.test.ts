import {
  levelForXp,
  proficiencyBonus,
  spellSlotsForLevel,
  xpToNextLevel,
} from "./leveling";

describe("leveling", () => {
  test("levelForXp matches 5e thresholds", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(299)).toBe(1);
    expect(levelForXp(300)).toBe(2);
    expect(levelForXp(6500)).toBe(5);
    expect(levelForXp(14000)).toBe(6);
    expect(levelForXp(355000)).toBe(20);
    expect(levelForXp(999_999)).toBe(20);
  });

  test("xpToNextLevel returns null at 20", () => {
    expect(xpToNextLevel(1)).toBe(300);
    expect(xpToNextLevel(20)).toBeNull();
  });

  test("proficiencyBonus by level", () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(9)).toBe(4);
    expect(proficiencyBonus(17)).toBe(6);
    expect(proficiencyBonus(20)).toBe(6);
  });

  test("spell slots for full caster at level 5", () => {
    expect(spellSlotsForLevel("full", 5)).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });

  test("spell slots for half caster at level 5", () => {
    expect(spellSlotsForLevel("half", 5)).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
  });

  test("spell slots for pact caster at level 10", () => {
    expect(spellSlotsForLevel("pact", 10)).toEqual([0, 0, 0, 0, 2, 0, 0, 0, 0]);
  });

  test("spell slots for non-caster is zeros", () => {
    expect(spellSlotsForLevel("none", 10)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
