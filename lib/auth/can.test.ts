import { can } from "@/lib/auth/can";
import type { Role } from "@/lib/generated/prisma/client";

describe("can()", () => {
  const roles: Role[] = ["VIEWER", "TECHNICIAN", "SITE_MANAGER", "ADMIN"];

  it("ADMIN can do everything", () => {
    for (const r of roles) {
      expect(can("ADMIN", r)).toBe(true);
    }
  });

  it("VIEWER can only do VIEWER", () => {
    expect(can("VIEWER", "VIEWER")).toBe(true);
    expect(can("VIEWER", "TECHNICIAN")).toBe(false);
    expect(can("VIEWER", "SITE_MANAGER")).toBe(false);
    expect(can("VIEWER", "ADMIN")).toBe(false);
  });

  it("TECHNICIAN can do TECHNICIAN and below, not above", () => {
    expect(can("TECHNICIAN", "VIEWER")).toBe(true);
    expect(can("TECHNICIAN", "TECHNICIAN")).toBe(true);
    expect(can("TECHNICIAN", "SITE_MANAGER")).toBe(false);
    expect(can("TECHNICIAN", "ADMIN")).toBe(false);
  });

  it("SITE_MANAGER can do SITE_MANAGER and below, not ADMIN", () => {
    expect(can("SITE_MANAGER", "TECHNICIAN")).toBe(true);
    expect(can("SITE_MANAGER", "SITE_MANAGER")).toBe(true);
    expect(can("SITE_MANAGER", "ADMIN")).toBe(false);
  });
});
