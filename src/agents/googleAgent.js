// ═══════════════════════════════════════════════
// AUTONEST — GOOGLE API INTEGRATION
// YouTube Data API v3
// ═══════════════════════════════════════════════

const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

function getGoogleKey() {
  const key = process.env.REACT_APP_GOOGLE_API_KEY;
  if (!key) throw new Error("REACT_APP_GOOGLE_API_KEY is not set in your .env file");
  return key;
}

export async function searchYouTubeVideos(query = "automobile news", maxResults = 8) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults,
    key: getGoogleKey(),
    relevanceLanguage: "en",
    safeSearch: "moderate",
  });

  const res = await fetch(`${YOUTUBE_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${err}`);
  }
  const data = await res.json();

  return (data.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}

export const YT_QUERIES = {
  news: "automobile car news 2025",
  reviews: "new car review 2025",
  racing: "motorsport F1 racing highlights 2025",
  ev: "electric vehicle EV review 2025",
  classic: "classic car restoration build",
};
