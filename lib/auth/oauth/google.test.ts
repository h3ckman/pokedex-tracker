import {
  GoogleOAuthError,
  buildAuthorizeUrl,
  exchangeCodeForToken,
  fetchUserinfo,
} from "@/lib/auth/oauth/google";

const ORIGINAL_ID = process.env.GOOGLE_CLIENT_ID;
const ORIGINAL_SECRET = process.env.GOOGLE_CLIENT_SECRET;

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = "client-id-xyz";
  process.env.GOOGLE_CLIENT_SECRET = "secret-xyz";
});

afterAll(() => {
  process.env.GOOGLE_CLIENT_ID = ORIGINAL_ID;
  process.env.GOOGLE_CLIENT_SECRET = ORIGINAL_SECRET;
});

describe("buildAuthorizeUrl", () => {
  it("includes the expected query parameters", () => {
    const url = buildAuthorizeUrl({
      state: "abc123",
      redirectUri: "http://localhost:3000/api/auth/google/callback",
    });
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(u.searchParams.get("client_id")).toBe("client-id-xyz");
    expect(u.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/google/callback",
    );
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("scope")).toBe("openid email profile");
    expect(u.searchParams.get("state")).toBe("abc123");
  });

  it("throws missing_config when env vars are missing", () => {
    delete process.env.GOOGLE_CLIENT_ID;
    expect(() =>
      buildAuthorizeUrl({ state: "x", redirectUri: "y" }),
    ).toThrow(GoogleOAuthError);
  });
});

describe("exchangeCodeForToken", () => {
  it("returns access and id tokens on success", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ access_token: "AT", id_token: "IT" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const result = await exchangeCodeForToken({
      code: "code-1",
      redirectUri: "http://localhost:3000/cb",
    });
    expect(result).toEqual({ accessToken: "AT", idToken: "IT" });
  });

  it("throws on non-2xx response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response("nope", { status: 400 }));
    await expect(
      exchangeCodeForToken({ code: "x", redirectUri: "y" }),
    ).rejects.toThrow(GoogleOAuthError);
  });

  it("throws when access_token is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(
      exchangeCodeForToken({ code: "x", redirectUri: "y" }),
    ).rejects.toThrow(/access_token/);
  });
});

describe("fetchUserinfo", () => {
  it("parses and normalizes userinfo", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: "11111",
          email: "alex@gmail.com",
          email_verified: true,
          name: "Alex",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const info = await fetchUserinfo("token");
    expect(info).toEqual({
      sub: "11111",
      email: "alex@gmail.com",
      email_verified: true,
      name: "Alex",
      picture: undefined,
    });
  });

  it("rejects when response lacks sub or email", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ sub: "x" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(fetchUserinfo("t")).rejects.toThrow(GoogleOAuthError);
  });
});
