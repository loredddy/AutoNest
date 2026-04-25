import React, { useState, useEffect } from "react";
import { checkOllamaStatus } from "../../agents/ollamaAgent";
import logo from "../../assets/icons/AN_big.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "home",        label: "Pit Lane",   icon: "⬡", description: "Home Base" },
  { id: "news",        label: "Dispatch",   icon: "⬡", description: "Latest News" },
  { id: "show",        label: "The Garage", icon: "⬡", description: "Live Show", badge: "LIVE" },
  { id: "videos",      label: "Garage TV",  icon: "⬡", description: "YouTube Feed" },
  { id: "trending",    label: "Heat Map",   icon: "⬡", description: "Trending" },
  { id: "discussions", label: "Paddock",    icon: "⬡", description: "Discussions" },
];

const CATEGORIES = [
  { label: "EV & Future",  color: "#00ff88" },
  { label: "Racing",       color: "#ff2222" },
  { label: "Classic Cars", color: "#ffb800" },
  { label: "Tech & Mods",  color: "#00aaff" },
  { label: "Industry",     color: "#c0c0c0" },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, hasModel: false });
  const isLocal = window.location.hostname === "localhost";

  useEffect(() => {
    const check = async () => {
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src={logo} alt="AutoNest Logo" className="sidebar__logo-img" />
        <div className="sidebar__logo-text">
          <span className="sidebar__logo-name">AutoNest</span>
          <span className="sidebar__logo-tagline">Ai Automobile Enthusiasts</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">NAVIGATION</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activePage === item.id ? "sidebar__nav-item--active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-content">
              <span className="sidebar__nav-label-text">{item.label}</span>
              <span className="sidebar__nav-desc">{item.description}</span>
            </span>
            {item.badge && <span className="sidebar__badge sidebar__badge--live">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar__section">
        <div className="sidebar__nav-label">CATEGORIES</div>
        {CATEGORIES.map(cat => (
          <button key={cat.label} className="sidebar__category">
            <span className="sidebar__category-dot" style={{ background: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className="sidebar__status-dot" style={{
            background: ollamaStatus.online ? "var(--neon-green)" : "#ff2222",
            animation: ollamaStatus.online ? "pulse-live 2s infinite" : "none"
          }} />
          <span className="sidebar__status-text" style={{
            color: ollamaStatus.online ? "var(--neon-green)" : "#ff2222"
          }}>
            {ollamaStatus.online
              ? (isLocal ? "Ollama Ready" : "Groq Ready")
              : (isLocal ? "Ollama Offline" : "Groq Offline")}
          </span>
        </div>
        {isLocal && !ollamaStatus.online && (
          <div className="sidebar__hint">Run: ollama serve</div>
        )}
        {isLocal && ollamaStatus.online && !ollamaStatus.hasModel && (
          <div className="sidebar__hint">Run: ollama pull llama3.2:3b</div>
        )}
        <div className="sidebar__version">
          {isLocal ? "v0.2.0 — LOCAL AI" : "v0.2.0 — GROQ CLOUD"}
        </div>
      </div>
    </aside>
  );
}
