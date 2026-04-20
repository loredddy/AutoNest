// ── App.jsx ───────────────────────────────────
import React, { useState } from "react";
import "./styles/globals.css";
import "./App.css";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import TickerBar from "./components/shared/TickerBar";

import HomePage from "./pages/HomePage";
import NewsPage from "./components/news/NewsPage";
import ShowPage from "./components/show/ShowPage";
import TrendingPage from "./components/trending/TrendingPage";
import DiscussionsPage from "./components/discussions/DiscussionsPage";
import VideoPage from "./components/videos/VideoPage";

const PAGES = {
  home: HomePage,
  news: NewsPage,
  show: ShowPage,
  trending: TrendingPage,
  discussions: DiscussionsPage,
  videos: VideoPage,
};

export default function App() {
  const [activePage, setActivePage] = useState("home");

  const PageComponent = PAGES[activePage] || HomePage;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="app-main">
        <Header activePage={activePage} />
        <TickerBar />
        <main className="app-content">
          <PageComponent onNavigate={setActivePage} />
        </main>
      </div>
    </div>
  );
}
