import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch resource: ${response.statusText}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get("Content-Type") || "application/octet-stream";
        const arrayBuffer = await response.arrayBuffer();

        // Create a new response with the fetched body
        const proxyResponse = new NextResponse(arrayBuffer);

        // Set appropriate headers
        proxyResponse.headers.set("Content-Type", contentType);
        proxyResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");

        // Allow CORS from our origin (or all for simplicity in dev)
        proxyResponse.headers.set("Access-Control-Allow-Origin", "*");

        return proxyResponse;
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
