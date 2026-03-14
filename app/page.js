"use client";
// page.js
import { useEffect, useState, useRef } from "react";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "../lib/sanity";

// ─── Animated Title Component ─────────────────────────────────────────────────
function AnimatedTitle({ title, className = "" }) {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = title?.split(" ") || [];

  return (
    <h2 ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.28em",
            transform: triggered ? "translateY(0)" : "translateY(110%)",
            opacity: triggered ? 1 : 0,
            transition: `transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 75}ms, opacity 0.35s ease ${i * 75}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [modalPost, setModalPost] = useState(null);
  const [expandedAudio, setExpandedAudio] = useState({});
  const [expandedVideo, setExpandedVideo] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 80);

    client
      .fetch(`
        *[_type == "post"]{
          title, _id, mainImage, body,
          "authorName": author->name,
          "authorImage": author->image,
          "categories": categories[]->title
        }
      `)
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));

    client
      .fetch(`
        *[_type == "podcastEpisode"]{
          title, _id, audioUrl, youtubeUrl, description, image
        }
      `)
      .then((data) => setPodcasts(data))
      .catch((err) => console.error(err));
  }, []);

  const getExcerpt = (body, length = 130) => {
    const text =
      body
        ?.map((block) =>
          block.children ? block.children.map((c) => c.text).join(" ") : ""
        )
        .join(" ") || "";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  const toggleAudio = (id) =>
    setExpandedAudio((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleVideo = (id) =>
    setExpandedVideo((prev) => ({ ...prev, [id]: !prev[id] }));

  const authors = [...new Set(posts.map((p) => p.authorName).filter(Boolean))];
  const categories = [...new Set(posts.flatMap((p) => p.categories || []))];

  const filteredPosts = posts
    .filter(
      (post) =>
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((post) => !selectedAuthor || post.authorName === selectedAuthor)
    .filter(
      (post) =>
        !selectedCategory || post.categories?.includes(selectedCategory)
    );

  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:wght@400;600&family=Barlow:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --white:      #ffffff;
          --off-white:  #f6f5f2;
          --rule:       #d6d3cc;
          --ink:        #111111;
          --ink-mid:    #444444;
          --ink-light:  #888888;
          --red:        #b22234;
          --red-dark:   #8a1a27;
          --red-bg:     #fdf2f3;
          --blue:       #1c3f6e;
          --blue-dark:  #122d52;
          --blue-bg:    #f0f4f9;
          --blue-light: #dce8f5;
        }

        html, body {
          background: var(--white);
          color: var(--ink);
          font-family: 'Barlow', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .stars {
          display: inline-flex; gap: 4px; align-items: center;
        }
        .star {
          width: 6px; height: 6px; background: var(--red);
          clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
        }
        .star.blue { background: var(--blue); }

        .page-wrap { max-width: 1180px; margin: 0 auto; padding: 0 2rem 6rem; }

        /* Top stripe */
        .top-stripe {
          background: var(--blue); color: #fff;
          text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 0.5rem 2rem;
        }

        /* Header */
        .site-header { border-bottom: 4px solid var(--ink); padding: 1.5rem 0 0; }
        .header-inner {
          max-width: 1180px; margin: 0 auto; padding: 0 2rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
        }
        .header-top {
          width: 100%; display: flex;
          align-items: center; justify-content: space-between;
        }
        .header-date {
          font-size: 0.72rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink-light);
        }
        .site-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 900; letter-spacing: -0.01em;
          color: var(--ink); text-align: center; line-height: 1;
        }
        .site-title .red { color: var(--red); }
        .site-title .blue { color: var(--blue); }
        .header-tagline {
          font-family: 'Source Serif 4', serif;
          font-size: 0.85rem; color: var(--ink-mid);
          font-style: italic; letter-spacing: 0.02em;
        }
        .header-rule { width: 100%; height: 1px; background: var(--rule); margin: 0.4rem 0; }
        .site-nav {
          display: flex; gap: 0;
          border-top: 1px solid var(--rule);
          width: 100%; justify-content: center;
        }
        .site-nav a {
          font-family: 'Barlow', sans-serif;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ink); text-decoration: none;
          padding: 0.55rem 1.25rem;
          border-right: 1px solid var(--rule);
          transition: background 0.15s, color 0.15s;
        }
        .site-nav a:first-child { border-left: 1px solid var(--rule); }
        .site-nav a:hover { background: var(--blue); color: #fff; }

        /* Section heading */
        .section-heading {
          display: flex; align-items: center; gap: 1rem;
          margin: 3rem 0 1.75rem;
        }
        .section-heading-label {
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--white); background: var(--blue);
          padding: 0.3rem 0.8rem; white-space: nowrap;
        }
        .section-heading-rule { flex: 1; height: 2px; background: var(--ink); }
        .section-count { font-size: 0.72rem; color: var(--ink-light); letter-spacing: 0.06em; }

        /* Filters */
        .filter-bar {
          display: flex; gap: 0.6rem; flex-wrap: wrap;
          margin-bottom: 2rem; align-items: center;
          padding-bottom: 1.5rem; border-bottom: 1px solid var(--rule);
        }
        .filter-bar input {
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem; padding: 0.5rem 0.9rem;
          background: var(--white); border: 1px solid var(--ink);
          color: var(--ink); outline: none;
          transition: border-color 0.2s; min-width: 200px;
        }
        .filter-bar input::placeholder { color: var(--ink-light); }
        .filter-bar input:focus { border-color: var(--blue); outline: 2px solid var(--blue-light); }
        .filter-bar select {
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem; padding: 0.5rem 0.9rem;
          background: var(--white); border: 1px solid var(--ink);
          color: var(--ink); outline: none;
          cursor: pointer; transition: border-color 0.2s; appearance: none;
        }
        .filter-bar select:focus { border-color: var(--blue); }

        /* Post grid */
        .post-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 3px solid var(--ink);
          border-left: 1px solid var(--rule);
          margin-bottom: 4rem;
        }

        /* Post card */
        .post-card {
          border-right: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
          padding: 1.5rem;
          cursor: pointer;
          background: var(--white);
          display: flex; flex-direction: column; gap: 0.85rem;
          transition: background 0.15s;
          position: relative; overflow: hidden;
        }
        .post-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px; background: var(--red);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .post-card:hover::before { transform: scaleX(1); }
        .post-card:hover { background: var(--off-white); }

        .post-card-img {
          width: 100%; aspect-ratio: 16/9; overflow: hidden;
          border: 1px solid var(--rule);
          background: var(--off-white);
          display: flex; align-items: center; justify-content: center;
        }
        .post-card-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.4s ease;
        }
        .post-card:hover .post-card-img img { transform: scale(1.04); }

        .post-card-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .tag {
          font-size: 0.62rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          background: var(--blue-bg); color: var(--blue);
          border: 1px solid var(--blue-light);
        }
        .tag.red-tag {
          background: var(--red-bg); color: var(--red); border-color: #f5cfd3;
        }

        .post-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-weight: 700;
          line-height: 1.3; color: var(--ink); overflow: hidden;
        }

        .post-card-excerpt {
          font-family: 'Source Serif 4', serif;
          font-size: 0.82rem; line-height: 1.75;
          color: var(--ink-mid); flex: 1;
        }

        .post-card-meta {
          display: flex; align-items: center; gap: 0.6rem;
          padding-top: 0.85rem; border-top: 1px solid var(--rule);
        }
        .author-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--blue);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.58rem; font-weight: 600;
          color: #fff; flex-shrink: 0; overflow: hidden;
        }
        .author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .author-name { font-size: 0.73rem; color: var(--ink-mid); font-weight: 500; }
        .read-more {
          margin-left: auto;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--red);
          transition: letter-spacing 0.2s;
        }
        .post-card:hover .read-more { letter-spacing: 0.18em; }

        /* Podcasts */
        .podcast-list {
          display: flex; flex-direction: column;
          border-top: 3px solid var(--ink);
          margin-bottom: 4rem;
        }
        .podcast-card {
          display: grid; grid-template-columns: 96px 1fr;
          gap: 1.5rem; padding: 1.75rem 0;
          border-bottom: 1px solid var(--rule);
          align-items: start;
          transition: background 0.15s, padding 0.15s;
        }
        .podcast-card:hover {
          background: var(--off-white);
          padding-left: 0.75rem; padding-right: 0.75rem;
          margin: 0 -0.75rem;
        }
        .podcast-art {
          width: 96px; height: 96px;
          border: 1px solid var(--rule);
          background: var(--blue-bg);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .podcast-art img { width: 100%; height: 100%; object-fit: cover; }
        .podcast-info { display: flex; flex-direction: column; gap: 0.5rem; }
        .podcast-ep {
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--red);
        }
        .podcast-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem; font-weight: 700; color: var(--ink); overflow: hidden;
        }
        .podcast-desc {
          font-family: 'Source Serif 4', serif;
          font-size: 0.82rem; color: var(--ink-mid); line-height: 1.65;
        }
        .podcast-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }

        .btn {
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.45rem 1.1rem; cursor: pointer; transition: all 0.18s; border: none;
        }
        .btn-audio { background: var(--red); color: #fff; }
        .btn-audio:hover { background: var(--red-dark); }
        .btn-video { background: transparent; color: var(--blue); border: 1px solid var(--blue); }
        .btn-video:hover { background: var(--blue); color: #fff; }

        /* Expand panels */
        .expand-panel {
          overflow: hidden; max-height: 0;
          transition: max-height 0.45s cubic-bezier(0.16,1,0.3,1);
          grid-column: 1 / -1;
        }
        .expand-panel.open { max-height: 800px; }
        .expand-inner { padding: 1rem 0 0; border-top: 1px solid var(--rule); margin-top: 0.75rem; }
        .expand-inner iframe { width: 100%; border: none; display: block; }
        .yt-wrap { position: relative; width: 100%; padding-bottom: 56.25%; overflow: hidden; }
        .yt-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(10,10,10,0.65);
          display: flex; align-items: center; justify-content: center;
          z-index: 200; padding: 1rem;
          opacity: 0; pointer-events: none; transition: opacity 0.2s;
        }
        .modal-overlay.open { opacity: 1; pointer-events: auto; }
        .modal {
          background: var(--white);
          border-top: 5px solid var(--red);
          max-width: 740px; width: 100%;
          max-height: 90vh; overflow-y: auto;
          padding: 2.5rem;
          transform: translateY(18px);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        .modal-overlay.open .modal { transform: translateY(0); }
        .modal-close {
          position: absolute; top: 1.25rem; right: 1.25rem;
          width: 32px; height: 32px;
          background: var(--off-white); border: 1px solid var(--rule);
          color: var(--ink-mid); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; transition: background 0.15s;
        }
        .modal-close:hover { background: var(--rule); }
        .modal-category { margin-bottom: 0.75rem; }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; font-weight: 900;
          line-height: 1.2; margin-bottom: 1.25rem; color: var(--ink);
        }
        .modal-meta {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.5rem; padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--rule);
        }
        .modal-img {
          width: 100%; margin-bottom: 1.75rem;
          border: 1px solid var(--rule); overflow: hidden;
        }
        .modal-img img { width: 100%; display: block; object-fit: cover; max-height: 320px; }
        .modal-body {
          font-family: 'Source Serif 4', serif;
          font-size: 0.95rem; line-height: 1.9; color: var(--ink-mid);
        }
        .modal-body p { margin-bottom: 1rem; }
        .modal-body h2, .modal-body h3 {
          font-family: 'Playfair Display', serif;
          color: var(--ink); margin: 1.75rem 0 0.6rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .post-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .page-wrap { padding: 0 1rem 4rem; }
          .post-grid { grid-template-columns: 1fr; }
          .site-nav { overflow-x: auto; justify-content: flex-start; }
          .podcast-card { grid-template-columns: 72px 1fr; gap: 1rem; }
          .podcast-art { width: 72px; height: 72px; }
          .modal { padding: 1.5rem; }
          .modal-title { font-size: 1.5rem; }
        }
        @media (max-width: 420px) {
          .filter-bar { flex-direction: column; }
          .filter-bar input, .filter-bar select { width: 100%; }
        }
      `}</style>

      {/* Top stripe */}
      <div className="top-stripe">
        George W. Bush Presidential Center
      </div>

      {/* Header */}
      <header
        className="site-header"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="header-inner">
          <div className="header-top">
            <span className="header-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric",
                month: "long", day: "numeric",
              })}
            </span>
            <div className="stars">
              <span className="star" />
              <span className="star blue" />
              <span className="star" />
              <span className="star blue" />
              <span className="star" />
            </div>
            <span className="header-date">Dallas, TX</span>
          </div>
          <div className="header-rule" />
          <h1 className="site-title">
            <span className="blue">CREATIVE</span> <span className="red">TECHNOLOGIST</span> <span className="blue">DEMO</span>
          </h1>
          <p className="header-tagline">Developing leaders, advancing policy, and taking action to solve today's most pressing challenges.</p>
          <div className="header-rule" />
          <nav className="site-nav">
            <a href="#">Policy Briefs</a>
            <a href="#">Podcasts</a>
            <a href="#">Economy</a>
            <a href="#">Foreign Affairs</a>
            <a href="#">Health</a>
            <a href="#">Authors</a>
            <a href="#">About</a>
          </nav>
        </div>
      </header>

      <div className="page-wrap">

        {/* Policy Briefs */}
        <section>
          <div className="section-heading">
            <span className="section-heading-label">Publications</span>
            <div className="section-heading-rule" />
            <span className="section-count">{filteredPosts.length} articles</span>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search briefs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
              <option value="">All authors</option>
              {authors.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="post-grid">
            {filteredPosts.map((post, idx) => (
              <article key={post._id} className="post-card" onClick={() => setModalPost(post)}>
                <div className="post-card-img">
                  {post.mainImage ? (
                    <img src={urlFor(post.mainImage).width(600).url()} alt={post.title} />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <rect x="4" y="6" width="28" height="3" rx="1.5" fill="#d6d3cc"/>
                      <rect x="4" y="14" width="20" height="2.5" rx="1.25" fill="#d6d3cc"/>
                      <rect x="4" y="20" width="24" height="2.5" rx="1.25" fill="#d6d3cc"/>
                      <rect x="4" y="26" width="14" height="2.5" rx="1.25" fill="#d6d3cc"/>
                    </svg>
                  )}
                </div>

                {post.categories?.length > 0 && (
                  <div className="post-card-tags">
                    {post.categories.map((c, i) => (
                      <span key={c} className={`tag ${i === 0 ? "red-tag" : ""}`}>{c}</span>
                    ))}
                  </div>
                )}

                <AnimatedTitle title={post.title} className="post-card-title" />

                <p className="post-card-excerpt">{getExcerpt(post.body, 130)}</p>

                <div className="post-card-meta">
                  <div className="author-avatar">
                    {post.authorImage ? (
                      <img src={urlFor(post.authorImage).width(56).height(56).url()} alt={post.authorName} />
                    ) : initials(post.authorName)}
                  </div>
                  <span className="author-name">{post.authorName}</span>
                  <span className="read-more">Read →</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Podcasts */}
        <section>
          <div className="section-heading">
            <span className="section-heading-label" style={{ background: "var(--red)" }}>
              Podcasts
            </span>
            <div className="section-heading-rule" />
            <span className="section-count">{podcasts.length} episodes</span>
          </div>

          <div className="podcast-list">
            {podcasts.map((podcast, idx) => (
              <div key={podcast._id} className="podcast-card">
                <div className="podcast-art">
                  {podcast.image ? (
                    <img src={urlFor(podcast.image).width(192).height(192).url()} alt={podcast.title} />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="13" stroke="#1c3f6e" strokeWidth="1.5"/>
                      <circle cx="18" cy="18" r="4" fill="#1c3f6e"/>
                      <path d="M18 5v4M18 27v4M5 18h4M27 18h4" stroke="#1c3f6e" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>

                <div className="podcast-info">
                  <span className="podcast-ep">Episode {idx + 1}</span>
                  <AnimatedTitle title={podcast.title} className="podcast-title" />
                  <p className="podcast-desc">{podcast.description}</p>
                  <div className="podcast-actions">
                    {podcast.audioUrl && (
                      <button className="btn btn-audio" onClick={() => toggleAudio(podcast._id)}>
                        {expandedAudio[podcast._id] ? "Hide Audio" : "▶ Listen"}
                      </button>
                    )}
                    {podcast.youtubeUrl && (
                      <button className="btn btn-video" onClick={() => toggleVideo(podcast._id)}>
                        {expandedVideo[podcast._id] ? "Hide Video" : "Watch"}
                      </button>
                    )}
                  </div>
                </div>

                {podcast.audioUrl && (
                  <div className={`expand-panel ${expandedAudio[podcast._id] ? "open" : ""}`}>
                    <div className="expand-inner">
                      <iframe src={podcast.audioUrl} height="166" scrolling="no" frameBorder="no" seamless title={`audio-${podcast._id}`} />
                    </div>
                  </div>
                )}

                {podcast.youtubeUrl && (
                  <div className={`expand-panel ${expandedVideo[podcast._id] ? "open" : ""}`}>
                    <div className="expand-inner">
                      <div className="yt-wrap">
                        <iframe src={podcast.youtubeUrl} title={podcast.title} allowFullScreen />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal */}
      {modalPost && (
        <div
          className="modal-overlay open"
          onClick={(e) => { if (e.target.classList.contains("modal-overlay")) setModalPost(null); }}
        >
          <div className="modal">
            <button className="modal-close" onClick={() => setModalPost(null)}>✕</button>

            {modalPost.categories?.length > 0 && (
              <div className="modal-category">
                {modalPost.categories.map((c, i) => (
                  <span key={c} className={`tag ${i === 0 ? "red-tag" : ""}`}>{c}</span>
                ))}
              </div>
            )}

            <h2 className="modal-title">{modalPost.title}</h2>

            <div className="modal-meta">
              <div className="author-avatar">
                {modalPost.authorImage ? (
                  <img src={urlFor(modalPost.authorImage).width(56).height(56).url()} alt={modalPost.authorName} />
                ) : initials(modalPost.authorName)}
              </div>
              <span className="author-name">{modalPost.authorName}</span>
            </div>

            {modalPost.mainImage && (
              <div className="modal-img">
                <img src={urlFor(modalPost.mainImage).width(700).url()} alt={modalPost.title} />
              </div>
            )}

            <div className="modal-body">
              <PortableText value={modalPost.body} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}