# Football Portfolio

Harshit Kumar’s interactive engineering portfolio. React + Vite, an original stadium background, SVG players, and animated ball passes.

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

Click a player or use the pitch navigation. Scroll on the pitch to advance one pass per gesture. Open a section for detailed experience, or choose Plain view for the full printable résumé. Sound is optional. Reduced-motion preferences are respected.

Edit copy in `src/content.js`, interaction logic in `src/main.jsx`, and styling in `src/style.css`. Generated runtime artwork lives in `public/art/stadium.webp`.

Content uses the supplied résumé and work notes, with the April 2026 promotion taking precedence over the older résumé. Thinking presents engineering principles based on this work. Project demos await verified URLs.

[Implementation blueprint](docs/IMPLEMENTATION.md)

![Original stadium concept](docs/assets/stadium-concept.png)

This first implementation uses JavaScript/JSX, SVG players, and in-page detail dialogs. Dedicated case-study routes, prerendering, and more detailed player sprites remain refinements to the broader blueprint.
