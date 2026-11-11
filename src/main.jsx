import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { profile, sections } from "./content";
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
let kickoffPlayed = false;
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

function Details({ section, onCert }) {
  return (
    <>
      {section.details.map((d, i) => (
        <article className="detail" key={d.title + i}>
          <p className="eyebrow">{d.meta}</p>
          <h3>{d.title}</h3>
          {d.cert && (
            <button
              className="detail-cert"
              onClick={() => onCert(d.cert)}
              aria-label={`View the ${d.title} certificate full size`}
            >
              <CertImage cert={d.cert} />
            </button>
          )}
          {d.body && <p>{d.body}</p>}
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
                <ExtLink key={url} href={url}>
                  {label} ↗
                </ExtLink>
              ))}
            </div>
          )}
        </article>
      ))}
    </>
  );
}

function CertImage({ cert, full = false, focus = false }) {
  return (
    <img
      src={cert.image}
      width={cert.width}
      height={cert.height}
      alt={`${cert.title} certificate (${cert.issuer}) awarded to Harshit Kumar`}
      loading={full ? undefined : "lazy"}
      style={focus ? { objectPosition: cert.focus } : undefined}
    />
  );
}

// Full-size certificate lightbox, with a link to the original on Google Drive.
function CertViewer({ cert, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const d = ref.current;
    if (cert && !d.open) d.showModal();
    else if (!cert && d.open) d.close();
  }, [cert]);
  return (
    <dialog
      ref={ref}
      className="cert-viewer"
      aria-label={cert ? `${cert.title} certificate` : "Certificate"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {cert && (
        <>
          <div className="dialog-top">
            <span>
              {cert.issuer.toUpperCase()} / {cert.award.toUpperCase()}
            </span>
            <button onClick={onClose}>Close ✕</button>
          </div>
          <CertImage cert={cert} full />
          <div className="cert-foot">
            <div>
              <strong>{cert.title}</strong>
              <span>{[cert.issuer, cert.date].filter(Boolean).join(" · ")}</span>
            </div>
            <ExtLink className="btn primary" href={cert.href}>
              View original <LinkOutIcon />
            </ExtLink>
          </div>
        </>
      )}
    </dialog>
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

function Brief({ section, onCert }) {
  const b = section.brief;
  const a = b.article;
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
      {section.awards ? (
        <ul className="awards" aria-label="Certificates">
          {section.awards.map((c) => (
            <li key={c.id}>
              <button onClick={() => onCert(c)} aria-label={`View the ${c.title} certificate`}>
                <span className="award-thumb">
                  <img src={c.thumb} width="432" height="240" alt="" />
                  <ExpandIcon />
                </span>
                <span className="award-text">
                  <strong>{c.short}</strong>
                  <small>{c.award}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : a ? (
        <ExtLink className="feature" href={a.href}>
          <small>
            {a.publisher} · <time dateTime={a.iso}>{a.date}</time>
          </small>
          <strong>{a.title}</strong>
          <p>{a.summary}</p>
          <span className="chips">
            {a.chips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </span>
        </ExtLink>
      ) : (
        <p className="summary">{b.summary ?? section.description}</p>
      )}
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

const pad2 = (i) => String(i + 1).padStart(2, "0");
// "Ownership — sole architect…" -> ["Ownership", "sole architect…"]
const splitLead = (text) => {
  const m = text.match(/^(.{2,40}?) — (.+)$/);
  return m ? [m[1], m[2]] : [null, text];
};

function ExtLink({ href, className, children }) {
  const ext = isExternal(href);
  return (
    <a
      className={className}
      href={href}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function Ticks({ items }) {
  return (
    <ul className="ticks">
      {items.map((b) => {
        const [lead, rest] = splitLead(b);
        return (
          <li key={b}>
            {lead && <b>{lead} — </b>}
            {rest}
          </li>
        );
      })}
    </ul>
  );
}

// Section-specific layouts for the plain view.
function PlainBody({ section: s, onCert }) {
  switch (s.id) {
    case "career":
      return (
        <ol className="timeline">
          {s.details.map((d) => (
            <li key={d.meta}>
              <div className="when">
                <strong>{d.period}</strong>
                {d.place && <span>{d.place}</span>}
              </div>
              <div className="what">
                <h3>
                  {d.title} <span className="role-chip">{d.role}</span>
                </h3>
                <p className="when-inline">
                  {[d.period, d.place].filter(Boolean).join(" · ")}
                </p>
                <p>{d.body}</p>
                {d.bullets && <Ticks items={d.bullets} />}
              </div>
            </li>
          ))}
        </ol>
      );
    case "education": {
      const d = s.details[0];
      return (
        <div className="edu">
          <article className="card">
            <p className="meta">{d.meta}</p>
            <h3>{d.title}</h3>
            <p>{d.body}</p>
            <Ticks items={d.bullets} />
          </article>
          <div className="stat-stack">
            {s.brief.stats.map(([v, l]) => (
              <div className="stat" key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "work":
      return (
        <div className="cases">
          {s.details.map((d, i) => (
            <article className="card case" key={d.title}>
              <span className="case-num" aria-hidden="true">
                {pad2(i)}
              </span>
              <div>
                <p className="meta">{d.meta}</p>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
                {d.bullets && <Ticks items={d.bullets} />}
              </div>
            </article>
          ))}
        </div>
      );
    case "achievements":
      return (
        <div className="trophies">
          <h3 className="sub-head">Certificates</h3>
          <div className="certs">
            {s.awards.map((c) => (
              <figure className="card cert" key={c.id}>
                <button
                  className="cert-frame"
                  onClick={() => onCert(c)}
                  aria-label={`View the ${c.title} certificate full size`}
                >
                  <CertImage cert={c} focus />
                  <span className="cert-zoom">
                    <ExpandIcon /> View full size
                  </span>
                </button>
                <figcaption>
                  <p className="meta">
                    {[c.issuer, c.award, c.date].filter(Boolean).join(" · ")}
                  </p>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                  <ExtLink className="cert-link" href={c.href}>
                    View original certificate <LinkOutIcon />
                  </ExtLink>
                </figcaption>
              </figure>
            ))}
          </div>
          <h3 className="sub-head">Contest rankings</h3>
          <ol className="ranks">
            {s.rankings.map(([value, event, note]) => (
              <li key={event + value}>
                <strong>{value}</strong>
                <span>
                  {event}
                  {note && <small>{note}</small>}
                </span>
              </li>
            ))}
          </ol>
          <h3 className="sub-head">Coding profiles</h3>
          <div className="reach-cards profiles">
            {s.profiles.map((p) => (
              <ExtLink key={p.href} href={p.href}>
                <small>{p.site}</small>
                <span>{p.badge ?? "Profile"}</span>
                <em>@{p.handle}</em>
                <LinkOutIcon />
              </ExtLink>
            ))}
          </div>
        </div>
      );
    case "blog": {
      const a = s.article;
      return (
        <article className="card post">
          <p className="meta">
            {a.publisher} · <time dateTime={a.iso}>{a.date}</time> · {a.topic}
          </p>
          <h3>
            <ExtLink href={a.href}>{a.title}</ExtLink>
          </h3>
          <p>{a.summary}</p>
          <p className="post-label">In this article</p>
          <ul className="ticks post-covers">
            {a.covers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <ul className="tags">
            {a.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="post-actions">
            <ExtLink className="btn primary" href={a.href}>
              Read on Medium <LinkOutIcon />
            </ExtLink>
            <ExtLink className="btn" href={a.profile}>
              More on Medium <LinkOutIcon />
            </ExtLink>
          </div>
        </article>
      );
    }
    case "writing":
      return (
        <ol className="grid-3">
          {s.details.map((d, i) => (
            <li className="card principle" key={d.title}>
              <span className="principle-num" aria-hidden="true">
                {pad2(i)}
              </span>
              <p className="meta">{d.meta}</p>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </li>
          ))}
        </ol>
      );
    case "contact":
      return (
        <div className="reach-cards">
          {s.brief.links.map(([label, text, href]) => (
            <ExtLink key={href} href={href}>
              <small>{label}</small>
              <span>{text}</span>
              <LinkOutIcon />
            </ExtLink>
          ))}
        </div>
      );
    default:
      return <Details section={s} onCert={onCert} />;
  }
}

function PlainView() {
  const [active, setActive] = useState(sections[0].id);
  const [cert, setCert] = useState(null);
  const toc = useRef();

  // Highlight the section crossing the upper third of the viewport.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id));
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.3;
      let id = sections[0].id;
      for (const el of els) if (el && el.getBoundingClientRect().top <= line) id = el.id;
      const doc = document.documentElement;
      if (innerHeight + scrollY >= doc.scrollHeight - 4) id = sections.at(-1).id;
      setActive(id);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // On mobile the index is a horizontal strip: keep the active chip in view.
  useEffect(() => {
    const ol = toc.current;
    const a = ol?.querySelector("[aria-current]");
    if (!a || ol.scrollWidth <= ol.clientWidth) return;
    ol.scrollTo({ left: a.offsetLeft - ol.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="plain-wrap">
      <aside className="plain-side">
        <nav aria-label="Résumé sections">
          <p className="toc-title">On this page</p>
          <ol className="toc" ref={toc}>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
                  <small>{s.number}</small>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="side-actions">
          <button className="btn" onClick={() => window.print()}>
            Print / save PDF
          </button>
          <a className="btn" href={`mailto:${profile.email}`}>
            Email me <LinkOutIcon />
          </a>
        </div>
      </aside>
      <main className="plain" id="content">
        <section className="hero" aria-labelledby="plain-title">
          <p className="eyebrow">HARSHIT KUMAR / ENGINEERING PORTFOLIO</p>
          <h1 id="plain-title">
            {profile.tagline[0]}
            <br />
            <em>{profile.tagline[1]}</em>
          </h1>
          <p className="intro-copy">{profile.summary}</p>
          <dl className="facts">
            {profile.facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="hero-stats">
            {profile.stats.map(([v, l]) => (
              <div className="stat" key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <ul className="skill-list" aria-label="Focus areas">
            {profile.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="btn primary" href={`mailto:${profile.email}`}>
              Email me <LinkOutIcon />
            </a>
            <ExtLink className="btn" href={profile.linkedin}>
              LinkedIn <LinkOutIcon />
            </ExtLink>
            <ExtLink className="btn" href={profile.github}>
              GitHub <LinkOutIcon />
            </ExtLink>
            <button className="btn" onClick={() => window.print()}>
              Print / save PDF
            </button>
          </div>
        </section>
        {sections.map((s) => (
          <section className="plain-section" id={s.id} key={s.id} aria-labelledby={`${s.id}-h`}>
            <header className="sec-head">
              <p className="sec-kicker">
                {s.number}
                <span>{s.eyebrow}</span>
              </p>
              <h2 id={`${s.id}-h`}>{s.name ?? s.label}</h2>
              <p className="sec-lead">{s.title.replace("\n", " ")}</p>
              <p className="sec-desc">{s.description}</p>
            </header>
            <PlainBody section={s} onCert={setCert} />
            {isExternal(s.link.href) && !s.article && (
              <ExtLink className="sec-link" href={s.link.href}>
                {s.link.label} <LinkOutIcon />
              </ExtLink>
            )}
          </section>
        ))}
      </main>
      <CertViewer cert={cert} onClose={() => setCert(null)} />
    </div>
  );
}

function App() {
  const [plain, setPlain] = useState(readPlain);
  const [selected, setSelected] = useState(readHash);
  const [displayed, setDisplayed] = useState(readHash);
  const [possession, setPossession] = useState(readHash);
  const [detail, setDetail] = useState(false);
  const [cert, setCert] = useState(null);
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
    selectedRef = useRef(selected);
  selectedRef.current = selected;
  const current = sections[displayed];

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
    if (plain && location.hash) {
      const jump = () =>
        document
          .getElementById(sections[selectedRef.current].id)
          ?.scrollIntoView({ behavior: "instant" });
      jump();
      // Web fonts can reflow the page after the first jump; re-align once they land.
      fontsReady().then(jump);
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
    // Kickoff plays on every page load (deep links and reloads included), not when returning from Plain view.
    const intro = !reduced && !kickoffPlayed;
    kickoffPlayed = true;
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
        <a className="skip" href="#content">
          Skip to content
        </a>
        {header}
        <PlainView />
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
          <div key={displayed} className="panel-body" data-id={current.id} aria-live="polite">
            <Brief section={current} onCert={setCert} />
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
        <Details section={current} onCert={setCert} />
        <div className="dialog-foot">
          <LinkOut section={current} onInternal={openPlain} />
          <button className="back" onClick={() => setDetail(false)}>
            Back to the pitch ↙
          </button>
        </div>
      </dialog>
      <CertViewer cert={cert} onClose={() => setCert(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
