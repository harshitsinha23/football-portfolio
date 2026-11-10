# Football portfolio implementation blueprint

## Experience and visual direction

Build a generic engineering portfolio with an illustrated night stadium, animated players, and a readable experience panel. The actual title remains Senior Software Engineer. Demonstrate staff-level scope through architectural judgment, cross-team influence, delivery, and measurable results.

![Approved stadium direction](assets/stadium-concept.png)

The reference is an AI-generated composition. It includes sample career copy and metrics that need validation before publication. Its extra unlabeled player and painted labels are illustrative. The implementation uses exactly six interactive players.

## Background-first approach

Use a high-quality painted stadium as the base and overlay React components. This provides rich visual detail with a manageable implementation cost. The current full screenshot is the design reference. Production requires a clean stadium plate with the UI, players, labels, ball, selection rings, and pass trail removed. Otherwise baked elements would duplicate the interactive components.

Create the clean plate at approximately 2400 × 1600 with an unobstructed field. Preserve the illustrated perspective, grass, stands, static lighting, and buildings. Export AVIF and WebP variants with a fallback. Make separate transparent sprites for players and optional foreground railings. Keep all text in HTML. Create a separate mobile composition only if the original cannot retain readable player spacing.

| Asset | Requirements | Purpose |
| --- | --- | --- |
| stadium-base | 3:2 source, desktop and smaller responsive exports | Grass, stands, buildings, static shadows |
| player atlas | Transparent, consistent foot anchor, idle/call/kick/receive frames, left/right orientation | Six reusable player instances |
| ball | Transparent texture or small SVG | Rotation and altitude illusion |
| foreground | Optional transparent railing at same dimensions as base | Occlusion and depth |
| sound | Optional licensed short kick and receive samples | Enabled only after explicit sound toggle |

Generate or commission original artwork. Record source and usage rights with assets. Treat source PNG as design documentation, and optimized clean artwork as runtime assets.

## Proposed stack and files

Use React, TypeScript, Vite, CSS Modules, SVG for the trajectory, and a single requestAnimationFrame controller for ball movement. Keep animation dependencies optional until the first pass is evaluated. Portfolio data lives in typed objects or Markdown and is independent of scene positions.

Suggested folders are src/components, src/scene, src/content, src/styles, public/art, and public/audio. Put the state machine in src/scene/usePassController.ts, geometry in src/scene/passGeometry.ts, and player coordinates in src/scene/formation.ts. Add prerendering for public content pages before release so search engines and link previews can read the portfolio.

## Component responsibilities and CSS

| Component | Responsibility and interaction | CSS and rendering |
| --- | --- | --- |
| PortfolioShell | Own selected section and shared navigation | Dark page, desktop grid, minimum 100svh, overflow-x clip |
| SiteHeader | Name, true title, résumé, contact, skip link | Readable HTML, flex wrap, high z-index, 64–80px desktop height |
| StadiumViewport | Reserve image dimensions and clip the moving world | position relative, isolation isolate, aspect-ratio 3/2, overflow hidden |
| StadiumWorld | Shared coordinate space for background and all scene objects | position absolute, inset 0, transform-origin center; camera transform applied here only |
| StadiumBackground | Responsive picture element | width and height 100%, display block, exact shared aspect ratio |
| AtmosphereLayer | Very subtle glow and optional light pulses | pointer-events none, low opacity; static when reduced motion enabled |
| PlayerButton | Accessible section target and foot position | Absolute percentage coordinates, translate(-50%,-100%), minimum 44px target |
| PlayerSprite | Call, kick, receive, idle visual | Sprite atlas with steps() frames; independent inner wrapper for rotation/scale |
| PlayerLabel | Readable section title and active state | Dark pill, 12–14px minimum, high contrast, focus-visible outline |
| SelectionRing | Identify current possession | Ellipse anchored at foot, amber border and restrained shadow |
| BallLayer | Ball, shadow, short trail | Absolute overlay with pointer-events none; transform updates each frame |
| PassTrail | Show a short fading segment of flight | SVG using the same viewBox as the world, stroke with rounded caps |
| ContentPanel | Render selected section immediately and preserve readability | Solid navy fallback, subtle border, 24–36px padding, 60–70ch text measure |
| CareerSection | Role timeline, scope, achievements, case-study links | Semantic headings and ordered list; dates remain text |
| EducationSection | Degree, institution, dates, relevant work | Compact readable rows, no fabricated fields |
| SelectedWorkSection | Three substantial case-study previews | Problem, ownership, outcome, descriptive links |
| SideProjectsSection | Independent builds and demos | Thumbnail, concise description, real links |
| WritingSection | Articles, talks, system design explainers | Title, topic, date, and destination |
| ContactSection | Verified email, LinkedIn, GitHub, résumé | Real anchors and buttons with accessible names |
| CaseStudyPage | Full problem, constraints, options, decision, rollout, results | Dedicated URL, reading layout, back link restores section |
| SectionNavigation | Direct access, previous/next pass | Semantic nav, aria-current, wraps or horizontally scrolls on mobile |
| SoundToggle | Persist explicit audio preference | Visible text label, aria-pressed, minimum 44px target |

