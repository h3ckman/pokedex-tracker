jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const authorizeMock = jest.fn();
jest.mock("@/lib/auth/can", () => ({
  authorize: (...a: unknown[]) => authorizeMock(...a),
}));

const pokemonFindUnique = jest.fn();
const userPokemonUpsert = jest.fn();
const userPokemonDeleteMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pokemon: { findUnique: (...a: unknown[]) => pokemonFindUnique(...a) },
    userPokemon: {
      upsert: (...a: unknown[]) => userPokemonUpsert(...a),
      deleteMany: (...a: unknown[]) => userPokemonDeleteMany(...a),
    },
  },
}));

import { setPokemonStatus } from "@/lib/actions/pokedex";

const viewerGuard = {
  data: { userId: "user-1", role: "VIEWER" },
  error: null,
};

beforeEach(() => {
  authorizeMock.mockReset();
  pokemonFindUnique.mockReset();
  userPokemonUpsert.mockReset();
  userPokemonDeleteMany.mockReset();
});

describe("setPokemonStatus", () => {
  it("rejects unauthenticated callers", async () => {
    authorizeMock.mockResolvedValue({ data: null, error: "Unauthorized" });
    const res = await setPokemonStatus("p-1", "caught");
    expect(res.error).toBe("Unauthorized");
    expect(userPokemonUpsert).not.toHaveBeenCalled();
    expect(userPokemonDeleteMany).not.toHaveBeenCalled();
  });

  it("rejects invalid status", async () => {
    authorizeMock.mockResolvedValue(viewerGuard);
    pokemonFindUnique.mockResolvedValue({ nationalDexNumber: 1 });
    const res = await setPokemonStatus("p-1", "wrong" as never);
    expect(res.error).toBeTruthy();
    expect(userPokemonUpsert).not.toHaveBeenCalled();
  });

  it("returns an error when the pokemon does not exist", async () => {
    authorizeMock.mockResolvedValue(viewerGuard);
    pokemonFindUnique.mockResolvedValue(null);
    const res = await setPokemonStatus("p-missing", "seen");
    expect(res.error).toMatch(/not found/i);
    expect(userPokemonUpsert).not.toHaveBeenCalled();
  });

  it("deletes the row when status is 'none'", async () => {
    authorizeMock.mockResolvedValue(viewerGuard);
    pokemonFindUnique.mockResolvedValue({ nationalDexNumber: 25 });
    userPokemonDeleteMany.mockResolvedValue({ count: 1 });
    const res = await setPokemonStatus("p-25", "none");
    expect(res.error).toBeNull();
    expect(userPokemonDeleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", pokemonId: "p-25" },
    });
    expect(userPokemonUpsert).not.toHaveBeenCalled();
  });

  it("upserts seen=true, caught=false on 'seen'", async () => {
    authorizeMock.mockResolvedValue(viewerGuard);
    pokemonFindUnique.mockResolvedValue({ nationalDexNumber: 1 });
    userPokemonUpsert.mockResolvedValue({});
    const res = await setPokemonStatus("p-1", "seen");
    expect(res.error).toBeNull();
    const arg = userPokemonUpsert.mock.calls[0][0];
    expect(arg.where).toEqual({
      userId_pokemonId: { userId: "user-1", pokemonId: "p-1" },
    });
    expect(arg.create).toMatchObject({
      userId: "user-1",
      pokemonId: "p-1",
      seen: true,
      caught: false,
    });
    expect(arg.update).toMatchObject({
      seen: true,
      caught: false,
      caughtAt: null,
    });
  });

  it("upserts seen=true, caught=true on 'caught' (caught implies seen)", async () => {
    authorizeMock.mockResolvedValue(viewerGuard);
    pokemonFindUnique.mockResolvedValue({ nationalDexNumber: 4 });
    userPokemonUpsert.mockResolvedValue({});
    const res = await setPokemonStatus("p-4", "caught");
    expect(res.error).toBeNull();
    const arg = userPokemonUpsert.mock.calls[0][0];
    expect(arg.create).toMatchObject({
      userId: "user-1",
      pokemonId: "p-4",
      seen: true,
      caught: true,
    });
    expect(arg.create.seenAt).toBeInstanceOf(Date);
    expect(arg.create.caughtAt).toBeInstanceOf(Date);
    expect(arg.update).toMatchObject({ seen: true, caught: true });
    expect(arg.update.caughtAt).toBeInstanceOf(Date);
  });
});
