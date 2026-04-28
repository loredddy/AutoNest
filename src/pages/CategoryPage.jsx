// ── CategoryPage.jsx ──────────────────────────
import React, { useState } from "react";
import { fetchAutoNews, fetchDiscussions } from "../agents/autoAgent";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import "./CategoryPage.css";

const CATEGORY_META = {
  "EV & Future": {
    key: "EV",
    color: "#00ff88",
    icon: "⚡",
    description: "Electric vehicles, batteries, charging infrastructure and the future of mobility.",
    newsTopics: "electric vehicles EV Tesla Rivian charging infrastructure",
  },
  "Racing": {
    key: "Racing",
    color: "#ff2222",
    icon: "🏁",
    description: "Formula 1, NASCAR, WEC, rally, and all forms of motorsport.",
    newsTopics: "motorsport Formula 1 F1 racing NASCAR rally WRC",
  },
  "Classic Cars": {
    key: "Classic",
    color: "#ffb800",
    icon: "🏛️",
    description: "Vintage automobiles, restorations, barn finds and automotive history.",
    newsTopics: "classic cars vintage restoration barn find collector auction",
  },
  "Tech & Mods": {
    key: "Tech",
    color: "#00aaff",
    icon: "🔧",
    description: "Modifications, tuning, autonomous driving and automotive technology.",
    newsTopics: "car modification tuning autonomous self-driving automotive tech",
  },
  "Industry": {
    key: "Industry",
    color: "#c0c0c0",
    icon: "🏭",
    description: "Manufacturer news, earnings, mergers, recalls and industry trends.",
    newsTopics: "automotive industry manufacturer recall merger earnings production",
  },
};

const CATEGORY_COLORS = {
  EV: "#00ff88", Racing: "#ff2222", Industry: "#c0c0c0",
  Classic: "#ffb800", Tech: "#00aaff", Policy: "#aa88ff",
};

const DISCUSSION_COLORS = {
  "Hot Take": "#ff2222", "Question": "#00aaff",
  "Debate": "#ffb800", "Build Log": "#00ff88", "Review": "#c0c0c0",
};

function NewsCard({ item, onClick }) {
  const color = CATEGORY_COLORS[item.category] || "#ffb800";
  return (
    <div className="cat-news-card" onClick={onClick}>
      <div className="cat-news-card__top">
        <span className="cat-news-card__cat" style={{ color, borderColor: color, background: `${color}15` }}>
          {item.category}
        </span>
        <span className="cat-news-card__time">
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </span>
      </div>
      <h3 className="cat-news-card__headline">{item.headline}</h3>
      <p className="cat-news-card__summary">{item.summary}</p>
      <div className="cat-news-card__footer">
        <span className="cat-news-card__read">{item.readTime}</span>
        <div className="cat-news-card__heat">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`heat-pip ${i < item.heat ? "heat-pip--on" : ""}`} />
          ))}
        </div>
        <span className="cat-news-card__cta">READ →</span>
      </div>
    </div>
  );
}

function ThreadCard({ thread, onClick }) {
  const catColor = DISCUSSION_COLORS[thread.category] || "#ffb800";
  return (
    <div className="cat-thread-card" onClick={onClick}>
      <div className="cat-thread-card__top">
        <span className="cat-thread-card__avatar">{thread.avatar}</span>
        <div>
          <span className="cat-thread-card__author">{thread.author}</span>
          <span className="cat-thread-card__time">{thread.timeAgo}</span>
        </div>
        <span className="cat-thread-card__cat" style={{ color: catColor, borderColor: catColor, background: `${catColor}12` }}>
          {thread.category}
        </span>
      </div>
      <h4 className="cat-thread-card__title">{thread.title}</h4>
      <p className="cat-thread-card__preview">{thread.preview}</p>
      <div className="cat-thread-card__footer">
        <span>💬 {thread.replies}</span>
        <span>▲ {thread.upvotes}</span>
        <span className="cat-thread-card__cta">JOIN →</span>
      </div>
    </div>
  );
}

