// ── TickerBar.jsx ──────────────────────────────
import React from "react";
import "./TickerBar.css";

const TICKER_ITEMS = [
  "BREAKING: Ferrari unveils new V12 hypercar concept",
  "Porsche 911 GT3 RS sets new Nürburgring lap record",
  "Ford announces EV F-150 Lightning refresh for 2026",
  "BMW M division celebrates 50 years of motorsport excellence",
  "Toyota GR Corolla production numbers to triple in 2025",
  "McLaren files patent for active aero system",
  "Rivian secures $2.1B in new funding round",
  "Bugatti Tourbillon spotted testing at Le Mans",
  "Honda revives NSX nameplate for 2027 EV sports car",
  "Lamborghini confirms Urus successor will be hybrid-only",
];

export default function TickerBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <span className="ticker-label__dot" />
        LIVE FEED
      </div>
      <div className="ticker-track-wrapper">
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-separator">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