## CSS foundation

```css
:root {
  --page: #080f22;
  --panel: #101a30;
  --text: #f5f7fc;
  --muted: #bbc5d8;
  --accent: #ffc653;
  --border: #425674;
}
.portfolio {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(360px, 1fr);
  gap: clamp(16px, 2vw, 32px);
  color: var(--text);
  background: var(--page);
}
.stage {
  position: sticky;
  top: 88px;
  align-self: start;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  isolation: isolate;
}
.world { position: absolute; inset: 0; }
.player {
  position: absolute;
  left: calc(var(--x) * 1%);
  top: calc(var(--y) * 1%);
  transform: translate(-50%, -100%);
  min-width: 44px;
  min-height: 44px;
}
.panel {
  min-width: 0;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: clamp(24px, 3vw, 36px);
  line-height: 1.6;
}
button:focus-visible, a:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}
@media (max-width: 900px) {
  .portfolio { grid-template-columns: minmax(0, 1fr); }
  .stage { position: relative; top: auto; }
  .panel { border-radius: 16px; }
}
```

These are starting values to refine against the artwork. Keep content panels outside camera transforms. Use separate wrappers for player positioning and sprite motion so animations cannot overwrite the positioning transform. Apply will-change only while objects animate. Use 16px or larger body text and restrained heading sizes.

## Coordinate alignment and layering

Choose one canonical world size, such as 2400 × 1600. Store foot positions as normalized coordinates from 0 to 1, calibrated against the final clean artwork. HTML, SVG viewBox, ball path, shadows, and foreground share that coordinate system.

Maintain the complete image aspect ratio inside the stage. A separate cover background would crop differently and misalign players. If cropping becomes necessary, compute one shared scale and translation for every world layer. Use ResizeObserver to update the world-to-screen scale. Store the pass in world units so resizing mid-flight preserves its trajectory.

Layer order starts with background, light overlays, ground shadows, players and ball, foreground occluders, then labels. Sort grounded objects by foot y where overlap is possible. Ball elevation affects visual height, while depth ordering uses its ground position. The content panel and header live above the scene in their own stacking context.

## Passing animation

Use idle → windup → flight → receive → idle. Initial possession is Career. Education remains directly accessible. Suggested sequence is Education, Career, Selected Work, Side Projects, Writing, Contact.

A short pass takes roughly 650ms, and a long diagonal roughly 1100ms including windup and first touch. Tune timing by watching the actual prototype. Use an ease-out on reception, with one small settle movement. Each player turns toward the target and uses the appropriate sprite frames.

For normalized time t, define ground position with a quadratic Bézier curve between the source foot and target foot. A slightly offset midpoint creates lateral curl. Let height h(t) = 4 × H × t × (1 − t). Render the ball at (groundX, groundY − h), and the shadow at (groundX, groundY). Increase shadow blur and lower its opacity with height. Apply subtle scale increase and ball rotation to suggest depth. Keep the bright trail short and fade it within about 150ms.

