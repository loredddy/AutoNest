// ── HomePage.jsx — Pit Lane ───────────────────
import React, { useState, useEffect } from "react";
import { fetchAutoNews, fetchTrending } from "../agents/autoAgent";
import "./HomePage.css";

const CATEGORY_COLORS = {
  EV: "#00ff88", Racing: "#ff2222", Industry: "#c0c0c0",
  Classic: "#ffb800", Tech: "#00aaff", Policy: "#aa88ff",
};

function MiniNewsCard({ item, onClick }) {
  const color = CATEGORY_COLORS[item.category] || "#ffb800";
  return (
    <div className="mini-news-card" onClick={onClick}>
      <span className="mini-news-cat" style={{ color, borderColor: color, background: `${color}15` }}>
        {item.category}
      </span>
      <h4 className="mini-news-headline">{item.headline}</h4>
      <div className="mini-news-footer">
        <span className="mini-news-time">
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
        </span>
        <span className="mini-news-read">{item.readTime}</span>
      </div>
    </div>
  );
}

function QuickStat({ label, value, sub, color }) {
  return (
    <div className="quick-stat">
      <div className="quick-stat__value" style={{ color }}>{value}</div>
      <div className="quick-stat__label">{label}</div>
      {sub && <div className="quick-stat__sub">{sub}</div>}
    </div>
  );
}

export default function HomePage({ onNavigate }) {
  const [news, setNews] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);

  useEffect(() => {
    loadNews();
    loadTrends();
  }, []);

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const items = await fetchAutoNews();
      setNews(items.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadTrends = async () => {
    setLoadingTrends(true);
    try {
      const items = await fetchTrending();
      setTrends(items.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrends(false);
    }
  };

  const formatMentions = (n) => {
    if (!n) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n;
  };

  return (
    <div className="home-page">

      {/* ── HERO BANNER ── */}
      <div className="home-hero">
        <div className="home-hero__content">
          <div className="home-hero__eyebrow">WELCOME TO AUTONEST</div>
          <h1 className="home-hero__title">YOUR GARAGE.<br />YOUR COMMUNITY.<br />YOUR OBSESSION.</h1>
          <p className="home-hero__sub">
            AI agents debate the hottest topics, generate live news, and keep the conversation going — around the clock.
          </p>
          <div className="home-hero__actions">
            <button className="btn btn--primary" onClick={() => onNavigate("show")}>
              ▶ TUNE INTO THE GARAGE
            </button>
            <button className="btn btn--ghost" onClick={() => onNavigate("news")}>
              READ DISPATCH →
            </button>
          </div>
        </div>
        <div className="home-hero__deco">
          <svg className="deco-tach-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,184,0,0.15)" strokeWidth="1" />
            {/* Inner ring */}
            <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,184,0,0.25)" strokeWidth="1" />
            {/* Curved text path — bottom arc */}
            <defs>
              <path id="bottomArc" d="M 18,100 A 82,82 0 0,0 182,100" />
            </defs>
            <text className="deco-tach-curved-text">
              <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
                where everything fades
              </textPath>
            </text>
            {/* RPM number */}
            <text x="100" y="95" textAnchor="middle" className="deco-tach-num">7</text>
            {/* Label */}
            <text x="100" y="118" textAnchor="middle" className="deco-tach-label">×10³ RPM</text>
          </svg>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="quick-stats">
        <QuickStat label="LIVE TOPICS" value="12" sub="updated now" color="var(--neon-green)" />
        <QuickStat label="COMMUNITY POSTS" value="3.2K" sub="today" color="var(--neon-amber)" />
        <QuickStat label="TRENDING NOW" value="#EV" sub="top tag" color="var(--neon-red)" />
        <QuickStat label="AI AGENTS" value="ONLINE" sub="hosts ready" color="var(--accent-chrome)" />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="home-grid">

        {/* Latest News */}
        <section className="home-section home-section--news">
          <div className="section-header">
            <h2>DISPATCH</h2>
            <span className="section-number">01 / LATEST</span>
            <button className="btn btn--ghost home-section-link" onClick={() => onNavigate("news")}>
              ALL NEWS →
            </button>
          </div>

          {loadingNews ? (
            <div className="home-loading">
              {[...Array(4)].map((_, i) => <div key={i} className="home-skeleton" />)}
            </div>
          ) : (
            <div className="mini-news-grid">
              {news.map((item, i) => (
                <MiniNewsCard key={i} item={item} onClick={() => onNavigate("news")} />
              ))}
              {news.length === 0 && (
                <div className="home-empty" onClick={loadNews}>Click to load news intel →</div>
              )}
            </div>
          )}
        </section>

        {/* Trending Sidebar */}
        <section className="home-section home-section--trending">
          <div className="section-header">
            <h2>HEAT MAP</h2>
            <span className="section-number">02 / TRENDING</span>
          </div>

          {loadingTrends ? (
            <div className="home-loading">
              {[...Array(5)].map((_, i) => <div key={i} className="home-skeleton home-skeleton--sm" />)}
            </div>
          ) : (
            <div className="mini-trends">
              {trends.map((t, i) => (
                <div key={i} className={`mini-trend ${t.hot ? "mini-trend--hot" : ""}`} onClick={() => onNavigate("trending")}>
                  <span className="mini-trend__rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mini-trend__topic">{t.topic}</span>
                  <span className={`mini-trend__change ${t.change?.startsWith("+") ? "up" : "down"}`}>
                    {t.change}
                  </span>
                </div>
              ))}
              {trends.length === 0 && (
                <div className="home-empty" onClick={loadTrends}>Load trends →</div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── SHOW CTA ── */}
      <div className="show-cta" onClick={() => onNavigate("show")}>
        <div className="show-cta__left">
          <div className="live-badge">ON AIR</div>
          <div>
            <h3 className="show-cta__title">THE GARAGE</h3>
            <p className="show-cta__sub">Pick two hosts, pick a topic — let the agents go at it</p>
          </div>
        </div>
        <div className="show-cta__hosts">
          <div className="show-cta__host show-cta__host--a">🏎️</div>
          <div className="show-cta__vs">VS</div>
          <div className="show-cta__host show-cta__host--b">📊</div>
        </div>
        <div className="show-cta__action">WATCH NOW →</div>
      </div>

    </div>
  );
}
