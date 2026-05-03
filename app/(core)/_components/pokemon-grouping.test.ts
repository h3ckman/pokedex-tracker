import {
  filterPokemon,
  groupPokemon,
  type SidebarPokemon,
} from "./pokemon-grouping";

function p(
  partial: Partial<SidebarPokemon> & {
    nationalDexNumber: number;
    name: string;
  },
): SidebarPokemon {
  return {
    id: `id-${partial.nationalDexNumber}`,
    generation: 1,
    region: "KANTO",
    spriteUrl: null,
    entries: [],
    ...partial,
  };
}

describe("filterPokemon", () => {
  const list: SidebarPokemon[] = [
    p({ nationalDexNumber: 1, name: "Bulbasaur" }),
    p({ nationalDexNumber: 4, name: "Charmander" }),
    p({ nationalDexNumber: 25, name: "Pikachu" }),
    p({ nationalDexNumber: 250, name: "Ho-Oh" }),
  ];

  it("returns identity for empty query", () => {
    expect(filterPokemon(list, "")).toBe(list);
    expect(filterPokemon(list, "   ")).toBe(list);
  });

  it("matches name case-insensitive substring", () => {
    expect(filterPokemon(list, "char").map((x) => x.name)).toEqual([
      "Charmander",
    ]);
    expect(filterPokemon(list, "PIKA").map((x) => x.name)).toEqual(["Pikachu"]);
  });

  it("matches dex number prefix", () => {
    expect(filterPokemon(list, "25").map((x) => x.nationalDexNumber)).toEqual([
      25, 250,
    ]);
  });

  it("strips leading # in dex query", () => {
    expect(filterPokemon(list, "#1").map((x) => x.nationalDexNumber)).toEqual([
      1,
    ]);
  });

  it("does not treat letters as dex prefix", () => {
    expect(filterPokemon(list, "bulb").map((x) => x.name)).toEqual([
      "Bulbasaur",
    ]);
  });
});

describe("groupPokemon pokedex mode", () => {
  it("buckets by 50 with zero-padded labels", () => {
    const list = [
      p({ nationalDexNumber: 1, name: "Bulbasaur" }),
      p({ nationalDexNumber: 50, name: "Diglett" }),
      p({ nationalDexNumber: 51, name: "Dugtrio" }),
      p({ nationalDexNumber: 1000, name: "Gholdengo" }),
    ];
    const groups = groupPokemon(list, "pokedex");
    expect(groups).toHaveLength(3);
    expect(groups[0].label).toBe("#0001 – #0050");
    expect(groups[0].pokemon.map((p) => p.nationalDexNumber)).toEqual([1, 50]);
    expect(groups[1].label).toBe("#0051 – #0100");
    expect(groups[1].pokemon.map((p) => p.nationalDexNumber)).toEqual([51]);
    expect(groups[2].label).toBe("#0951 – #1000");
  });
});

describe("groupPokemon alphabetical mode", () => {
  it("buckets by first letter, drops empty buckets", () => {
    const list = [
      p({ nationalDexNumber: 1, name: "Bulbasaur" }),
      p({ nationalDexNumber: 4, name: "Charmander" }),
      p({ nationalDexNumber: 6, name: "Charizard" }),
    ];
    const groups = groupPokemon(list, "alphabetical");
    expect(groups.map((g) => g.label)).toEqual(["B", "C"]);
    expect(groups[1].pokemon.map((p) => p.name)).toEqual([
      "Charizard",
      "Charmander",
    ]);
  });
});

describe("groupPokemon region mode", () => {
  it("buckets by region in canonical order with friendly labels", () => {
    const list = [
      p({ nationalDexNumber: 1, name: "Bulbasaur", region: "KANTO" }),
      p({ nationalDexNumber: 152, name: "Chikorita", region: "JOHTO" }),
      p({ nationalDexNumber: 906, name: "Sprigatito", region: "PALDEA" }),
    ];
    const groups = groupPokemon(list, "region");
    expect(groups.map((g) => g.label)).toEqual(["Kanto", "Johto", "Paldea"]);
  });
});

describe("groupPokemon game-system mode", () => {
  it("places a Pokémon under each distinct system; dedupes within Pokémon", () => {
    const list = [
      p({
        nationalDexNumber: 1,
        name: "Bulbasaur",
        entries: [
          { gameSystem: "GAME_BOY" },
          { gameSystem: "GAME_BOY" },
          { gameSystem: "NINTENDO_SWITCH" },
        ],
      }),
      p({
        nationalDexNumber: 906,
        name: "Sprigatito",
        entries: [{ gameSystem: "NINTENDO_SWITCH" }],
      }),
    ];
    const groups = groupPokemon(list, "game-system");
    expect(groups.map((g) => g.label)).toEqual(["Game Boy", "Nintendo Switch"]);
    expect(groups[0].pokemon.map((p) => p.name)).toEqual(["Bulbasaur"]);
    expect(groups[1].pokemon.map((p) => p.name)).toEqual([
      "Bulbasaur",
      "Sprigatito",
    ]);
  });

  it("drops Pokémon with no entries", () => {
    const list = [p({ nationalDexNumber: 1, name: "Bulbasaur", entries: [] })];
    expect(groupPokemon(list, "game-system")).toEqual([]);
  });
});
