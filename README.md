# Football Portfolio

Harshit Kumar’s interactive engineering portfolio. React + Vite with a real-time three.js stadium: floodlit stands, a striped pitch, animated players, and ball passes between sections.

## Run locally

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## How it works

- **One screen, no scrolling.** The header, 3D pitch, section dock, and details panel always fit the first fold, from 360px phones to wide desktops (including landscape phones).
- **Pass the ball.** Click a player or a section in the dock. The current holder turns and kicks, the ball arcs to the receiver with a gold trail, and the panel switches mid-flight. Scrolling does not trigger passes.
- **Details panel.** Shows a content brief for each section: role, summary, highlights, stats, and links. Use **Expand** (top) for the full details or the **link-out** (bottom) for LinkedIn, GitHub, email, or the matching Plain view section.
- **Plain view** (`?view=plain`) is the full printable résumé with normal scrolling.
- Deep links (`#career`, `#work`, …) and back/forward work. Sound is optional and off by default. Reduced-motion preferences are respected. A short kickoff intro plays on the first visit. Without WebGL the page falls back to the static stadium image.

## Where things live

| Path | What |
| --- | --- |
| `src/content.js` | Section copy, panel brief, link-out, and player positions (`pos`, in pitch metres) |
| `src/main.jsx` | App shell, navigation and history, panel, dialog, plain view |
| `src/style.css` | Fixed-viewport layout and breakpoints |
| `src/scene/index.js` | Renderer, camera auto-fit, pass state machine, label projection |
| `src/scene/stadium.js` | Stands, crowd, LED boards, floodlights, goals, near wall and plaza |
| `src/scene/players.js` | Procedural player rigs and poses (idle, run, kick, receive) |
| `src/scene/textures.js` | Canvas-generated textures (pitch, crowd, LED, numbers, nets) |
| `public/art/stadium.webp` | Static fallback when WebGL is unavailable |

three.js is code-split, so the shell and panel render before the scene chunk loads.

Content uses the supplied résumé and work notes, with the April 2026 promotion taking precedence over the older résumé. Thinking presents engineering principles based on this work. Project demos await verified URLs.

[Implementation blueprint](docs/IMPLEMENTATION.md)

![Original stadium concept](docs/assets/stadium-concept.png)
