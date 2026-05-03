import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const hash = await hashPassword("hunter2!");
    expect(await verifyPassword("hunter2!", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("hunter2!");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces different hashes for the same input (salted)", async () => {
    const a = await hashPassword("samesame");
    const b = await hashPassword("samesame");
    expect(a).not.toBe(b);
  });
});
