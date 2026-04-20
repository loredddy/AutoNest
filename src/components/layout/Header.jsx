import React, { useState, useEffect } from "react";
import "./Header.css";

const PAGE_TITLES = {
  home:        { title: "PIT LANE",   sub: "Your daily garage briefing" },
  news:        { title: "DISPATCH",   sub: "Latest from the automobile world" },
  show:        { title: "THE GARAGE", sub: "Agents debate — live & unfiltered" },
  videos:      { title: "GARAGE TV",  sub: "Powered by YouTube" },
  trending:    { title: "HEAT MAP",   sub: "What the community is buzzing about" },
  discussions: { title: "THE PADDOCK", sub: "Community debates & builds" },
};

export default function Header({ activePage }) {
  const [time, setTime] = useState(new Date());
  const page = PAGE_TITLES[activePage] || PAGE_TITLES.home;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__page-info">
          <h1 className="header__title">{page.title}</h1>
          <span className="header__subtitle">{page.sub}</span>
        </div>
      </div>
      <div className="header__right">
        <div className="header__clock">
          <span className="header__clock-time">{timeStr}</span>
          <span className="header__clock-label">LOCAL</span>
        </div>
        <div className="header__divider" />
        <div className="header__status">
          <span className="header__status-item">
            <span className="header__status-dot header__status-dot--green" />
            Agents Online
          </span>
        </div>
      </div>
    </header>
  );
}
