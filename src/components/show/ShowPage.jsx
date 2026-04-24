// ── ShowPage.jsx — The Garage ─────────────────
import React, { useState, useRef, useEffect } from "react";
import { HOSTS, startShowSegment, continueShow, answerViewerQuestion, generateShowTopics } from "../../agents/showAgents";
import { callOllama } from "../../agents/ollamaAgent";
import "./ShowPage.css";

const DEFAULT_TOPICS = [
  { id: 1, title: "Is the manual transmission truly dead?", category: "Debate", controversy: 5 },
  { id: 2, title: "EVs in motorsport: revolution or gimmick?", category: "Hot Take", controversy: 4 },
  { id: 3, title: "The last great naturally-aspirated era", category: "Throwback", controversy: 3 },
  { id: 4, title: "Why modern cars are getting ugly", category: "Hot Take", controversy: 4 },
  { id: 5, title: "SUVs killed the sports car — fact or fiction?", category: "Debate", controversy: 5 },
  { id: 6, title: "Which is better: Top Gear or Throttle House?", category: "Debate", controversy: 5 },
];

// ── HOST SELECTION CARD ───────────────────────
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

// ── CHAT BUBBLE WITH INLINE REPLY ─────────────
function ChatBubble({ message, onReplyTo, replyTarget, loading, selectedHosts, topic, onReplySubmit }) {
  const host = HOSTS[message.host];
  if (!host) return null;

  const isRight = host.side === "right";
  const isReplyOpen = replyTarget === message.id;
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onReplySubmit({ text: replyText.trim(), targetHostId: message.host, messageId: message.id });
    setReplyText("");
  };

  return (
    <div className={`chat-bubble-wrapper chat-bubble-wrapper--${isRight ? "right" : "left"}`}>
      {/* Main bubble */}
      <div className={`chat-bubble chat-bubble--${isRight ? "right" : "left"}`}>
        <div className="chat-bubble__avatar" style={{ borderColor: host.color }}>
          {host.avatar}
        </div>
        <div className="chat-bubble__content">
          <div className="chat-bubble__meta">
            <span className="chat-bubble__name" style={{ color: host.color }}>{host.name}</span>
            <span className="chat-bubble__show">{host.show}</span>
          </div>
          <div
            className="chat-bubble__text"
            style={{
              borderLeftColor: isRight ? "transparent" : host.color,
              borderRightColor: isRight ? host.color : "transparent"
            }}
          >
            {message.text}
          </div>

          {/* Reply button under each message */}
          <button
            className={`bubble-reply-btn ${isReplyOpen ? "bubble-reply-btn--active" : ""}`}
            style={{ alignSelf: isRight ? "flex-end" : "flex-start", color: host.color }}
            onClick={() => onReplyTo(isReplyOpen ? null : message.id)}
            disabled={loading}
          >
            ↩ Reply to {host.name.split(" ")[0]}
          </button>
        </div>
      </div>

      {/* Inline reply box — appears under the bubble when open */}
      {isReplyOpen && (
        <div className={`inline-reply inline-reply--${isRight ? "right" : "left"}`}
          style={{ borderColor: `${host.color}55` }}
        >
          <div className="inline-reply__tag" style={{ color: host.color }}>
            ↩ Replying to {host.name}
          </div>
          <div className="inline-reply__input-row">
            <input
              className="viewer-input inline-reply__input"
              placeholder={`Counter ${host.name.split(" ")[0]}'s take...`}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
              disabled={loading}
            />
            <button
              className="btn btn--primary"
              style={{ background: host.color, color: "#000" }}
              onClick={handleSubmit}
              disabled={loading || !replyText.trim()}
            >
              SEND
            </button>
            <button className="btn btn--ghost" onClick={() => onReplyTo(null)} disabled={loading}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN SHOW PAGE ────────────────────────────
export default function ShowPage() {
  const [step, setStep] = useState("select-hosts");
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [activeTopic, setActiveTopic] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerInput, setViewerInput] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null); // message.id being replied to
  const chatRef = useRef(null);
  const msgCounter = useRef(0);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [conversation]);

  const addMsg = (msg) => {
    msgCounter.current += 1;
    return { ...msg, id: msgCounter.current };
  };

  const toggleHost = (hostId) => {
    setSelectedHosts(prev => {
      if (prev.includes(hostId)) return prev.filter(h => h !== hostId);
      if (prev.length >= 2) return [prev[1], hostId];
      return [...prev, hostId];
    });
  };

  const goOnAir = async (topic) => {
    setActiveTopic(topic);
    setConversation([]);
    setStep("live");
    setLoading(true);
    setAgentError(null);
    setReplyTarget(null);
    msgCounter.current = 0;
    try {
      const opening = await startShowSegment(topic.title, selectedHosts[0], selectedHosts[1]);
      setConversation(opening.map(m => addMsg(m)));
    } catch (e) {
      setAgentError(e.message.includes("fetch") || e.message.includes("localhost")
        ? "Cannot connect. Make sure Ollama is running: 'ollama serve'"
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (loading || !activeTopic) return;
    setLoading(true);
    setReplyTarget(null);
    try {
      const next = await continueShow({
        topic: activeTopic.title,
        history: conversation,
        host1Id: selectedHosts[0],
        host2Id: selectedHosts[1],
      });
      setConversation(prev => [...prev, addMsg(next)]);
    } catch (e) {
      setAgentError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // General question to both hosts
  const handleGeneralQuestion = async () => {
    if (!viewerInput.trim() || loading) return;
    const q = viewerInput.trim();
    setViewerInput("");
    setReplyTarget(null);
    setConversation(prev => [...prev, addMsg({ host: "viewer", text: q, targetHost: "both" })]);
    setLoading(true);
    try {
      const answers = await answerViewerQuestion({
        question: q,
        topic: activeTopic.title,
        history: conversation,
        host1Id: selectedHosts[0],
        host2Id: selectedHosts[1],
      });
      setConversation(prev => [...prev, ...answers.map(a => addMsg(a))]);
    } catch (e) {
      setAgentError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Direct reply to a specific host
  const handleDirectReply = async ({ text, targetHostId }) => {
    setReplyTarget(null);
    setConversation(prev => [...prev, addMsg({ host: "viewer", text, targetHost: targetHostId })]);
    setLoading(true);
    try {
      const host = HOSTS[targetHostId];
      const historyText = conversation
        .slice(-6)
        .filter(m => m.host !== "viewer")
        .map(m => `${HOSTS[m.host]?.name || m.host}: ${m.text}`)
        .join("\n\n");

      const response = await callOllama({
        system: host.system,
        user: `Topic: "${activeTopic.title}"\nConversation so far:\n${historyText}\n\nA viewer just replied directly to YOU saying: "${text}"\nRespond directly to them — in character, 1-2 sentences, punchy.`,
        maxTokens: 120,
      });

      setConversation(prev => [...prev, addMsg({ host: targetHostId, text: response })]);
    } catch (e) {
      setAgentError(e.message);
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
      setAgentError(e.message);
    } finally {
      setLoadingTopics(false);
    }
  };

  const CONTROVERSY_COLORS = ["", "#888", "#ffb800", "#ff8800", "#ff4400", "#ff2222"];

  // ── STEP 1: SELECT HOSTS ──────────────────────
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
          <button className="btn btn--primary" onClick={() => setStep("select-topic")}>PICK A TOPIC →</button>
        </div>
      )}
      {selectedHosts.length < 2 && (
        <div className="show-select-hint">Select {2 - selectedHosts.length} more host{selectedHosts.length === 1 ? "" : "s"}</div>
      )}
    </div>
  );

  // ── STEP 2: SELECT TOPIC ──────────────────────
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

  // ── STEP 3: LIVE SHOW ─────────────────────────
  return (
    <div className="show-page">
      <div className="show-live__header">
        <div className="show-live__topic-info">
          <span className="live-badge">ON AIR</span>
          <span className="show-live__topic-title">{activeTopic?.title}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn--ghost" onClick={() => { setStep("select-topic"); setConversation([]); setReplyTarget(null); }}>← TOPICS</button>
          <button className="btn btn--ghost" onClick={() => { setStep("select-hosts"); setConversation([]); setSelectedHosts([]); setReplyTarget(null); }}>← HOSTS</button>
        </div>
      </div>

      {agentError && (
        <div className="ollama-error">
          <span>⚠ {agentError}</span>
          <button className="btn btn--ghost" style={{ fontSize: "0.7rem", padding: "4px 10px" }} onClick={() => setAgentError(null)}>DISMISS</button>
        </div>
      )}

      {/* Chat log */}
      <div className="chat-log" ref={chatRef}>
        {conversation.map((msg, i) => (
          msg.host === "viewer" ? (
            <div key={i} className={`viewer-message viewer-message--${msg.targetHost === "both" ? "both" : "direct"}`}>
              <div className="viewer-message__left">
                <span className="viewer-message__label">
                  {msg.targetHost === "both" ? "YOU ASKED" : `YOU → ${HOSTS[msg.targetHost]?.name?.split(" ")[0] || "HOST"}`}
                </span>
                <span className="viewer-message__text">"{msg.text}"</span>
              </div>
            </div>
          ) : (
            <ChatBubble
              key={i}
              message={msg}
              onReplyTo={setReplyTarget}
              replyTarget={replyTarget}
              loading={loading}
              selectedHosts={selectedHosts}
              topic={activeTopic?.title}
              onReplySubmit={handleDirectReply}
            />
          )
        ))}
        {loading && (
          <div className="chat-typing">
            <span className="chat-typing__dot" /><span className="chat-typing__dot" /><span className="chat-typing__dot" />
            <span className="chat-typing__label">Host is thinking...</span>
          </div>
        )}
        {conversation.length === 0 && !loading && !agentError && (
          <div className="chat-empty">Starting the show...</div>
        )}
      </div>

      {/* Bottom controls — general input + continue */}
      <div className="show-controls">
        <div className="viewer-input-row">
          <input
            className="viewer-input"
            placeholder="Ask both hosts a question..."
            value={viewerInput}
            onChange={e => setViewerInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGeneralQuestion()}
            disabled={loading}
          />
          <button className="btn btn--primary" onClick={handleGeneralQuestion} disabled={loading || !viewerInput.trim()}>
            ASK BOTH
          </button>
        </div>
        <button className="btn btn--ghost continue-btn" onClick={handleContinue} disabled={loading || conversation.length === 0}>
          {loading ? "..." : "▶ CONTINUE"}
        </button>
      </div>
    </div>
  );
}
