// ── NewsPage.jsx ──────────────────────────────
import React, { useState, useEffect } from "react";
import { fetchAutoNews, callOllama } from "../../agents/autoAgent";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import "./NewsPage.css";

const CATEGORY_COLORS = {
  EV: "#00ff88", Racing: "#ff2222", Industry: "#c0c0c0",
  Classic: "#ffb800", Tech: "#00aaff", Policy: "#aa88ff",
};

// ── ARTICLE MODAL ─────────────────────────────
function ArticleModal({ item, onClose }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const color = CATEGORY_COLORS[item.category] || "#ffb800";

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const text = await callOllama({
          system: `You are an automotive journalist. Write engaging, informative articles about cars.
Write in a punchy editorial style — facts, opinions, context. 3-4 short paragraphs. No headline needed.`,
          user: `Write a short article body for this headline: "${item.headline}"\nSummary context: ${item.summary}`,
          maxTokens: 300,
        });
        setBody(text);
      } catch (e) {
        setBody(item.summary + "\n\n[Full article generation failed — Ollama may be busy]");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [item]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="article-modal" onClick={e => e.stopPropagation()}>
        <div className="article-modal__header">
          <span className="article-modal__category" style={{ color, borderColor: color, background: `${color}15` }}>
            {item.category}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="article-modal__body">
          <h2 className="article-modal__headline">{item.headline}</h2>
          <div className="article-modal__meta">
            <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Today"}</span>
            <span>·</span>
            <span>{item.readTime}</span>
            <div className="article-modal__heat">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`heat-pip ${i < item.heat ? "heat-pip--on" : ""}`} />
              ))}
            </div>
          </div>
          <p className="article-modal__summary">{item.summary}</p>
          <hr className="article-modal__divider" />
          {loading ? (
            <div className="article-modal__loading">
              <div className="loading-bars">
                {[...Array(4)].map((_, i) => <div key={i} className="loading-bar" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
              <span>Generating full article...</span>
            </div>
          ) : (
            <div className="article-modal__text">
              {body.split("\n\n").map((para, i) => para.trim() && <p key={i}>{para.trim()}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NEWS CARD ─────────────────────────────────
function NewsCard({ item, featured, onClick }) {
  const color = CATEGORY_COLORS[item.category] || "#ffb800";
  return (
    <article className={`news-card ${featured ? "news-card--featured" : ""}`} onClick={onClick}>
      <div className="news-card__top">
        <span className="news-card__category" style={{ color, borderColor: color, background: `${color}15` }}>
          {item.category}
        </span>
        <span className="news-card__time">
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
        </span>
      </div>
      <h3 className="news-card__headline">{item.headline}</h3>
      <p className="news-card__summary">{item.summary}</p>
      <div className="news-card__footer">
        <span className="news-card__read-time">{item.readTime}</span>
        <div className="news-card__heat">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`heat-pip ${i < item.heat ? "heat-pip--on" : ""}`} />
          ))}
        </div>
        <span className="news-card__cta">READ MORE →</span>
      </div>
    </article>
  );
}

// ── MAIN PAGE ─────────────────────────────────
export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState(null);
  const [openArticle, setOpenArticle] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const FILTERS = ["All", "EV", "Racing", "Industry", "Classic", "Tech", "Policy"];

  const loadNews = async (topic = "general") => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAutoNews(topic);
      setNews(items);
      setLastUpdated(new Date());
    } catch (e) {
      setError("Agent offline. Make sure Ollama is running.");
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(loadNews, 10 * 60 * 1000); // refresh every 10 min

  const filtered = activeFilter === "All" ? news : news.filter(n => n.category === activeFilter);

  return (
    <div className="news-page">
      <div className="news-page__controls">
        <div className="news-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`news-filter ${activeFilter === f ? "news-filter--active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {lastUpdated && <span style={{ fontFamily: "var(--font-code)", fontSize: "0.62rem", color: "var(--text-muted)" }}>Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          <button className="btn btn--ghost news-refresh" onClick={() => loadNews(activeFilter !== "All" ? activeFilter : "general")} disabled={loading}>
            {loading ? "FETCHING..." : "↻ REFRESH"}
          </button>
        </div>
      </div>

      {error && <div className="news-error">{error}</div>}

      {loading && (
        <div className="news-loading">
          <div className="loading-bars">
            {[...Array(6)].map((_, i) => <div key={i} className="loading-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
          <span className="loading-text">Agent fetching latest intel...</span>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="news-grid">
          {filtered.map((item, i) => (
            <NewsCard key={item.id || i} item={item} featured={i === 0} onClick={() => setOpenArticle(item)} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="news-empty"><span>No items in this category. Hit refresh.</span></div>
      )}

      {openArticle && <ArticleModal item={openArticle} onClose={() => setOpenArticle(null)} />}
    </div>
  );
}
