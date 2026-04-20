// ── ShowPage.jsx — The Garage ─────────────────
import React, { useState, useRef, useEffect } from "react";
import { HOSTS, startShowSegment, continueShow, answerViewerQuestion, generateShowTopics } from "../../agents/showAgents";
import "./ShowPage.css";

const DEFAULT_TOPICS = [
  { id: 1, title: "Is the manual transmission truly dead?", category: "Debate", controversy: 5 },
  { id: 2, title: "EVs in motorsport: revolution or gimmick?", category: "Hot Take", controversy: 4 },
  { id: 3, title: "The last great naturally-aspirated era", category: "Throwback", controversy: 3 },
  { id: 4, title: "Why modern cars are getting ugly", category: "Hot Take", controversy: 4 },
  { id: 5, title: "SUVs killed the sports car — fact or fiction?", category: "Debate", controversy: 5 },
  { id: 6, title: "Which is better: Top Gear or Throttle House?", category: "Debate", controversy: 5 },
];

function HostCard({ host, selected, onClick }) {
  return (
    <div
      className={`host-select-card ${selected ? "host-select-card--selected" : ""}`}
      style={{ borderColor: selected ? host.color : undefined }}
      onClick={onClick}
    >
      <div className="host-select-card__avatar" style={{ background: `${host.color}22`, border: `2px solid ${host.color}` }}>
        {host.avatar}
      </div>
      <div className="host-select-card__info">
        <div className="host-select-card__name" style={{ color: selected ? host.color : undefined }}>{host.name}</div>
        <div className="host-select-card__show">{host.show}</div>
        <div className="host-select-card__title">{host.title}</div>
      </div>
      {selected && <div className="host-select-card__check" style={{ background: host.color }}>✓</div>}
    </div>
  );
}

function ChatBubble({ message }) {
  const host = HOSTS[message.host];
  if (!host) return null;
  const isRight = host.side === "right";

  return (
    <div className={`chat-bubble chat-bubble--${isRight ? "right" : "left"}`}>
      <div className="chat-bubble__avatar" style={{ borderColor: host.color }}>
        {host.avatar}
      </div>
      <div className="chat-bubble__content">
        <div className="chat-bubble__meta">
          <span className="chat-bubble__name" style={{ color: host.color }}>{host.name}</span>
          <span className="chat-bubble__show">{host.show}</span>
        </div>
        <div className="chat-bubble__text" style={{ borderLeftColor: isRight ? "transparent" : host.color, borderRightColor: isRight ? host.color : "transparent" }}>
          {message.text}
        </div>
      </div>
    </div>
  );
}

