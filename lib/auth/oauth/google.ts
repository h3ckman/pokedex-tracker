export const GOOGLE_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

export class GoogleOAuthError extends Error {
  constructor(
    public code:
      | "missing_config"
      | "token_exchange_failed"
      | "userinfo_failed",
    message: string,
  ) {
    super(message);
    this.name = "GoogleOAuthError";
  }
}

function requireEnv(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new GoogleOAuthError(
      "missing_config",
      "GOOGLE_CLIENT_ID/SECRET not set",
    );
  }
  return { clientId, clientSecret };
}

export type BuildAuthorizeUrlInput = {
  state: string;
  redirectUri: string;
};

export function buildAuthorizeUrl({
  state,
  redirectUri,
}: BuildAuthorizeUrlInput): string {
  const { clientId } = requireEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;
}

export type GoogleTokenResponse = {
  accessToken: string;
  idToken?: string;
};

export async function exchangeCodeForToken(input: {
  code: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = requireEnv();
  const body = new URLSearchParams({
    code: input.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new GoogleOAuthError(
      "token_exchange_failed",
      `Token exchange failed (${res.status}): ${text}`,
    );
  }
  const json = (await res.json()) as {
    access_token?: string;
    id_token?: string;
  };
  if (!json.access_token) {
    throw new GoogleOAuthError(
      "token_exchange_failed",
      "Token response missing access_token",
    );
  }
  return { accessToken: json.access_token, idToken: json.id_token };
}

export type GoogleUserinfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

export async function fetchUserinfo(
  accessToken: string,
): Promise<GoogleUserinfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new GoogleOAuthError(
      "userinfo_failed",
      `Userinfo failed (${res.status})`,
    );
  }
  const json = (await res.json()) as Partial<GoogleUserinfo>;
  if (!json.sub || !json.email) {
    throw new GoogleOAuthError(
      "userinfo_failed",
      "Userinfo missing required fields",
    );
  }
  return {
    sub: json.sub,
    email: json.email,
    email_verified: Boolean(json.email_verified),
    name: json.name,
    picture: json.picture,
  };
}
