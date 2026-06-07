import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { detectStorageProvider, linkCheckSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateRedirectHosts = [
  "accounts.google.com",
  "login.microsoftonline.com",
  "login.live.com",
  "signin",
];

function isPrivateRedirect(url: string) {
  const lowerUrl = url.toLowerCase();
  return privateRedirectHosts.some((host) => lowerUrl.includes(host));
}

async function fetchWithTimeout(url: string, method: "HEAD" | "GET") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: method === "GET" ? { Range: "bytes=0-512" } : undefined,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = linkCheckSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid link", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const url = parsed.data.url;
    const storageProvider = detectStorageProvider(url);
    let response: Response | null = null;

    try {
      response = await fetchWithTimeout(url, "HEAD");

      if ([405, 406, 403].includes(response.status)) {
        response = await fetchWithTimeout(url, "GET");
      }
    } catch {
      return NextResponse.json({
        status: "warning",
        storageProvider,
        message:
          "The link could not be reached from the server. Save only after checking it opens in a private browser tab.",
      });
    }

    const finalUrl = response.url || url;

    if (response.status === 401 || response.status === 403 || isPrivateRedirect(finalUrl)) {
      return NextResponse.json({
        status: "warning",
        storageProvider,
        message:
          "This link may be private or require sign-in. Make sure sharing is set to anyone with the link.",
      });
    }

    if (response.status >= 400) {
      return NextResponse.json({
        status: "error",
        storageProvider,
        message: `The link returned HTTP ${response.status}. Check the full-album URL before saving.`,
      });
    }

    return NextResponse.json({
      status: "ok",
      storageProvider,
      message:
        "The link responded successfully. Still confirm it opens for students without signing in.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to check album link" },
      { status: 500 },
    );
  }
}
