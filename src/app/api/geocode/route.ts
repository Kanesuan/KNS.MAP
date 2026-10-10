import { NominatimGeocoder } from "@/lib/geocoder";

const geocoder = new NominatimGeocoder();

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 200) {
    return Response.json({ results: [] }, { status: 400 });
  }
  try {
    const results = await geocoder.search(q);
    return Response.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return Response.json({ results: [] }, { status: 502 });
  }
}
