import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { sections } from "./content";
import "./style.css";

const readHash = () =>
  Math.max(
    0,
    sections.findIndex((s) => s.id === (location.hash.slice(1) || "career")),
  );
const readPlain = () =>
  new URLSearchParams(location.search).get("view") === "plain";
const isExternal = (href) => /^https?:/.test(href);
const supportsWebGL = () => {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
};
const fontsReady = () =>
  Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
    </svg>
  );
}
function LinkOutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
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

function LinkOut({ section, onInternal, className = "linkout" }) {
  const { label, href } = section.link;
  const external = isExternal(href);
  return (
    <a
      className={className}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!external && href.startsWith("?")) {
          e.preventDefault();
          onInternal(href);
        }
      }}
    >
      <span>{label}</span>
      <LinkOutIcon />
    </a>
  );
}

function Brief({ section }) {
  const b = section.brief;
  return (
    <>
      <h1 className="title">
        {section.title.split("\n").map((line, i) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <div className="org">
        <span className="org-mark" aria-hidden="true">
          {b.org[0]}
        </span>
        <div>
          <strong>{b.org}</strong>
          <span>{b.role}</span>
        </div>
      </div>
      <p className="summary">{b.summary ?? section.description}</p>
      <h2 className="heading">{b.heading}</h2>
      {b.bullets && (
        <ul className="bullets">
          {b.bullets.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
      {b.links && (
        <ul className="reach">
          {b.links.map(([label, text, href]) => (
            <li key={href}>
              <a
                href={href}
                target={isExternal(href) ? "_blank" : undefined}
                rel={isExternal(href) ? "noopener noreferrer" : undefined}
              >
                <small>{label}</small>
                <span>{text}</span>
                <LinkOutIcon />
              </a>
            </li>
          ))}
        </ul>
      )}
      {b.stats && (
        <div className="stats">
          {b.stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
      {b.path && (
        <ol className="path" aria-label="Career path">
          {b.path.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      )}
    </>
  );
}

function App() {
  const [plain, setPlain] = useState(readPlain);
  const [selected, setSelected] = useState(readHash);
  const [displayed, setDisplayed] = useState(readHash);
  const [possession, setPossession] = useState(readHash);
  const [detail, setDetail] = useState(false);
  const [sound, setSound] = useState(false);
  const [webgl, setWebgl] = useState(supportsWebGL);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const canvas = useRef(),
    stageArea = useRef(),
    scene = useRef(null),
    labels = useRef([]),
    dialog = useRef(),
    lastFocus = useRef(),
    audio = useRef(),
    soundRef = useRef(sound),
    selectedRef = useRef(selected);
  soundRef.current = sound;
  selectedRef.current = selected;
  const current = sections[displayed];

  function kick() {
    if (!soundRef.current) return;
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      ctx.resume();
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(130, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start();
      o.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  function navigate(index, push = true) {
    if (index < 0 || index >= sections.length) return;
    setSelected(index);
    if (push)
      history.pushState(
        null,
        "",
        `${location.pathname}${plain ? "?view=plain" : ""}#${sections[index].id}`,
      );
    if (scene.current) scene.current.request(index);
    else {
      setDisplayed(index);
      setPossession(index);
    }
  }

  function openPlain(href) {
    const id = href.split("#")[1];
    const index = sections.findIndex((s) => s.id === id);
    setDetail(false);
    setPlain(true);
    history.pushState(null, "", `${location.pathname}${href}`);
    if (index >= 0) {
      setSelected(index);
      setDisplayed(index);
      setPossession(index);
    }
  }

  function togglePlain() {
    const next = !plain;
    setDisplayed(selected);
    setPossession(selected);
    setPlain(next);
    history.pushState(
      null,
      "",
      `${location.pathname}${next ? "?view=plain" : ""}#${sections[selected].id}`,
    );
    window.scrollTo(0, 0);
  }

  // Lock the document to a single viewport while on the pitch.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("locked", !plain);
    if (plain) {
      const el = document.getElementById(sections[selectedRef.current].id);
      if (location.hash && el) el.scrollIntoView();
    }
  }, [plain]);

  // Mount the 3D scene.
  useEffect(() => {
    if (plain || !webgl) return;
    let disposed = false,
      instance = null,
      observer = null;
    const measure = () => {
      if (!instance || !stageArea.current) return;
      const r = stageArea.current.getBoundingClientRect();
      instance.resize({
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        W: window.innerWidth,
        H: window.innerHeight,
        portrait: r.width / r.height < 1.25,
      });
    };
    let intro = false;
    try {
      intro =
        !reduced && !location.hash && !sessionStorage.getItem("kickoffSeen");
      if (intro) sessionStorage.setItem("kickoffSeen", "1");
    } catch {}
    Promise.all([import("./scene"), fontsReady()]).then(([{ createPitchScene }]) => {
      if (disposed) return;
      try {
        instance = createPitchScene({
          canvas: canvas.current,
          formation: sections.map((s) => ({ x: s.pos[0], z: s.pos[1] })),
          initial: selectedRef.current,
          reduced,
          intro,
          hooks: {
            onKick: kick,
            onDisplay: (i) => setDisplayed(i),
            onPossession: (i) => setPossession(i),
          },
        });
      } catch {
        setWebgl(false);
        return;
      }
      scene.current = instance;
      instance.setLabels(labels.current);
      measure();
      instance.start();
      setReady(true);
      observer = new ResizeObserver(measure);
      observer.observe(stageArea.current);
      window.addEventListener("resize", measure);
    }, () => setWebgl(false));
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      instance?.dispose();
      scene.current = null;
      setReady(false);
    };
  }, [plain, webgl]);

  useEffect(() => {
    scene.current?.setReduced(reduced);
  }, [reduced]);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)"),
      change = (e) => setReduced(e.matches);
    mq.addEventListener("change", change);
    const pop = () => {
      setPlain(readPlain());
      navigate(readHash(), false);
    };
    window.addEventListener("popstate", pop);
    const hide = () => {
      document.body.classList.toggle("paused", document.hidden);
      if (document.hidden) scene.current?.settle();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      mq.removeEventListener("change", change);
      window.removeEventListener("popstate", pop);
      document.removeEventListener("visibilitychange", hide);
    };
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

  const header = (
    <header className="header">
      <a
        className="brand"
        href="#career"
        onClick={(e) => {
          e.preventDefault();
          if (plain) togglePlain();
          navigate(1);
        }}
      >
        HK<span>/</span>
        <small>ENGINEER</small>
      </a>
      <div className="identity">
        <strong>Harshit Kumar</strong>
        <span>Senior Software Engineer · GoDaddy</span>
      </div>
      <div className="header-actions">
        <button onClick={togglePlain}>
          {plain ? "← Back to the pitch" : "Plain view"}
          {!plain && <LinkOutIcon />}
        </button>
        <a className="talk" href="mailto:kumarharshit2309@gmail.com">
          Let’s talk <LinkOutIcon />
        </a>
      </div>
    </header>
  );

  if (plain)
    return (
      <>
        {header}
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
        <footer>
          <span>Built with intent. Played with curiosity.</span>
          <a href="https://github.com/harshitsinha23/football-portfolio">
            View the source ↗
          </a>
        </footer>
      </>
    );

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className={`stage-bg ${ready ? "ready" : ""} ${webgl ? "" : "fallback"}`}>
        <canvas ref={canvas} aria-hidden="true" />
        {!webgl && (
          <img
            src="/art/stadium.webp"
            alt=""
            width="1536"
            height="1024"
            fetchPriority="high"
          />
        )}
      </div>
      <div className="labels" aria-hidden={!ready}>
        {webgl &&
          sections.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => (labels.current[i] = el)}
              className={`player-hit ${possession === i ? "active" : ""} ${selected === i ? "target" : ""}`}
              onClick={() => navigate(i)}
              aria-label={`Explore ${s.label}`}
              tabIndex={ready ? 0 : -1}
            >
              <span className="tag">
                {s.label}
                <small>{s.preview}</small>
              </span>
            </button>
          ))}
      </div>
      <div className="app">
        {header}
        <div className="stage-area" ref={stageArea} />
        <div className="dock">
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
          <button
            className="sound"
            aria-pressed={sound}
            onClick={() => setSound(!sound)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z" />
              {sound ? (
                <path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" />
              ) : (
                <path d="M16 9l5 6M21 9l-5 6" />
              )}
            </svg>
            <span>{sound ? "Sound on" : "Sound off"}</span>
          </button>
        </div>
        <aside className="panel" id="content" aria-labelledby="panel-kicker">
          <div className="panel-top">
            <span id="panel-kicker" className="kicker">
              {current.number} — {current.label.toUpperCase()}
            </span>
            <button
              className="expand"
              onClick={() => setDetail(true)}
              aria-label={`Expand full ${current.label} details`}
              title="Expand"
            >
              <ExpandIcon />
              <span>Expand</span>
            </button>
          </div>
          <div key={displayed} className="panel-body" aria-live="polite">
            <Brief section={current} />
          </div>
          <div className="panel-foot">
            <LinkOut section={current} onInternal={openPlain} />
            <p className="hint">
              Click a player or pick a section to pass the ball
            </p>
          </div>
        </aside>
      </div>
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
        <div className="dialog-foot">
          <LinkOut section={current} onInternal={openPlain} />
          <button className="back" onClick={() => setDetail(false)}>
            Back to the pitch ↙
          </button>
        </div>
      </dialog>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
