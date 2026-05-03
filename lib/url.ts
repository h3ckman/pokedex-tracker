export function getAppOrigin(request: Request): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const headers = request.headers;
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost && !forwardedHost.startsWith("0.0.0.0")) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function appUrl(path: string, request: Request): URL {
  return new URL(path, `${getAppOrigin(request)}/`);
}
