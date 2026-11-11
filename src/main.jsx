import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { sections } from "./content";
import "./style.css";

const readHash = () =>
  Math.max(
    0,
    sections.findIndex((s) => s.id === (location.hash.slice(1) || "career")),
  );
const point = (i) => ({
  x: sections[i].x * 10 + 13,
  y: sections[i].y * 6.6667,
});
function Player({ number, active }) {
  return (
    <svg className="sprite" viewBox="0 0 60 85" aria-hidden="true">
      <ellipse cx="30" cy="79" rx="20" ry="5" fill="#001a1590" />
      <g className="body">
        <path
          d="M22 52L19 70L12 77M38 52L42 68L48 74"
          fill="none"
          stroke="#dca477"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M22 47L20 59M38 47L40 59" stroke="#f2eedc" strokeWidth="12" />
        <path
          d="M20 27L10 43M40 27L50 40"
          stroke="#dca477"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M21 23L13 28L18 36L21 33L20 50L41 50L39 33L44 36L49 28L39 23Z"
          fill={active ? "#f4c661" : "#e7eee6"}
          stroke="#142b38"
          strokeWidth="2"
        />
        <path
          d="M25 24L30 29L35 24"
          fill="none"
          stroke="#142b38"
          strokeWidth="3"
        />
        <text
          x="30"
          y="43"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#102c37"
        >
          {number}
        </text>
        <circle cx="30" cy="15" r="10" fill="#dca477" />
        <path d="M20 15Q17 1 30 3Q43 2 40 15L35 9L21 11" fill="#17202b" />
        <path
          d="M9 77L18 77M44 76L53 76"
          stroke="#111e29"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
function Details({ section }) {
  return (
    <>
      {section.details.map((d, i) => (
        <article className="detail" key={d.title + i}>
          <p className="eyebrow">{d.meta}</p>
          <h3>{d.title}</h3>
          <p>{d.body}</p>
          {d.bullets && (
            <ul>
              {d.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {d.links && (
            <div className="contact-links">
              {d.links.map(([label, url]) => (
                <a key={url} href={url}>
                  {label} ↗
                </a>
              ))}
            </div>
          )}
        </article>
      ))}
    </>
  );
}
const seenMetrics = new Set();
function Metric({ section, reduced }) {
  const [value, setValue] = useState(section.metric);
  useEffect(() => {
    const match = section.metric.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (reduced || seenMetrics.has(section.id) || !match) {
      setValue(section.metric);
      return;
    }
    seenMetrics.add(section.id);
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 400);
      const digits = match[1].includes(".") ? 1 : 0;
      setValue((Number(match[1]) * progress).toFixed(digits) + match[2]);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [section.id, reduced]);
  return (
    <strong aria-label={section.metric}>
      <span aria-hidden="true">{value}</span>
    </strong>
  );
}
function App() {
  const [selected, setSelected] = useState(readHash),
    [displayed, setDisplayed] = useState(readHash),
    [possession, setPossession] = useState(readHash);
  const [plain, setPlain] = useState(
    () => new URLSearchParams(location.search).get("view") === "plain",
  );
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [detail, setDetail] = useState(false),
    [sound, setSound] = useState(false),
    [moving, setMoving] = useState(false),
    [intro, setIntro] = useState(false);
  const stage = useRef(),
    ball = useRef(),
    shadow = useRef(),
    trail = useRef(),
    frame = useRef(),
    busy = useRef(false),
    pending = useRef(null),
    owner = useRef(possession),
    navigateRef = useRef(),
    audio = useRef(),
    dialog = useRef(),
    lastFocus = useRef();
  const current = sections[displayed];
  function paint(p, height = 0, rotation = 0) {
    if (ball.current)
      ball.current.setAttribute(
        "transform",
        `translate(${p.x} ${p.y - height}) rotate(${rotation})`,
      );
    if (shadow.current) {
      shadow.current.setAttribute("cx", p.x);
      shadow.current.setAttribute("cy", p.y + 4);
      shadow.current.setAttribute(
        "opacity",
        Math.max(0.12, 0.5 - height / 180),
      );
    }
  }
  function kick() {
    if (!sound) return;
    try {
      audio.current ??= new AudioContext();
      audio.current.resume();
      const o = audio.current.createOscillator(),
        g = audio.current.createGain();
      o.connect(g);
      g.connect(audio.current.destination);
      o.frequency.setValueAtTime(130, audio.current.currentTime);
      o.frequency.exponentialRampToValueAtTime(
        45,
        audio.current.currentTime + 0.1,
      );
      g.gain.setValueAtTime(0.07, audio.current.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        audio.current.currentTime + 0.12,
      );
      o.start();
      o.stop(audio.current.currentTime + 0.13);
    } catch {}
  }
  function navigate(index, history = true) {
    if (index < 0 || index >= sections.length) return;
    setIntro(false);
    setSelected(index);
    if (history)
      window.history.pushState(
        null,
        "",
        `${location.pathname}${plain ? "?view=plain" : ""}#${sections[index].id}`,
      );
    if (busy.current) {
      pending.current = index;
      return;
    }
    if (reduced || plain || index === owner.current) {
      owner.current = index;
      setPossession(index);
      setDisplayed(index);
      paint(point(index));
      return;
    }
    busy.current = true;
    setMoving(true);
    kick();
    const from = point(owner.current),
      to = point(index),
      start = performance.now();
    let swapped = false;
    const step = (now) => {
      const t = Math.min(1, (now - start) / 800),
        u = t * t * (3 - 2 * t),
        p = {
          x: from.x + (to.x - from.x) * u,
          y: from.y + (to.y - from.y) * u,
        };
      const h = 4 * 65 * u * (1 - u);
      paint(p, h, u * 540);
      if (trail.current) {
        const back = Math.max(0, u - 0.13);
        trail.current.setAttribute(
          "d",
          `M ${from.x + (to.x - from.x) * back} ${from.y + (to.y - from.y) * back - 4 * 65 * back * (1 - back)} Q ${p.x - 8} ${p.y - h} ${p.x} ${p.y - h}`,
        );
        trail.current.style.opacity = String(Math.sin(Math.PI * t));
      }
      if (t >= 0.7 && !swapped) {
        swapped = true;
        setDisplayed(index);
      }
      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        owner.current = index;
        setPossession(index);
        busy.current = false;
        setMoving(false);
        const next = pending.current;
        pending.current = null;
        if (next !== null && next !== index) navigateRef.current(next, false);
      }
    };
    frame.current = requestAnimationFrame(step);
  }
  navigateRef.current = navigate;
  useEffect(() => {
    paint(point(owner.current));
    const mq = matchMedia("(prefers-reduced-motion: reduce)"),
      change = (e) => setReduced(e.matches);
    mq.addEventListener("change", change);
    const pop = () => {
      setPlain(new URLSearchParams(location.search).get("view") === "plain");
      navigateRef.current(readHash(), false);
    };
    window.addEventListener("popstate", pop);
    return () => {
      mq.removeEventListener("change", change);
      window.removeEventListener("popstate", pop);
      cancelAnimationFrame(frame.current);
    };
  }, []);
  useEffect(() => {
    if (plain) return;
    paint(point(owner.current));
    const el = stage.current;
    let total = 0,
      last = 0,
      locked = false;
    const wheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const now = performance.now();
      if (now - last > 200) {
        total = 0;
        locked = false;
      }
      last = now;
      const dir = Math.sign(e.deltaY),
        target = owner.current + dir;
      if (target < 0 || target >= 6) return;
      e.preventDefault();
      if (locked || busy.current) return;
      total +=
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 500 : 1);
      if (Math.abs(total) > 65) {
        locked = true;
        navigateRef.current(owner.current + Math.sign(total));
      }
    };
    el?.addEventListener("wheel", wheel, { passive: false });
    return () => el?.removeEventListener("wheel", wheel);
  }, [plain]);
  useEffect(() => {
    const hide = () => {
      document.body.classList.toggle("paused", document.hidden);
      if (document.hidden) {
        cancelAnimationFrame(frame.current);
        const next = pending.current ?? selected;
        pending.current = null;
        busy.current = false;
        owner.current = next;
        setMoving(false);
        setPossession(next);
        setDisplayed(next);
        paint(point(next));
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [selected]);
  useEffect(() => {
    if (reduced || plain || location.hash) return;
    try {
      if (!sessionStorage.getItem("kickoffSeen")) {
        setIntro(true);
        sessionStorage.setItem("kickoffSeen", "1");
        const timer = setTimeout(() => setIntro(false), 1800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (detail) {
      lastFocus.current = document.activeElement;
      dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current.close();
      lastFocus.current?.focus();
    }
  }, [detail]);
  function togglePlain() {
    cancelAnimationFrame(frame.current);
    busy.current = false;
    pending.current = null;
    owner.current = selected;
    setMoving(false);
    setPossession(selected);
    setDisplayed(selected);
    setIntro(false);
    setPlain(!plain);
    history.pushState(
      null,
      "",
      `${location.pathname}${!plain ? "?view=plain" : ""}#${sections[selected].id}`,
    );
    window.scrollTo(0, 0);
  }
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="header">
        <a
          className="brand"
          href="#career"
          onClick={(e) => {
            e.preventDefault();
            navigate(1);
          }}
        >
          HK<span>/</span>
        </a>
        <div className="identity">
          <strong>Harshit Kumar</strong>
          <span>Senior Software Engineer · GoDaddy</span>
        </div>
        <div className="header-actions">
          <button onClick={togglePlain}>
            {plain ? "← Back to the pitch" : "Plain view ↗"}
          </button>
          <a href="mailto:kumarharshit2309@gmail.com">
            Let’s talk <span>↗</span>
          </a>
        </div>
      </header>
      {plain ? (
        <main className="plain" id="content">
          <p className="eyebrow">HARSHIT KUMAR / ENGINEERING PORTFOLIO</p>
          <h1>
            Architecture to production.
            <br />
            <em>Ownership all the way.</em>
          </h1>
          <p className="intro-copy">
            Senior Software Engineer at GoDaddy, promoted to SDE-3 in April
            2026. Over five years building and operating systems across
            commerce, payments, recruiting, and consumer products.
          </p>
          <div className="skill-list">
            {[
              "Backend systems",
              "Distributed systems",
              "Full-stack development",
              "System design",
              "Technical leadership",
            ].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <button className="text-link" onClick={() => window.print()}>
            Print / save résumé ↗
          </button>
          {sections.map((s) => (
            <section id={s.id} key={s.id}>
              <h2>
                <small>{s.number}</small> {s.label}
              </h2>
              <Details section={s} />
            </section>
          ))}
        </main>
      ) : (
        <main className="experience">
          <div className="scene-column">
            <div className="scene-heading">
              <span className="live-dot" /> ENGINEER ON THE FIELD{" "}
              <span className="season">EST. 2021 / IN PLAY</span>
            </div>
            <nav className="pitch-nav" aria-label="Portfolio sections">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => navigate(i)}
                  aria-current={selected === i ? "page" : undefined}
                >
                  <small>{s.number}</small>
                  {s.label}
                </button>
              ))}
            </nav>
            <div
              className={`stadium ${intro ? "intro-playing" : ""} ${moving ? "passing" : ""}`}
              ref={stage}
              aria-label="Interactive football pitch"
            >
              <img
                className="stadium-art"
                src="/art/stadium.webp"
                alt="Floodlit football stadium with an emerald pitch"
                width="1536"
                height="1024"
                fetchPriority="high"
              />
              <div className="vignette" />
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  className={`player ${possession === i ? "active" : ""} ${selected === i ? "target" : ""}`}
                  style={{ left: s.x + "%", top: s.y + "%" }}
                  aria-label={`Explore ${s.label}`}
                  onClick={() => navigate(i)}
                >
                  <span className="ground-ring" />
                  <Player number={i + 1} active={possession === i} />
                  <span className="player-label">
                    {s.label}
                    <span className="preview">{s.preview}</span>
                  </span>
                </button>
              ))}
              <svg
                className="ball-layer"
                viewBox="0 0 1000 666.67"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="ballshine" cx="30%" cy="25%">
                    <stop stopColor="#fff" />
                    <stop offset="1" stopColor="#bebdaf" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                </defs>
                <ellipse ref={shadow} rx="10" ry="4" fill="#00120b" />
                <path
                  ref={trail}
                  fill="none"
                  stroke="#ffce6b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <g ref={ball}>
                  <circle r="8" fill="url(#ballshine)" />
                  <path d="M0 -4L4 -1L2 4L-3 4L-5 -1Z" fill="#17232a" />
                  <path
                    d="M-7 -3L-5 -6M6 -5L8 -1M4 6L1 8M-6 5L-8 2"
                    stroke="#17232a"
                    strokeWidth="2"
                  />
                </g>
              </svg>
              {intro && (
                <div className="kickoff">
                  <p className="eyebrow">WELCOME TO MY HOME GROUND</p>
                  <h2>Let’s kick things off.</h2>
                  <button onClick={() => setIntro(false)}>Skip intro →</button>
                </div>
              )}
              <div className="pitch-caption">
                YOUR CURIOSITY. YOUR NEXT PASS.
              </div>
            </div>
            <div className="under-pitch">
              <span>
                ↕ Scroll on the pitch to pass <i>·</i> Or pick a player
              </span>
              <button aria-pressed={sound} onClick={() => setSound(!sound)}>
                {sound ? "◖ Sound on" : "◌ Sound off"}
              </button>
            </div>
            <ol className="progress" aria-label="Section progress">
              {sections.map((s, i) => (
                <li key={s.id} className={selected === i ? "current" : ""}>
                  <span />
                  {s.number}
                  <small>{s.label}</small>
                </li>
              ))}
            </ol>
          </div>
          <aside className="panel" id="content">
            <div className="panel-top">
              <span>PLAYER PROFILE</span>
              <span>{current.number} / 06</span>
            </div>
            <div key={displayed} className="panel-content" aria-live="polite">
              <p className="eyebrow">{current.eyebrow}</p>
              <h1>
                {current.title.split("\n").map((line, i) => (
                  <React.Fragment key={line}>
                    {i > 0 && <br />}
                    {i === 1 ? <em>{line}</em> : line}
                  </React.Fragment>
                ))}
              </h1>
              <p className="description">{current.description}</p>
              <div className="metric">
                <Metric section={current} reduced={reduced} />
                <span>{current.unit}</span>
              </div>
              <button className="cta" onClick={() => setDetail(true)}>
                {current.cta}
                <span>↗</span>
              </button>
            </div>
            <div className="panel-foot">
              <span className="live-dot" /> Gurugram, India{" "}
              <span>GO · JS · REACT</span>
            </div>
          </aside>
        </main>
      )}
      <footer>
        <span>Built with intent. Played with curiosity.</span>
        <a href="https://github.com/harshitsinha23/football-portfolio">
          View the source ↗
        </a>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setDetail(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setDetail(false);
        }}
      >
        <div className="dialog-top">
          <span>
            {current.number} / {current.label.toUpperCase()}
          </span>
          <button aria-label="Close details" onClick={() => setDetail(false)}>
            Close ✕
          </button>
        </div>
        <h2>{current.title.replace("\n", " ")}</h2>
        <Details section={current} />
        <button className="cta" onClick={() => setDetail(false)}>
          Back to the pitch ↙
        </button>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
