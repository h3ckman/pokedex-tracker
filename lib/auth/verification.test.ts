const findFirst = jest.fn();
const create = jest.fn();
const update = jest.fn();
const count = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationCode: {
      findFirst: (...a: unknown[]) => findFirst(...a),
      create: (...a: unknown[]) => create(...a),
      update: (...a: unknown[]) => update(...a),
      count: (...a: unknown[]) => count(...a),
    },
  },
}));

import {
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  canSendCode,
  consumeVerificationCode,
  createVerificationCode,
  generateCode,
  hashCode,
} from "@/lib/auth/verification";

const ORIGINAL_SECRET = process.env.AUTH_SECRET;

beforeEach(() => {
  process.env.AUTH_SECRET =
    "test-secret-must-be-at-least-32-characters-long";
  findFirst.mockReset();
  create.mockReset();
  update.mockReset();
  count.mockReset();
});

afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

describe("generateCode", () => {
  it("returns a zero-padded 6-digit numeric string", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe("hashCode", () => {
  it("is deterministic for the same input", () => {
    expect(hashCode("123456", "user-1")).toBe(hashCode("123456", "user-1"));
  });
  it("changes when userId changes (peppered)", () => {
    expect(hashCode("123456", "user-1")).not.toBe(
      hashCode("123456", "user-2"),
    );
  });
});

describe("createVerificationCode", () => {
  it("persists a hashed code with a 10-minute expiry and returns plaintext", async () => {
    create.mockResolvedValue({ id: "rec-1" });
    const before = Date.now();
    const result = await createVerificationCode("user-1");
    const after = Date.now();

    expect(result.code).toMatch(/^\d{6}$/);
    expect(result.id).toBe("rec-1");
    const arg = create.mock.calls[0][0];
    expect(arg.data.userId).toBe("user-1");
    expect(arg.data.codeHash).toBe(hashCode(result.code, "user-1"));
    const expiresMs = arg.data.expiresAt.getTime();
    expect(expiresMs).toBeGreaterThanOrEqual(before + CODE_TTL_MS - 50);
    expect(expiresMs).toBeLessThanOrEqual(after + CODE_TTL_MS + 50);
  });
});

describe("consumeVerificationCode", () => {
  it("returns not_found when no code exists", async () => {
    findFirst.mockResolvedValue(null);
    const res = await consumeVerificationCode("user-1", "123456");
    expect(res).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns expired when the code has aged past TTL", async () => {
    findFirst.mockResolvedValue({
      id: "rec-1",
      codeHash: hashCode("123456", "user-1"),
      expiresAt: new Date(Date.now() - 1000),
      attempts: 0,
    });
    const res = await consumeVerificationCode("user-1", "123456");
    expect(res).toEqual({ ok: false, reason: "expired" });
    expect(update).not.toHaveBeenCalled();
  });

  it("returns exhausted when attempts have been spent", async () => {
    findFirst.mockResolvedValue({
      id: "rec-1",
      codeHash: hashCode("123456", "user-1"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: MAX_ATTEMPTS,
    });
    const res = await consumeVerificationCode("user-1", "123456");
    expect(res).toEqual({ ok: false, reason: "exhausted" });
    expect(update).not.toHaveBeenCalled();
  });

  it("increments attempts and returns invalid on hash mismatch", async () => {
    findFirst.mockResolvedValue({
      id: "rec-1",
      codeHash: hashCode("123456", "user-1"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 1,
    });
    update.mockResolvedValue({});
    const res = await consumeVerificationCode("user-1", "999999");
    expect(res).toEqual({ ok: false, reason: "invalid" });
    expect(update).toHaveBeenCalledWith({
      where: { id: "rec-1" },
      data: { attempts: { increment: 1 } },
    });
  });

  it("returns exhausted when the failing attempt was the last one", async () => {
    findFirst.mockResolvedValue({
      id: "rec-1",
      codeHash: hashCode("123456", "user-1"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: MAX_ATTEMPTS - 1,
    });
    update.mockResolvedValue({});
    const res = await consumeVerificationCode("user-1", "999999");
    expect(res).toEqual({ ok: false, reason: "exhausted" });
  });

  it("marks consumed and returns ok on success", async () => {
    findFirst.mockResolvedValue({
      id: "rec-1",
      codeHash: hashCode("123456", "user-1"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });
    update.mockResolvedValue({});
    const res = await consumeVerificationCode("user-1", "123456");
    expect(res).toEqual({ ok: true });
    const arg = update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "rec-1" });
    expect(arg.data.consumedAt).toBeInstanceOf(Date);
    expect(arg.data.attempts).toEqual({ increment: 1 });
  });
});

describe("canSendCode", () => {
  it("allows sending when no codes have been created", async () => {
    findFirst.mockResolvedValue(null);
    count.mockResolvedValue(0);
    expect(await canSendCode("user-1")).toEqual({ ok: true });
  });

  it("rejects when within the cooldown window", async () => {
    findFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 10_000),
    });
    const res = await canSendCode("user-1");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.retryAfterSeconds).toBeGreaterThan(0);
      expect(res.retryAfterSeconds).toBeLessThanOrEqual(
        Math.ceil(RESEND_COOLDOWN_MS / 1000),
      );
    }
  });

  it("rejects when hourly cap is reached", async () => {
    findFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    });
    count.mockResolvedValue(5);
    const res = await canSendCode("user-1");
    expect(res).toEqual({ ok: false, retryAfterSeconds: 3600 });
  });
});
