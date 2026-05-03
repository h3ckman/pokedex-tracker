const userFindUnique = jest.fn();
const userCreate = jest.fn();
const userUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...a: unknown[]) => userFindUnique(...a),
      create: (...a: unknown[]) => userCreate(...a),
      update: (...a: unknown[]) => userUpdate(...a),
    },
  },
}));

const hashPasswordMock = jest.fn();
jest.mock("@/lib/auth/password", () => ({
  hashPassword: (...a: unknown[]) => hashPasswordMock(...a),
}));

const createSessionMock = jest.fn();
jest.mock("@/lib/auth/session", () => ({
  createSession: (...a: unknown[]) => createSessionMock(...a),
}));

const logAuditMock = jest.fn();
jest.mock("@/lib/auth/audit", () => ({
  logAudit: (...a: unknown[]) => logAuditMock(...a),
}));

const createCodeMock = jest.fn();
const consumeCodeMock = jest.fn();
const canSendCodeMock = jest.fn();
jest.mock("@/lib/auth/verification", () => ({
  CODE_TTL_MS: 600_000,
  createVerificationCode: (...a: unknown[]) => createCodeMock(...a),
  consumeVerificationCode: (...a: unknown[]) => consumeCodeMock(...a),
  canSendCode: (...a: unknown[]) => canSendCodeMock(...a),
}));

const sendEmailMock = jest.fn();
jest.mock("@/lib/email/send", () => ({
  sendEmail: (...a: unknown[]) => sendEmailMock(...a),
}));

class RedirectError extends Error {
  constructor(public path: string) {
    super(`REDIRECT:${path}`);
  }
}
const redirectMock = jest.fn((path: string) => {
  throw new RedirectError(path);
});
jest.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

import {
  registerAction,
  resendVerificationAction,
  verifyEmailAction,
} from "@/lib/actions/register";

beforeEach(() => {
  userFindUnique.mockReset();
  userCreate.mockReset();
  userUpdate.mockReset();
  hashPasswordMock.mockReset();
  createSessionMock.mockReset();
  logAuditMock.mockReset();
  createCodeMock.mockReset();
  consumeCodeMock.mockReset();
  canSendCodeMock.mockReset();
  sendEmailMock.mockReset();
  redirectMock.mockClear();
});

function fd(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.append(k, v);
  return f;
}

describe("registerAction", () => {
  it("rejects short passwords", async () => {
    const res = await registerAction(
      { error: null },
      fd({ name: "Alex", email: "a@b.com", password: "short" }),
    );
    expect(res.error).toMatch(/8 characters/i);
    expect(userCreate).not.toHaveBeenCalled();
  });

  it("rejects when an account already exists", async () => {
    userFindUnique.mockResolvedValue({ id: "u1" });
    const res = await registerAction(
      { error: null },
      fd({ name: "Alex", email: "a@b.com", password: "password123" }),
    );
    expect(res.error).toMatch(/already exists/i);
  });

  it("creates user, sends code, audits, and redirects to /verify-email", async () => {
    userFindUnique.mockResolvedValue(null);
    hashPasswordMock.mockResolvedValue("HASH");
    userCreate.mockResolvedValue({ id: "u-new" });
    createCodeMock.mockResolvedValue({ code: "123456", id: "code-1" });
    sendEmailMock.mockResolvedValue(undefined);

    await expect(
      registerAction(
        { error: null },
        fd({ name: "Alex", email: "Alex@Example.com", password: "password123" }),
      ),
    ).rejects.toThrow(/REDIRECT:\/verify-email\?email=alex%40example\.com/);

    expect(userCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "alex@example.com",
          passwordHash: "HASH",
          role: "VIEWER",
          emailVerified: null,
        }),
      }),
    );
    expect(createCodeMock).toHaveBeenCalledWith("u-new");
    expect(sendEmailMock).toHaveBeenCalled();
    expect(logAuditMock).toHaveBeenCalledWith("u-new", "REGISTER_EMAIL");
  });
});

