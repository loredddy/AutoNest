// ── TrendingPage.jsx ──────────────────────────
import React, { useState, useEffect } from "react";
import { fetchTrending } from "../../agents/autoAgent";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import "./TrendingPage.css";

export default function TrendingPage() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrending();
      setTrends(data);
    } catch (e) {
      setError("Trend radar offline.");
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(load, 8 * 60 * 1000); // refresh every 8 min

  const formatMentions = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n;
  };

  return (
    <div className="trending-page">
      <div className="trending-header">
        <div>
          <h2 className="trending-title">HEAT MAP</h2>
          <p className="trending-sub">What the community is talking about right now</p>
        </div>
        <button className="btn btn--ghost" onClick={load} disabled={loading}>
          {loading ? "SCANNING..." : "↻ SCAN"}
        </button>
      </div>

      {error && <div className="trend-error">{error}</div>}

      {loading && (
        <div className="trend-loading">
          <div className="radar-spinner" />
          <span>Scanning trend frequencies...</span>
        </div>
      )}

      {!loading && trends.length > 0 && (
        <div className="trend-list">
          {trends.map((t, i) => {
            const isUp = t.change?.startsWith("+");
            const maxMentions = Math.max(...trends.map((x) => x.mentions || 0));
            const pct = maxMentions > 0 ? (t.mentions / maxMentions) * 100 : 50;

            return (
              <div key={t.id || i} className={`trend-item ${t.hot ? "trend-item--hot" : ""}`}>
                <div className="trend-rank">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="trend-body">
                  <div className="trend-top">
                    <span className="trend-topic">{t.topic}</span>
                    {t.hot && <span className="trend-hot-badge">🔥 EXPLODING</span>}
                  </div>
                  <div className="trend-bar-row">
                    <div className="trend-bar">
                      <div className="trend-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="trend-mentions">{formatMentions(t.mentions)} mentions</span>
                  </div>
                </div>
                <div className="trend-stats">
                  <span className={`trend-change ${isUp ? "trend-change--up" : "trend-change--down"}`}>
                    {isUp ? "↑" : "↓"} {t.change}
                  </span>
                  {t.category && <span className="trend-category">{t.category}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
