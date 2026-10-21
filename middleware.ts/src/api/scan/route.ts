import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { target, type } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Target required" }, { status: 400 });
    }

    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    let url = "";
    if (type === "ip") {
      url = `https://www.virustotal.com/api/v3/ip_addresses/${target}`;
    } else if (type === "url") {
      url = `https://www.virustotal.com/api/v3/urls`;
    } else if (type === "domain") {
      url = `https://www.virustotal.com/api/v3/domains/${target}`;
    }

    const response = await fetch(url, {
      method: type === "url" ? "POST" : "GET",
      headers: {
        "x-apikey": apiKey,
        ...(type === "url" && { "Content-Type": "application/x-www-form-urlencoded" }),
      },
      ...(type === "url" && { body: `url=${encodeURIComponent(target)}` }),
    });

    const data = await response.json();

    // URL ke liye 2-step process (submit + get)
    if (type === "url" && data.data?.id) {
      const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${data.data.id}`;
      const analysisRes = await fetch(analysisUrl, {
        headers: { "x-apikey": apiKey },
      });
      const analysisData = await analysisRes.json();

      const stats = analysisData.data?.attributes?.stats || {};
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;

      return NextResponse.json({
        target,
        type,
        malicious,
        suspicious,
        harmless: stats.harmless || 0,
        undetected: stats.undetected || 0,
        threatLevel: malicious > 0 ? "HIGH" : suspicious > 0 ? "MEDIUM" : "LOW",
        details: stats,
      });
    }

    // IP aur Domain ke liye
    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    return NextResponse.json({
      target,
      type,
      malicious,
      suspicious,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      threatLevel: malicious > 0 ? "HIGH" : suspicious > 0 ? "MEDIUM" : "LOW",
      details: stats,
      country: data.data?.attributes?.country || "Unknown",
      asOwner: data.data?.attributes?.as_owner || "Unknown",
    });
  } catch (error) {
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}