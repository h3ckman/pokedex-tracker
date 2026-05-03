import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";
import {
  exchangeCodeForToken,
  fetchUserinfo,
} from "@/lib/auth/oauth/google";
import { consumeStateCookie } from "@/lib/auth/oauth/state";
import { appUrl } from "@/lib/url";

function errorRedirect(request: Request, code: string): NextResponse {
  return NextResponse.redirect(
    appUrl(`/login?error=${encodeURIComponent(code)}`, request),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stored = await consumeStateCookie();

  if (!code || !state || !stored || state !== stored) {
    return errorRedirect(request, "oauth_state");
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!redirectUri) return errorRedirect(request, "oauth_misconfigured");

  let info;
  try {
    const { accessToken } = await exchangeCodeForToken({ code, redirectUri });
    info = await fetchUserinfo(accessToken);
  } catch {
    return errorRedirect(request, "oauth_failed");
  }

  if (!info.email_verified) {
    return errorRedirect(request, "oauth_unverified");
  }

  const email = info.email.toLowerCase();
  const displayName = info.name?.trim() || email;

  const existingLink = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: info.sub,
      },
    },
    select: { userId: true, user: { select: { active: true } } },
  });

  let userId: string;
  let auditAction: string;

  if (existingLink) {
    if (!existingLink.user.active) {
      return errorRedirect(request, "account_disabled");
    }
    userId = existingLink.userId;
    auditAction = "OAUTH_LOGIN";
  } else {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, active: true, emailVerified: true },
    });

    if (existingUser) {
      if (!existingUser.active) {
        return errorRedirect(request, "account_disabled");
      }
      await prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: "google",
          providerAccountId: info.sub,
          email,
        },
      });
      if (!existingUser.emailVerified) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerified: new Date() },
        });
        auditAction = "OAUTH_AUTOVERIFIED";
      } else {
        auditAction = "OAUTH_LINKED";
      }
      userId = existingUser.id;
    } else {
      const created = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name: displayName,
            passwordHash: null,
            role: "VIEWER",
            emailVerified: new Date(),
          },
          select: { id: true },
        });
        await tx.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: "google",
            providerAccountId: info.sub,
            email,
          },
        });
        return user;
      });
      userId = created.id;
      auditAction = "OAUTH_REGISTER";
    }
  }

  await createSession(userId);
  await logAudit(userId, auditAction);

  return NextResponse.redirect(appUrl("/", request));
}
