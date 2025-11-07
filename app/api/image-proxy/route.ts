import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_HOSTS = new Set([
  "akmweb.youngjoygame.com",
  "cdn.id-mpl.com",
  "wsrv.nl",
  "ik.imagekit.io",
]);

const CACHE_SECONDS = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src) {
    return NextResponse.json({ message: "Missing src parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ message: "Invalid src parameter" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_HOSTS.has(target.hostname)) {
    return NextResponse.json({ message: "Host not permitted" }, { status: 403 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { accept: "image/*" },
    cache: "force-cache",
    next: { revalidate: CACHE_SECONDS },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: "Failed to fetch upstream image" },
      { status: upstream.status || 502 },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": contentType,
      "cache-control": `public, max-age=${CACHE_SECONDS}`,
    },
  });
}