Camera motion should be limited to approximately 12px pan and 1.02 scale during a long pass, returning smoothly to rest. The same parent transform moves all world layers. Disable camera motion for reduced motion and narrow screens.

## State, scroll, and repeated input

Keep selectedSection, possessionSection, targetSection, phase, and latestPendingTarget explicit. A selection updates readable content immediately, while the ball completes the visual transition. The ring changes possession on reception. Announce the new section once through a polite live region.

Clicking the current target is a no-op. During flight, remember only the latest requested destination, finish reception, then pass onward. This avoids teleportation and unbounded queues. A new click supersedes passive scroll requests. Cancel animation frames and listeners on unmount. On tab visibility loss, settle at the requested section and clear pending animation.

Use normal document scrolling with content sections as scroll targets and the stadium sticky on desktop. IntersectionObserver selects the section nearest the reading position with hysteresis to avoid toggling at boundaries. Clicking a player scrolls to its section and temporarily suppresses observer-driven changes until the target settles or the user interrupts. This keeps long career content readable without consuming every wheel event as a pass command.

Support direct hashes such as #career, browser back/forward, and refresh. Initialize the ball at a deep-linked section. Keyboard activation uses the same navigation action. Arrow shortcuts may operate only inside focused scene navigation, never globally.

## Content and professional credibility

Career shows actual roles, dates, scope, and attributable achievements. Education shows verified institution and degree information. Selected Work spans backend, frontend, platform, and product delivery. Each case study explains context, constraints, personal contribution, alternatives, technical decisions, collaboration, rollout, results, and lessons.

Use the sample modernization metrics only after confirming the baseline, services, and measurement period. Gather education details, dates, public contact links, and résumé before launch. Public copy should use approved project descriptions and exclude internal credentials, private endpoints, and sensitive company details.

## Mobile, accessibility, and resilience

At narrow widths, show the pitch above content and provide persistent compact section navigation. Avoid a large sticky stadium that consumes the entire phone viewport. Player labels may shorten to Work and Projects while accessible names remain complete. Check the smallest target spacing at 360px.

With prefers-reduced-motion, change possession instantly and remove trails, camera movement, and idle loops. Keyboard users can navigate every player and ordinary content link. Keep focus on the selected navigation button during section changes. Dedicated case-study routes set focus to their heading on navigation. Maintain contrast and avoid flashing lighting.

If artwork fails, retain text navigation and all content. If JavaScript fails, prerendered content and links remain useful. Pause decorative loops when offscreen. Audio defaults off and begins only after a user gesture.

## Performance targets and verification

Aim for a desktop stadium transfer below 700KB and a mobile variant below 300KB, subject to visual checks. Preload only the initial stadium, provide intrinsic dimensions, lazy-load secondary media, and subset fonts. Target LCP under 2.5 seconds and CLS below 0.1 on a representative mobile test. Measure animation frame time on a mid-range phone.

Verify click and scroll navigation, all directions of passing, rapid destination changes, resize during flight, deep links, history, keyboard operation, reduced motion, and image failure. Test scroll interruption so reading cannot trigger repeated unwanted passes. Inspect at 360, 390, 768, 1280, and 1440px. Check every label and foot anchor against the final artwork.

## Implementation order

1. Prepare clean stadium, player sprites, and verified content inputs.
2. Build responsive semantic content, header, section links, and static scene alignment.
3. Prototype one diagonal pass with shadow, sprite kick, first touch, and restrained camera motion.
4. Connect all six destinations through one state machine and scroll synchronization.
5. Add complete case studies, route restoration, mobile layout, and accessibility behavior.
6. Optimize assets and run the interaction and performance checks above.

Completion requires both a satisfying pass and readable, complete engineering evidence. This repository currently contains the concept and blueprint. Runtime artwork and the website will be created during implementation.