export default function CategoryPage({ category, onNavigate }) {
  const meta = CATEGORY_META[category];
  const [news, setNews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingDisc, setLoadingDisc] = useState(false);
  const [activeTab, setActiveTab] = useState("news");

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const items = await fetchAutoNews(meta?.newsTopics || category);
      const filtered = items.filter(i =>
        i.category === meta?.key ||
        i.headline?.toLowerCase().includes(category.toLowerCase().split(" ")[0])
      );
      setNews(filtered.length > 0 ? filtered : items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadDiscussions = async () => {
    setLoadingDisc(true);
    try {
      const items = await fetchDiscussions();
      setDiscussions(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDisc(false);
    }
  };

  useAutoRefresh(loadNews, 10 * 60 * 1000);
  useAutoRefresh(loadDiscussions, 12 * 60 * 1000);

  if (!meta) return (
    <div className="cat-page">
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-code)" }}>Category not found.</p>
    </div>
  );

  return (
    <div className="cat-page">
      {/* Hero */}
      <div className="cat-hero" style={{ borderLeftColor: meta.color }}>
        <div className="cat-hero__icon" style={{ color: meta.color }}>{meta.icon}</div>
        <div className="cat-hero__content">
          <div className="cat-hero__label" style={{ color: meta.color }}>CATEGORY</div>
          <h1 className="cat-hero__title">{category}</h1>
          <p className="cat-hero__desc">{meta.description}</p>
        </div>
        <button className="btn btn--ghost cat-hero__back" onClick={() => onNavigate("home")}>
          ← BACK
        </button>
      </div>

      {/* Tabs */}
      <div className="cat-tabs">
        <button
          className={`cat-tab ${activeTab === "news" ? "cat-tab--active" : ""}`}
          style={{ borderBottomColor: activeTab === "news" ? meta.color : "transparent", color: activeTab === "news" ? meta.color : undefined }}
          onClick={() => setActiveTab("news")}
        >
          ◈ DISPATCH
        </button>
        <button
          className={`cat-tab ${activeTab === "discussions" ? "cat-tab--active" : ""}`}
          style={{ borderBottomColor: activeTab === "discussions" ? meta.color : "transparent", color: activeTab === "discussions" ? meta.color : undefined }}
          onClick={() => setActiveTab("discussions")}
        >
          ◎ PADDOCK
        </button>
      </div>

      {/* News Tab */}
      {activeTab === "news" && (
        <div className="cat-content">
          <div className="cat-content__header">
            <span className="cat-content__count">{news.length} articles</span>
            <button className="btn btn--ghost" style={{ fontSize: "0.7rem", padding: "4px 12px" }} onClick={loadNews} disabled={loadingNews}>
              {loadingNews ? "..." : "↻"}
            </button>
          </div>
          {loadingNews && (
            <div className="cat-loading">
              {[...Array(4)].map((_, i) => <div key={i} className="cat-skeleton" />)}
            </div>
          )}
          {!loadingNews && news.length > 0 && (
            <div className="cat-news-grid">
              {news.map((item, i) => (
                <NewsCard key={i} item={item} onClick={() => onNavigate("news")} />
              ))}
            </div>
          )}
          {!loadingNews && news.length === 0 && (
            <div className="cat-empty">No articles yet. Hit refresh to load.</div>
          )}
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === "discussions" && (
        <div className="cat-content">
          <div className="cat-content__header">
            <span className="cat-content__count">{discussions.length} threads</span>
            <button className="btn btn--ghost" style={{ fontSize: "0.7rem", padding: "4px 12px" }} onClick={loadDiscussions} disabled={loadingDisc}>
              {loadingDisc ? "..." : "↻"}
            </button>
          </div>
          {loadingDisc && (
            <div className="cat-loading">
              {[...Array(4)].map((_, i) => <div key={i} className="cat-skeleton" />)}
            </div>
          )}
          {!loadingDisc && discussions.length > 0 && (
            <div className="cat-threads">
              {discussions.map((t, i) => (
                <ThreadCard key={i} thread={t} onClick={() => onNavigate("discussions")} />
              ))}
            </div>
          )}
          {!loadingDisc && discussions.length === 0 && (
            <div className="cat-empty">No discussions yet. Hit refresh.</div>
          )}
        </div>
      )}
    </div>
  );
}