describe("verifyEmailAction", () => {
  it("rejects malformed code", async () => {
    const res = await verifyEmailAction(
      { error: null },
      fd({ email: "a@b.com", code: "abc" }),
    );
    expect(res.error).toMatch(/6-digit/);
  });

  it("returns generic error when user is missing or already verified", async () => {
    userFindUnique.mockResolvedValue({
      id: "u1",
      emailVerified: new Date(),
      active: true,
    });
    const res = await verifyEmailAction(
      { error: null },
      fd({ email: "a@b.com", code: "123456" }),
    );
    expect(res.error).toBe("Invalid code");
  });

  it("maps consume reasons to user-friendly errors", async () => {
    userFindUnique.mockResolvedValue({
      id: "u1",
      emailVerified: null,
      active: true,
    });
    consumeCodeMock.mockResolvedValueOnce({ ok: false, reason: "expired" });
    expect(
      (
        await verifyEmailAction(
          { error: null },
          fd({ email: "a@b.com", code: "123456" }),
        )
      ).error,
    ).toMatch(/expired/i);

    consumeCodeMock.mockResolvedValueOnce({ ok: false, reason: "exhausted" });
    expect(
      (
        await verifyEmailAction(
          { error: null },
          fd({ email: "a@b.com", code: "123456" }),
        )
      ).error,
    ).toMatch(/too many/i);

    consumeCodeMock.mockResolvedValueOnce({ ok: false, reason: "invalid" });
    expect(
      (
        await verifyEmailAction(
          { error: null },
          fd({ email: "a@b.com", code: "123456" }),
        )
      ).error,
    ).toBe("Invalid code");
  });

  it("verifies, creates session, audits, and redirects to /", async () => {
    userFindUnique.mockResolvedValue({
      id: "u1",
      emailVerified: null,
      active: true,
    });
    consumeCodeMock.mockResolvedValue({ ok: true });
    userUpdate.mockResolvedValue({});

    await expect(
      verifyEmailAction(
        { error: null },
        fd({ email: "a@b.com", code: "123456" }),
      ),
    ).rejects.toThrow("REDIRECT:/");

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ emailVerified: expect.any(Date) }),
    });
    expect(createSessionMock).toHaveBeenCalledWith("u1");
    expect(logAuditMock).toHaveBeenCalledWith("u1", "EMAIL_VERIFIED");
  });
});

describe("resendVerificationAction", () => {
  it("returns silent success for unknown email", async () => {
    userFindUnique.mockResolvedValue(null);
    const res = await resendVerificationAction(
      { error: null },
      fd({ email: "ghost@example.com" }),
    );
    expect(res).toEqual({ error: null });
    expect(createCodeMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("returns rate-limit error when canSendCode rejects", async () => {
    userFindUnique.mockResolvedValue({
      id: "u1",
      emailVerified: null,
      active: true,
    });
    canSendCodeMock.mockResolvedValue({ ok: false, retryAfterSeconds: 42 });
    const res = await resendVerificationAction(
      { error: null },
      fd({ email: "a@b.com" }),
    );
    expect(res.error).toMatch(/42s/);
    expect(createCodeMock).not.toHaveBeenCalled();
  });

  it("creates a new code and sends email when allowed", async () => {
    userFindUnique.mockResolvedValue({
      id: "u1",
      emailVerified: null,
      active: true,
    });
    canSendCodeMock.mockResolvedValue({ ok: true });
    createCodeMock.mockResolvedValue({ code: "654321", id: "c-1" });
    sendEmailMock.mockResolvedValue(undefined);

    const res = await resendVerificationAction(
      { error: null },
      fd({ email: "a@b.com" }),
    );
    expect(res).toEqual({ error: null });
    expect(createCodeMock).toHaveBeenCalledWith("u1");
    expect(sendEmailMock).toHaveBeenCalled();
    expect(logAuditMock).toHaveBeenCalledWith("u1", "VERIFICATION_RESENT");
  });
});
