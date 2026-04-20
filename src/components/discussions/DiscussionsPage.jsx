// ── DiscussionsPage.jsx ───────────────────────
import React, { useState, useEffect } from "react";
import { fetchDiscussions, callOllama } from "../../agents/autoAgent";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import "./DiscussionsPage.css";

const CATEGORY_COLORS = {
  "Hot Take": "#ff2222", "Question": "#00aaff",
  "Debate": "#ffb800", "Build Log": "#00ff88", "Review": "#c0c0c0",
};

// ── THREAD MODAL ──────────────────────────────
function ThreadModal({ thread, onClose }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInput, setReplyInput] = useState("");
  const [posting, setPosting] = useState(false);
  const catColor = CATEGORY_COLORS[thread.category] || "#ffb800";

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const raw = await callOllama({
          system: `You are simulating a car enthusiast forum. Generate realistic short replies to a thread.
Write 3 replies from different users. Format exactly as:
USER1_NAME: reply text
USER2_NAME: reply text  
USER3_NAME: reply text
Each reply is 1-2 sentences. Make them opinionated and interesting.`,
          user: `Thread title: "${thread.title}"\nOriginal post: ${thread.preview}\n\nGenerate 3 forum replies.`,
          maxTokens: 200,
        });

        const lines = raw.split("\n").filter(l => l.includes(":") && l.trim().length > 10);
        const parsed = lines.slice(0, 4).map((line, i) => {
          const colonIdx = line.indexOf(":");
          return {
            id: i,
            author: line.slice(0, colonIdx).trim().replace(/^[-*•]\s*/, "") || `User${i + 1}`,
            text: line.slice(colonIdx + 1).trim(),
            timeAgo: `${i * 8 + 5}m ago`,
            upvotes: Math.floor(Math.random() * 40) + 3,
          };
        });
        setReplies(parsed);
      } catch (e) {
        setReplies([{ id: 0, author: "System", text: "Could not load replies — Ollama may be busy.", timeAgo: "now", upvotes: 0 }]);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [thread]);

  const handleReply = async () => {
    if (!replyInput.trim() || posting) return;
    const userReply = { id: Date.now(), author: "You", text: replyInput.trim(), timeAgo: "just now", upvotes: 0, isUser: true };
    setReplies(prev => [...prev, userReply]);
    const userText = replyInput.trim();
    setReplyInput("");
    setPosting(true);

    try {
      const aiReply = await callOllama({
        system: `You are a car enthusiast on a forum. Reply to a comment in 1-2 sentences. Stay in character as a passionate car fan.`,
        user: `Thread: "${thread.title}"\nSomeone just said: "${userText}"\nReply to them directly.`,
        maxTokens: 80,
      });
      const randomNames = ["GearheadMike", "TurboTom", "V8Victoria", "ShiftKing", "ApexHunter"];
      const name = randomNames[Math.floor(Math.random() * randomNames.length)];
      setReplies(prev => [...prev, { id: Date.now() + 1, author: name, text: aiReply, timeAgo: "just now", upvotes: 0 }]);
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="thread-modal" onClick={e => e.stopPropagation()}>
        <div className="thread-modal__header">
          <span className="thread-modal__category" style={{ color: catColor, borderColor: catColor, background: `${catColor}15` }}>
            {thread.category}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="thread-modal__body">
          <h2 className="thread-modal__title">{thread.title}</h2>
          <div className="thread-modal__op">
            <span className="thread-op__avatar">{thread.avatar}</span>
            <div>
              <span className="thread-op__author">{thread.author}</span>
              <span className="thread-op__time">{thread.timeAgo}</span>
            </div>
            <div className="thread-op__stats">
              <span>💬 {thread.replies}</span>
              <span>▲ {thread.upvotes}</span>
            </div>
          </div>
          <p className="thread-modal__preview">{thread.preview}</p>

          <div className="thread-modal__divider">
            <span>REPLIES</span>
          </div>

          {loading ? (
            <div className="thread-modal__loading">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton-reply" />)}
            </div>
          ) : (
            <div className="thread-replies">
              {replies.map(reply => (
                <div key={reply.id} className={`thread-reply ${reply.isUser ? "thread-reply--user" : ""}`}>
                  <div className="thread-reply__header">
                    <span className="thread-reply__author" style={{ color: reply.isUser ? "var(--neon-amber)" : "var(--text-primary)" }}>
                      {reply.isUser ? "▶ You" : reply.author}
                    </span>
                    <span className="thread-reply__time">{reply.timeAgo}</span>
                    {reply.upvotes > 0 && <span className="thread-reply__votes">▲ {reply.upvotes}</span>}
                  </div>
                  <p className="thread-reply__text">{reply.text}</p>
                </div>
              ))}
              {posting && (
                <div className="thread-reply-typing">
                  <span className="chat-typing__dot" /><span className="chat-typing__dot" /><span className="chat-typing__dot" />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "6px" }}>Someone is replying...</span>
                </div>
              )}
            </div>
          )}

          <div className="thread-reply-input">
            <input
              className="viewer-input"
              placeholder="Join the discussion..."
              value={replyInput}
              onChange={e => setReplyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleReply()}
              disabled={posting}
            />
            <button className="btn btn--primary" onClick={handleReply} disabled={posting || !replyInput.trim()}>
              POST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── THREAD CARD ───────────────────────────────
