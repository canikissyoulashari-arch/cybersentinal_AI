"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
  const [target, setTarget] = useState("");
  const [type, setType] = useState("ip");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!target) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, type }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Scan failed. Please try again.");
    }
    setLoading(false);
  };

  const getThreatColor = (level: string) => {
    if (level === "HIGH") return "text-red-400 border-red-500/50 bg-red-500/10";
    if (level === "MEDIUM") return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
    return "text-green-400 border-green-500/50 bg-green-500/10";
  };

  return (
    <main className="min-h-screen cyber-grid bg-[#050814] text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cyan-500/20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CyberSentinel AI
          </h1>
        </Link>
        <UserButton />
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-2">Threat Scanner</h2>
        <p className="text-gray-400 mb-8">IP, URL, ya Domain enter karein aur real-time scan karein.</p>

        <div className="p-6 rounded-2xl border border-cyan-500/20 bg-white/5 mb-8">
          <div className="flex gap-3 mb-4">
            {["ip", "url", "domain"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  type === t
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                type === "ip"
                  ? "e.g. 8.8.8.8"
                  : type === "url"
                  ? "e.g. https://example.com"
                  : "e.g. example.com"
              }
              className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan Now"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 mb-6">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-2xl border-2 ${getThreatColor(result.threatLevel)}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{result.target}</h3>
                <p className="text-sm opacity-70">{result.type.toUpperCase()} Scan Result</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.threatLevel}</div>
                <p className="text-sm opacity-70">Threat Level</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-black/40">
                <div className="text-2xl font-bold text-red-400">{result.malicious}</div>
                <div className="text-sm text-gray-400">Malicious</div>
              </div>
              <div className="p-4 rounded-lg bg-black/40">
                <div className="text-2xl font-bold text-yellow-400">{result.suspicious}</div>
                <div className="text-sm text-gray-400">Suspicious</div>
              </div>
              <div className="p-4 rounded-lg bg-black/40">
                <div className="text-2xl font-bold text-green-400">{result.harmless}</div>
                <div className="text-sm text-gray-400">Harmless</div>
              </div>
              <div className="p-4 rounded-lg bg-black/40">
                <div className="text-2xl font-bold text-gray-400">{result.undetected}</div>
                <div className="text-sm text-gray-400">Undetected</div>
              </div>
            </div>

            {result.country && (
              <div className="mt-4 text-sm text-gray-400">
                🌍 Country: <span className="text-white">{result.country}</span> | 🏢 Owner: <span className="text-white">{result.asOwner}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}