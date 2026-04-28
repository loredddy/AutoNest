// ── App.jsx ───────────────────────────────────
import React, { useState } from "react";
import "./styles/globals.css";
import "./App.css";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import TickerBar from "./components/shared/TickerBar";

import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
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
  const [activeCategory, setActiveCategory] = useState(null);

  const handleNavigate = (page) => {
    setActiveCategory(null);
    setActivePage(page);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActivePage("category");
  };

  const PageComponent = PAGES[activePage];

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        activeCategory={activeCategory}
        onNavigate={handleNavigate}
        onCategoryClick={handleCategoryClick}
      />
      <div className="app-main">
        <Header activePage={activePage} activeCategory={activeCategory} />
        <TickerBar />
        <main className="app-content">
          {activePage === "category" && activeCategory ? (
            <CategoryPage category={activeCategory} onNavigate={handleNavigate} />
          ) : PageComponent ? (
            <PageComponent onNavigate={handleNavigate} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
