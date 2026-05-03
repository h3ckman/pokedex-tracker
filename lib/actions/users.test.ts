jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const authorizeMock = jest.fn();
jest.mock("@/lib/auth/can", () => ({
  authorize: (...a: unknown[]) => authorizeMock(...a),
}));

const logAuditMock = jest.fn();
jest.mock("@/lib/auth/audit", () => ({
  logAudit: (...a: unknown[]) => logAuditMock(...a),
}));

const userUpdate = jest.fn();
const sessionDeleteMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: (...a: unknown[]) => userUpdate(...a) },
    session: { deleteMany: (...a: unknown[]) => sessionDeleteMany(...a) },
  },
}));

import { changeUserRole, deactivateUser } from "@/lib/actions/users";

const adminGuard = {
  data: { userId: "admin-1", role: "ADMIN" },
  error: null,
};

beforeEach(() => {
  authorizeMock.mockReset();
  logAuditMock.mockReset();
  userUpdate.mockReset();
  sessionDeleteMany.mockReset();
});

describe("changeUserRole", () => {
  it("rejects non-admin callers", async () => {
    authorizeMock.mockResolvedValue({ data: null, error: "Forbidden" });
    const res = await changeUserRole("user-2", "ADMIN");
    expect(res.error).toBe("Forbidden");
    expect(userUpdate).not.toHaveBeenCalled();
    expect(logAuditMock).not.toHaveBeenCalled();
  });

  it("updates the user's role and audits when admin", async () => {
    authorizeMock.mockResolvedValue(adminGuard);
    userUpdate.mockResolvedValue({ id: "user-2", role: "TECHNICIAN" });
    const res = await changeUserRole("user-2", "TECHNICIAN");
    expect(res.error).toBeNull();
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { role: "TECHNICIAN" },
      select: { id: true, role: true },
    });
    expect(logAuditMock).toHaveBeenCalledWith("admin-1", "ROLE_CHANGE", {
      targetUserId: "user-2",
      role: "TECHNICIAN",
    });
  });
});

describe("deactivateUser", () => {
  it("blocks self-deactivation", async () => {
    authorizeMock.mockResolvedValue(adminGuard);
    const res = await deactivateUser("admin-1");
    expect(res.error).toMatch(/own account/i);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("deactivates and clears sessions for another user", async () => {
    authorizeMock.mockResolvedValue(adminGuard);
    userUpdate.mockResolvedValue({ id: "user-2" });
    sessionDeleteMany.mockResolvedValue({ count: 1 });
    const res = await deactivateUser("user-2");
    expect(res.error).toBeNull();
    expect(userUpdate).toHaveBeenCalled();
    expect(sessionDeleteMany).toHaveBeenCalledWith({
      where: { userId: "user-2" },
    });
    expect(logAuditMock).toHaveBeenCalledWith("admin-1", "USER_DEACTIVATED", {
      targetUserId: "user-2",
    });
  });
});