export default function ShowPage() {
  const [step, setStep] = useState("select-hosts"); // select-hosts | select-topic | live
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [activeTopic, setActiveTopic] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerInput, setViewerInput] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [ollamaError, setOllamaError] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [conversation]);

  const toggleHost = (hostId) => {
    setSelectedHosts(prev => {
      if (prev.includes(hostId)) return prev.filter(h => h !== hostId);
      if (prev.length >= 2) return [prev[1], hostId];
      return [...prev, hostId];
    });
  };

  const goToTopics = () => {
    if (selectedHosts.length === 2) setStep("select-topic");
  };

  const goOnAir = async (topic) => {
    setActiveTopic(topic);
    setConversation([]);
    setStep("live");
    setLoading(true);
    setOllamaError(null);
    try {
      const opening = await startShowSegment(topic.title, selectedHosts[0], selectedHosts[1]);
      setConversation(opening);
    } catch (e) {
      setOllamaError(e.message.includes("fetch") || e.message.includes("localhost")
        ? "Cannot connect to Ollama. Make sure it's running: open a terminal and type 'ollama serve'"
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (loading || !activeTopic) return;
    setLoading(true);
    try {
      const next = await continueShow({
        topic: activeTopic.title,
        history: conversation,
        host1Id: selectedHosts[0],
        host2Id: selectedHosts[1],
      });
      setConversation(prev => [...prev, next]);
    } catch (e) {
      setOllamaError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewerQuestion = async () => {
    if (!viewerInput.trim() || loading) return;
    const q = viewerInput.trim();
    setViewerInput("");
    setConversation(prev => [...prev, { host: "viewer", text: q }]);
    setLoading(true);
    try {
      const answers = await answerViewerQuestion({
        question: q,
        topic: activeTopic.title,
        history: conversation,
        host1Id: selectedHosts[0],
        host2Id: selectedHosts[1],
      });
      setConversation(prev => [...prev, ...answers]);
    } catch (e) {
      setOllamaError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewTopics = async () => {
    setLoadingTopics(true);
    try {
      const newTopics = await generateShowTopics();
      setTopics(newTopics);
    } catch (e) {
      setOllamaError(e.message);
    } finally {
      setLoadingTopics(false);
    }
  };

  const CONTROVERSY_COLORS = ["", "#888", "#ffb800", "#ff8800", "#ff4400", "#ff2222"];

  // ── STEP 1: SELECT HOSTS ──
  if (step === "select-hosts") return (
    <div className="show-page">
      <div className="show-setup-header">
        <h2 className="show-setup-title">PICK YOUR HOSTS</h2>
        <p className="show-setup-sub">Choose 2 hosts for tonight's show</p>
      </div>

      <div className="show-groups">
        <div className="show-group">
          <div className="show-group__label">🏆 TOP GEAR</div>
          <div className="host-grid">
            {["clarkson", "hammond", "may"].map(id => (
              <HostCard key={id} host={HOSTS[id]} selected={selectedHosts.includes(id)} onClick={() => toggleHost(id)} />
            ))}
          </div>
        </div>
        <div className="show-group">
          <div className="show-group__label">🎬 THROTTLE HOUSE</div>
          <div className="host-grid">
            {["thomas", "james_th"].map(id => (
              <HostCard key={id} host={HOSTS[id]} selected={selectedHosts.includes(id)} onClick={() => toggleHost(id)} />
            ))}
          </div>
        </div>
      </div>

      {selectedHosts.length === 2 && (
        <div className="show-selected-preview">
          <span className="show-selected-names">
            {HOSTS[selectedHosts[0]].name} <span style={{ color: "var(--text-muted)" }}>vs</span> {HOSTS[selectedHosts[1]].name}
          </span>
          <button className="btn btn--primary" onClick={goToTopics}>PICK A TOPIC →</button>
        </div>
      )}
      {selectedHosts.length < 2 && (
        <div className="show-select-hint">Select {2 - selectedHosts.length} more host{selectedHosts.length === 1 ? "" : "s"}</div>
      )}
    </div>
  );

  // ── STEP 2: SELECT TOPIC ──
  if (step === "select-topic") return (
    <div className="show-page">
      <div className="show-setup-header">
        <div>
          <h2 className="show-setup-title">SELECT TONIGHT'S TOPIC</h2>
          <p className="show-setup-sub">{HOSTS[selectedHosts[0]].name} & {HOSTS[selectedHosts[1]].name} will take it from there</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn--ghost" onClick={() => setStep("select-hosts")}>← CHANGE HOSTS</button>
          <button className="btn btn--ghost" onClick={fetchNewTopics} disabled={loadingTopics}>
            {loadingTopics ? "GENERATING..." : "AI SUGGEST ↻"}
          </button>
        </div>
      </div>

      <div className="show-hosts-preview">
        {selectedHosts.map(id => {
          const h = HOSTS[id];
          return (
            <div key={id} className="show-host-chip" style={{ borderColor: `${h.color}66` }}>
              <span>{h.avatar}</span>
              <span style={{ color: h.color }}>{h.name}</span>
              <span className="show-host-chip__show">{h.show}</span>
            </div>
          );
        })}
      </div>

      <div className="topic-list">
        {topics.map(topic => (
          <button key={topic.id} className="topic-item" onClick={() => goOnAir(topic)}>
            <div className="topic-item__left">
              <span className="topic-item__category">{topic.category}</span>
              <span className="topic-item__title">{topic.title}</span>
            </div>
            <div className="topic-item__right">
              <div className="controversy-meter">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="controversy-pip" style={{
                    background: i <= (topic.controversy || 3) ? CONTROVERSY_COLORS[topic.controversy || 3] : "var(--border-color)"
                  }} />
                ))}
              </div>
              <span className="topic-item__go">GO LIVE →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── STEP 3: LIVE SHOW ──
  return (
    <div className="show-page">
      <div className="show-live__header">
        <div className="show-live__topic-info">
          <span className="live-badge">ON AIR</span>
          <span className="show-live__topic-title">{activeTopic?.title}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn--ghost" onClick={() => { setStep("select-topic"); setConversation([]); }}>← TOPICS</button>
          <button className="btn btn--ghost" onClick={() => { setStep("select-hosts"); setConversation([]); setSelectedHosts([]); }}>← HOSTS</button>
        </div>
      </div>

      {ollamaError && (
        <div className="ollama-error">
          <span>⚠ {ollamaError}</span>
          <button className="btn btn--ghost" style={{ fontSize: "0.7rem", padding: "4px 10px" }} onClick={() => setOllamaError(null)}>DISMISS</button>
        </div>
      )}

      <div className="chat-log" ref={chatRef}>
        {conversation.map((msg, i) => (
          msg.host === "viewer" ? (
            <div key={i} className="viewer-message">
              <span className="viewer-message__label">VIEWER</span>
              <span className="viewer-message__text">"{msg.text}"</span>
            </div>
          ) : (
            <ChatBubble key={i} message={msg} />
          )
        ))}
        {loading && (
          <div className="chat-typing">
            <span className="chat-typing__dot" /><span className="chat-typing__dot" /><span className="chat-typing__dot" />
            <span className="chat-typing__label">Host is thinking...</span>
          </div>
        )}
        {conversation.length === 0 && !loading && !ollamaError && (
          <div className="chat-empty">Starting the show...</div>
        )}
      </div>

      <div className="show-controls">
        <div className="viewer-input-row">
          <input
            className="viewer-input"
            placeholder="Ask the hosts a question..."
            value={viewerInput}
            onChange={e => setViewerInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleViewerQuestion()}
            disabled={loading}
          />
          <button className="btn btn--primary" onClick={handleViewerQuestion} disabled={loading || !viewerInput.trim()}>ASK</button>
        </div>
        <button className="btn btn--ghost continue-btn" onClick={handleContinue} disabled={loading || conversation.length === 0}>
          {loading ? "..." : "▶ CONTINUE"}
        </button>
      </div>
    </div>
  );
}
