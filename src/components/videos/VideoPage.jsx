// ── VideoPage.jsx — Garage TV ─────────────────
import React, { useState, useEffect } from "react";
import { searchYouTubeVideos, YT_QUERIES } from "../../agents/googleAgent";
import "./VideoPage.css";

const TABS = [
  { id: "news",    label: "Latest News",  query: YT_QUERIES.news },
  { id: "reviews", label: "Reviews",      query: YT_QUERIES.reviews },
  { id: "racing",  label: "Racing",       query: YT_QUERIES.racing },
  { id: "ev",      label: "EV & Future",  query: YT_QUERIES.ev },
  { id: "classic", label: "Classic",      query: YT_QUERIES.classic },
];

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function VideoCard({ video, onPlay, featured }) {
  return (
    <div className={`video-card ${featured ? "video-card--featured" : ""}`} onClick={() => onPlay(video)}>
      <div className="video-card__thumb">
        {video.thumbnail
          ? <img src={video.thumbnail} alt={video.title} loading="lazy" />
          : <div className="video-card__thumb-placeholder">▶</div>
        }
        <div className="video-card__play-overlay">▶</div>
      </div>
      <div className="video-card__info">
        <h4 className="video-card__title">{video.title}</h4>
        <div className="video-card__meta">
          <span className="video-card__channel">{video.channel}</span>
          <span className="video-card__dot">·</span>
          <span className="video-card__time">{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal__header">
          <span className="video-modal__channel">{video.channel}</span>
          <button className="video-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="video-modal__embed">
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="video-modal__info">
          <h3 className="video-modal__title">{video.title}</h3>
          <p className="video-modal__desc">{video.description?.slice(0, 200)}{video.description?.length > 200 ? "…" : ""}</p>
          <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            OPEN ON YOUTUBE ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VideoPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const loadVideos = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchYouTubeVideos(tab.query, 9);
      setVideos(results);
    } catch (e) {
      setError("YouTube feed unavailable. Check your API key.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(activeTab); }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTab = (tab) => {
    setActiveTab(tab);
    loadVideos(tab);
  };

  const [featured, ...rest] = videos;

  return (
    <div className="video-page">
      <div className="video-page__header">
        <div>
          <h2 className="video-page__title">GARAGE TV</h2>
          <p className="video-page__sub">Live from YouTube — powered by Google</p>
        </div>
        <button className="btn btn--ghost" onClick={() => loadVideos(activeTab)} disabled={loading}>
          {loading ? "LOADING..." : "↻ REFRESH"}
        </button>
      </div>

      <div className="video-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`video-tab ${activeTab.id === tab.id ? "video-tab--active" : ""}`}
            onClick={() => handleTab(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="video-error">{error}</div>}

      {loading && (
        <div className="video-loading">
          <div className="video-skeleton video-skeleton--featured" />
          <div className="video-skeleton-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="video-skeleton" />)}
          </div>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="video-layout">
          {featured && (
            <div className="video-featured">
              <VideoCard video={featured} onPlay={setActiveVideo} featured />
            </div>
          )}
          <div className="video-grid">
            {rest.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
            ))}
          </div>
        </div>
      )}

      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