function ThreadCard({ thread, onClick }) {
  const catColor = CATEGORY_COLORS[thread.category] || "#ffb800";
  return (
    <article className={`thread-card ${thread.pinned ? "thread-card--pinned" : ""}`} onClick={onClick}>
      {thread.pinned && <div className="thread-pinned-label">📌 PINNED</div>}
      <div className="thread-top">
        <div className="thread-author">
          <span className="thread-avatar">{thread.avatar}</span>
          <div>
            <span className="thread-author-name">{thread.author}</span>
            <span className="thread-time">{thread.timeAgo}</span>
          </div>
        </div>
        <span className="thread-category" style={{ color: catColor, borderColor: catColor, background: `${catColor}12` }}>
          {thread.category}
        </span>
      </div>
      <h3 className="thread-title">{thread.title}</h3>
      {thread.preview && <p className="thread-preview">{thread.preview}</p>}
      <div className="thread-footer">
        <span className="thread-stat">💬 {thread.replies} replies</span>
        <span className="thread-stat">▲ {thread.upvotes}</span>
        <span className="thread-cta">OPEN THREAD →</span>
      </div>
    </article>
  );
}

// ── MAIN PAGE ─────────────────────────────────
export default function DiscussionsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openThread, setOpenThread] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDiscussions();
      setThreads(data);
    } catch (e) {
      setError("Community feed offline. Make sure Ollama is running.");
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(load, 12 * 60 * 1000); // refresh every 12 min

  return (
    <div className="discussions-page">
      <div className="discussions-header">
        <div>
          <h2 className="discussions-title">THE PADDOCK</h2>
          <p className="discussions-sub">Community debates, builds, and hot takes</p>
        </div>
        <div className="discussions-actions">
          <button className="btn btn--ghost" onClick={load} disabled={loading}>
            {loading ? "LOADING..." : "↻ REFRESH"}
          </button>
          <button className="btn btn--primary">+ NEW THREAD</button>
        </div>
      </div>

      {error && <div className="discussion-error">{error}</div>}

      {loading && (
        <div className="discussions-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-thread" style={{ opacity: 1 - i * 0.15 }} />)}
        </div>
      )}

      {!loading && threads.length > 0 && (
        <div className="threads-list">
          {threads.map((t, i) => <ThreadCard key={t.id || i} thread={t} onClick={() => setOpenThread(t)} />)}
        </div>
      )}

      {!loading && threads.length === 0 && !error && (
        <div className="discussions-empty">No discussions found. Hit refresh.</div>
      )}

      {openThread && <ThreadModal thread={openThread} onClose={() => setOpenThread(null)} />}
    </div>
  );
}
