// Header block for the plain (résumé) view.
export const profile = {
  name: "Harshit Kumar",
  role: "Senior Software Engineer (SDE-3) · GoDaddy",
  tagline: ["Architecture to production.", "Ownership all the way."],
  summary:
    "Senior Software Engineer at GoDaddy, promoted to SDE-3 in April 2026. Over five years building and operating systems across commerce, payments, recruiting, and consumer products.",
  facts: [
    ["Current role", "SDE-3 · Commerce & payments, GoDaddy"],
    ["Experience", "5+ years · GoDaddy, Scaler, PayU"],
    ["Location", "Gurugram, India"],
    ["Education", "B.Tech CSE · JIIT, 2021"],
  ],
  stats: [
    ["5+", "Years building production systems"],
    ["3+", "Engineers mentored"],
    ["850K", "Customer records recovered"],
    ["99.97%", "Availability after cache fixes"],
  ],
  skills: [
    "Backend systems",
    "Distributed systems",
    "Payments",
    "Full-stack development",
    "System design",
    "Technical leadership",
  ],
  email: "kumarharshit2309@gmail.com",
  linkedin: "https://www.linkedin.com/in/harshit-kumar-1ba95b189/",
  github: "https://github.com/harshitsinha23",
};

// Certificates: optimised copies in /public/awards, originals on Google Drive.
const AWARDS = {
  hackwithinfy: {
    id: "hackwithinfy",
    title: "HackWithInfy 2020",
    short: "HackWithInfy",
    award: "Second runner-up",
    issuer: "Infosys",
    date: "Aug 2020",
    body: "Certificate of achievement for remarkable team performance. Second runner-up among the top 25 teams, after reaching the top-100 grand finale from 170,000 participants.",
    image: "/awards/hackwithinfy-2020.webp",
    thumb: "/awards/hackwithinfy-2020-thumb.webp",
    width: 800,
    height: 566,
    focus: "50% 22%",
    href: "https://drive.google.com/file/d/1ryVJltV4qHerTIQWILPIxcaqEs0tJJ2Y/view",
  },
  needleMover: {
    id: "needle-mover",
    title: "Needle Mover Award",
    short: "Needle Mover",
    award: "Certificate of appreciation",
    issuer: "Scaler",
    body: "Awarded by Scaler’s co-founders for going above and beyond to #CreateImpact, and for collaborating with multiple stakeholders to keep delivery smooth and efficient.",
    image: "/awards/needle-mover.webp",
    thumb: "/awards/needle-mover-thumb.webp",
    width: 800,
    height: 1131,
    focus: "50% 19%",
    href: "https://drive.google.com/file/d/1zAoTe8_C1HnEVXz7u8_uhHCjRn9LejYB/view",
  },
};

const PROFILES = [
  { site: "Codeforces", handle: "harshit2309", badge: "Expert · 1730", href: "https://codeforces.com/profile/harshit2309" },
  { site: "HackerRank", handle: "kumarharshit2309", badge: "5★", href: "https://www.hackerrank.com/profile/kumarharshit2309" },
  { site: "CodeChef", handle: "harshit23", href: "https://www.codechef.com/users/harshit23" },
];

const ARTICLE = {
  title: "Unlocking a Faster Website: Practical Tips for Boosting Speed and Performance",
  href: "https://medium.com/@kumarharshit2309/unlocking-a-faster-website-practical-tips-for-boosting-speed-and-performance-579fb08699e3",
  profile: "https://medium.com/@kumarharshit2309",
  publisher: "Medium",
  date: "1 Nov 2024",
  iso: "2024-11-01",
  topic: "Web performance",
  summary:
    "A practical, example-driven guide to making websites load faster and stay responsive — from how scripts load to what gets cached, compressed, or moved off the main thread.",
  covers: [
    "Script loading with async, defer and modules",
    "Lazy loading: loading attribute, IntersectionObserver, content-visibility",
    "Resource hints: preload, preconnect and prefetch",
    "HTTP caching with Cache-Control",
    "CDN caching",
    "Critical CSS rendering",
    "Web Workers for background tasks",
    "Compression",
  ],
  chips: ["async & defer", "Lazy loading", "Caching", "Critical CSS"],
  tags: ["JavaScript", "Web development", "Optimization", "Frontend"],
};

export const sections = [
  {
    id: "education",
    label: "Education",
    preview: "JIIT · Computer Science",
    number: "01",
    pos: [-24, -15],
    eyebrow: "THE FOUNDATION",
    title: "Curiosity.\nThen craft.",
    description:
      "B.Tech in Computer Science, Jaypee Institute of Information Technology. A foundation in algorithms, systems, and solving problems under pressure.",
    brief: {
      org: "Jaypee Institute of Information Technology",
      role: "B.Tech · Computer Science · 2017–2021 · Noida",
      heading: "Highlights",
      bullets: [
        "HackWithInfy second runner-up · top 100 of 170,000",
        "Rank 2 of 900 in AlgoFuzz 19.1",
        "1,500+ programming problems solved",
      ],
      stats: [
        ["8.6", "CGPA out of 10"],
        ["1,500+", "Problems solved"],
      ],
    },
    link: { label: "Open full education page", href: "?view=plain#education" },
    details: [
      {
        title: "Jaypee Institute of Information Technology",
        meta: "B.Tech · Computer Science Engineering · 2017–2021 · Noida",
        body: "Built a foundation in data structures, operating systems, networks, and databases. Competitive programming sharpened my approach to breaking down ambiguous problems.",
        bullets: [
          "HackWithInfy — second runner-up among the top 25 teams and a top-100 grand finalist from 170,000 participants.",
          "Ranked 2 of 900 in AlgoFuzz 19.1 and 191 of 11,716 in CodeChef March Challenge 2019.",
          "Solved 1,500+ programming problems across platforms.",
        ],
      },
    ],
  },
  {
    id: "career",
    label: "Career",
    preview: "SDE-3 · GoDaddy",
    number: "02",
    pos: [-3, -2],
    eyebrow: "THE JOURNEY",
    title: "Build with depth.\nLead with ownership.",
    description:
      "Senior Software Engineer at GoDaddy. Backend systems, platform engineering, and technical leadership — from architecture to production.",
    brief: {
      org: "GoDaddy",
      role: "SDE-3 · Commerce & payments · Gurugram",
      heading: "Scope & ownership",
      summary:
        "Technical direction, API contracts, cross-team integration, rollout, and operations across commerce and payment infrastructure.",
      bullets: [
        "Architected a product-agnostic, four-API payment platform",
        "Sole engineer and tech lead for Wave-1 Stripe expansion",
        "Lead and mentor 3+ engineers on GoPay",
      ],
      stats: [
        ["5+", "Years in production"],
        ["3+", "Engineers mentored"],
      ],
      path: ["PayU", "Scaler", "GoDaddy"],
    },
    link: {
      label: "View career on LinkedIn",
      href: "https://www.linkedin.com/in/harshit-kumar-1ba95b189/",
    },
    details: [
      {
        title: "GoDaddy",
        meta: "SDE-3 · April 2026–Present · Gurugram",
        role: "SDE-3",
        period: "Apr 2026 – Present",
        place: "Gurugram",
        body: "Lead high-impact engineering initiatives across commerce and payment infrastructure. Own technical direction, API contracts, cross-team integration, production rollout, and ongoing operations.",
        bullets: [
          "Architected and built a product-agnostic payment platform around four APIs, removing websiteId and ventureId dependencies. First integration live on OLA Standalone.",
          "Lead and mentor 3+ engineers on GoPay across payments, tax, and coupon workflows.",
          "Led PCI DSS v4.x compliance engineering through script inventory, automated weekly tamper detection, alerting, CI bundle coverage, and gated re-authorization. Audit remains in progress.",
          "Sole engineer and technical lead for Wave-1 Stripe expansion. Early OLA adoption reached 66 active sellers, 813 card transactions, and $40.75K GMV.",
          "Resolved 4–5 critical production issues covering payment status and tax calculations. Ramped onto the team in 2–3 weeks and helped onboard teammates.",
        ],
      },
      {
        title: "GoDaddy",
        meta: "SDE-2 · July 2024–March 2026",
        role: "SDE-2",
        period: "Jul 2024 – Mar 2026",
        place: "Gurugram",
        body: "Delivered seller-facing capabilities while strengthening data integrity, reliability, and release quality across appointments and commerce.",
        bullets: [
          "Led coupon delivery across frontend and GoPay. Adoption reached 2,858 coupons from 1,594 sellers and 6,646 bookings using coupons.",
          "Architected customer PII migration across frontend and backend. Identified a downstream gap affecting approximately 850K records and partnered with Customer Management on backfill and preventive verification.",
          "Improved availability to approximately 99.97% through cache invalidation fixes. Added frontend monitoring for failures invisible to backend logs.",
          "Automated remediation of 70–80 vulnerabilities, hardened API and email validation, and led the Cypress recovery initiative to a 100% pass rate.",
          "Delivered onboarding and business optimizer agents with cross-functional teams, and mentored engineers across several product initiatives.",
        ],
      },
      {
        title: "Scaler",
        meta: "SDE-2 · January–June 2024 | SDE · September 2021–December 2023 · Bengaluru",
        role: "SDE → SDE-2",
        period: "Sep 2021 – Jun 2024",
        place: "Bengaluru",
        body: "Built recruiting products and improved the learning platform across React, Redux, JavaScript, and Ruby on Rails. Recipient of the Needle Mover Award.",
        bullets: [
          "Built CareersHub, attracting 7,000+ applications from 400+ learners in its first month and achieving 100% completion of user information updates.",
          "Built RecruiterBit, increasing the number of students reached for opportunities by 140% in its first month.",
          "Delivered problem-page improvements for a product serving approximately 12M monthly active users.",
          "Built a Webpack instrumentation plugin feeding build metrics into Prometheus and Grafana.",
          "Implemented compiler socket fallback polling, supporting 12.1M polling events, approximately 11% of requests at the time reported.",
        ],
      },
      {
        title: "PayU",
        meta: "Software Development Engineer Intern · April–August 2021",
        role: "SDE Intern",
        period: "Apr – Aug 2021",
        body: "Built payment products using Go and JavaScript.",
        bullets: [
          "Developed an internet-free payment application around USSD payment technology (*99#).",
          "Led Integration Hub work to simplify merchant integration through automated onboarding.",
        ],
      },
    ],
  },
  {
    id: "work",
    label: "Selected work",
    preview: "Architecture · Impact",
    number: "03",
    pos: [31, 4],
    eyebrow: "ENGINEERING IN PRACTICE",
    title: "Complex systems.\nConcrete outcomes.",
    description:
      "A selection of platform, reliability, and product work. Designed across service boundaries and carried through to production.",
    brief: {
      org: "Case studies",
      role: "Platform · Reliability · Product delivery",
      heading: "Highlights",
      bullets: [
        "Reusable payment platform decoupled from product IDs",
        "Diagnosed a downstream gap and drove recovery of ~850K records",
        "Cache-invalidation fixes lifted availability to ~99.97%",
      ],
      stats: [
        ["850K", "Records recovered"],
        ["99.97%", "Availability"],
      ],
    },
    link: { label: "Read the case studies", href: "?view=plain#work" },
    details: [
      {
        title: "A reusable payment platform",
        meta: "GoDaddy · Architecture & end-to-end delivery · 2026",
        body: "Product-specific identifiers complicated reuse across commerce products. I designed and built a four-API backend that decoupled payments from websiteId and ventureId, taking it from API contracts through the first OLA Standalone integration.",
        bullets: [
          "Ownership — sole architect and implementation owner, coordinating product integration and rollout.",
          "Result — first integration live, with an architecture designed for adoption across additional products.",
          "Related delivery — Stripe Wave-1 expansion reached 66 active OLA sellers, 813 card transactions, and $40.75K early-ramp GMV.",
        ],
      },
      {
        title: "Customer data integrity at scale",
        meta: "GoDaddy · Migration, diagnosis & cross-team recovery · 2025",
        body: "Architected customer PII migration across frontend and backend. Later identified a discrepancy in the downstream customer-management flow affecting approximately 850K customer records.",
        bullets: [
          "Partnered with the Customer Management team to drive backfill and verify recovery.",
          "Added verification logging and preventive safeguards to improve confidence in subsequent data flows.",
        ],
      },
      {
        title: "Reliability and security as platform capabilities",
        meta: "GoDaddy · Production engineering · 2025–2026",
        body: "Improved cache invalidation across business-setting and commerce events, bringing reported availability to approximately 99.97%. Expanded frontend observability and automated routine security work.",
        bullets: [
          "Resolved 70–80 existing vulnerabilities through Dependabot configuration and continuous remediation.",
          "Implemented API and email validation to mitigate malicious traffic.",
          "Led PCI compliance engineering with scheduled tamper detection, alerting, and CI safeguards. Compliance audit is in progress.",
        ],
      },
      {
        title: "Recruiting products with measurable adoption",
        meta: "Scaler · Full-stack product delivery",
        body: "Built CareersHub for student applications and RecruiterBit for recruiter workflows using React and Ruby on Rails.",
        bullets: [
          "CareersHub — 7,000+ applications from 400+ learners in the first month.",
          "RecruiterBit — 140% increase in students reached for opportunities in the first month.",
          "Also built engineering instrumentation and compiler fallback support for the broader learning ecosystem.",
        ],
      },
    ],
  },
  {
    id: "achievements",
    label: "Achievements",
    name: "Programming achievements",
    preview: "Awards · Rankings",
    number: "04",
    pos: [5, 18],
    eyebrow: "THE TROPHY CABINET",
    title: "Solve under pressure.\nEarn the podium.",
    description:
      "Hackathon podiums, contest rankings, and competitive-programming ratings, plus the Needle Mover Award from Scaler’s co-founders.",
    awards: [AWARDS.hackwithinfy, AWARDS.needleMover],
    rankings: [
      ["2nd runner-up", "HackWithInfy 2020", "Among the top 25 teams · Infosys"],
      ["Top 100", "HackWithInfy 2020 grand finale", "From 170,000 participants"],
      ["2 / 900", "AlgoFuzz 19.1", "Online round"],
      ["191 / 11,716", "CodeChef March Challenge 2019", "Division 2"],
      ["2,426 / 160,000", "TCS CodeVita Season 9"],
      ["1,500+", "Problems solved", "Across coding platforms"],
    ],
    profiles: PROFILES,
    brief: {
      org: "Programming achievements",
      role: "Hackathons · Contests · Awards",
      summary:
        "Certificates from Infosys and Scaler, alongside contest rankings and coding-platform ratings.",
      heading: "Rankings",
      bullets: [
        "HackWithInfy 2020 · top 100 of 170,000",
        "AlgoFuzz 19.1 · rank 2 of 900",
        "CodeChef March 2019 · rank 191 of 11,716",
        "TCS CodeVita S9 · rank 2,426 of 160,000",
      ],
      stats: [
        ["1730", "Codeforces · Expert"],
        ["5★", "HackerRank"],
      ],
    },
    link: { label: "View certificates & rankings", href: "?view=plain#achievements" },
    details: [
      {
        title: AWARDS.hackwithinfy.title,
        meta: "Infosys · Second runner-up · Aug 2020",
        body: AWARDS.hackwithinfy.body,
        cert: AWARDS.hackwithinfy,
        links: [["View original certificate", AWARDS.hackwithinfy.href]],
      },
      {
        title: AWARDS.needleMover.title,
        meta: "Scaler · Certificate of appreciation",
        body: AWARDS.needleMover.body,
        cert: AWARDS.needleMover,
        links: [["View original certificate", AWARDS.needleMover.href]],
      },
      {
        title: "Contest rankings",
        meta: "Competitive programming",
        bullets: [
          "HackWithInfy 2020 — second runner-up among the top 25 teams, and a top-100 grand finalist from 170,000 participants.",
          "AlgoFuzz 19.1 — ranked 2 of 900 in the online round.",
          "CodeChef March Challenge 2019 — ranked 191 of 11,716 in Division 2.",
          "TCS CodeVita Season 9 — ranked 2,426 of 160,000.",
          "Practice — 1,500+ problems solved across platforms.",
        ],
      },
      {
        title: "Coding profiles",
        meta: "Ratings & badges",
        body: "Codeforces Expert (1730) and a 5★ HackerRank badge.",
        links: PROFILES.map((p) => [p.badge ? `${p.site} · ${p.badge}` : p.site, p.href]),
      },
    ],
  },
  {
    id: "writing",
    label: "Thinking",
    preview: "Systems · Principles",
    number: "05",
    pos: [22, -20],
    eyebrow: "HOW I APPROACH THE WORK",
    title: "Make the decision.\nOwn what follows.",
    description:
      "My engineering practice connects system design, product constraints, and the realities of operating services.",
    brief: {
      org: "Engineering principles",
      role: "Architecture · Reliability · Leadership",
      heading: "Principles",
      bullets: [
        "Design for reuse — clear API contracts, no product coupling",
        "Close the operational loop — observability and recovery paths",
        "Multiply delivery through others — mentor, align, carry through",
      ],
      stats: [
        ["3", "Core principles"],
        ["E2E", "Design to operations"],
      ],
    },
    link: { label: "Read my approach", href: "?view=plain#writing" },
    details: [
      {
        title: "Design for reuse",
        meta: "Architecture",
        body: "My payment-platform work centers on removing product-specific coupling and defining clear API contracts so integrations can evolve independently.",
      },
      {
        title: "Close the operational loop",
        meta: "Reliability",
        body: "Shipping includes observability, validation, recovery paths, and responding to customer-impacting failures. My work on data recovery, cache invalidation, and production payment bugs reflects that responsibility.",
      },
      {
        title: "Multiply delivery through others",
        meta: "Technical leadership",
        body: "I mentor engineers, align with partner teams, and carry technical decisions through integration and rollout. I am particularly interested in backend engineering, distributed systems, scalable platforms, and reliability.",
      },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    preview: "Writing · Medium",
    number: "06",
    pos: [42, -14],
    eyebrow: "FROM THE NOTEBOOK",
    title: "Learn it deeply.\nWrite it down.",
    description:
      "Notes on building faster, more reliable software. Practical techniques written up from real frontend and platform work.",
    article: ARTICLE,
    brief: {
      org: ARTICLE.publisher,
      role: `Blog · ${ARTICLE.topic}`,
      article: ARTICLE,
      heading: "What it covers",
      bullets: [
        "Script loading: async, defer and modules",
        "Lazy loading and resource hints",
        "HTTP and CDN caching",
        "Critical CSS, Web Workers and compression",
      ],
    },
    link: { label: "Read the article on Medium", href: ARTICLE.href },
    details: [
      {
        title: ARTICLE.title,
        meta: `${ARTICLE.publisher} · ${ARTICLE.date} · ${ARTICLE.topic}`,
        body: ARTICLE.summary,
        bullets: ARTICLE.covers,
        links: [
          ["Read on Medium", ARTICLE.href],
          ["More on Medium", ARTICLE.profile],
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    preview: "Start a conversation",
    number: "07",
    pos: [-38, 3],
    eyebrow: "THE NEXT CHAPTER",
    title: "Good problems.\nGreat teammates.",
    description:
      "Based in Gurugram, India. Interested in challenging engineering problems and teams that value thoughtful execution.",
    brief: {
      org: "Gurugram, India",
      role: "Open to engineering conversations",
      heading: "Reach me",
      links: [
        ["Email", "kumarharshit2309@gmail.com", "mailto:kumarharshit2309@gmail.com"],
        ["LinkedIn", "harshit-kumar", "https://www.linkedin.com/in/harshit-kumar-1ba95b189/"],
        ["GitHub", "harshitsinha23", "https://github.com/harshitsinha23"],
      ],
    },
    link: { label: "Send an email", href: "mailto:kumarharshit2309@gmail.com" },
    details: [
      {
        title: "Get in touch",
        meta: "Gurugram, India",
        body: "For engineering opportunities, technical conversations, and collaborations.",
        links: [
          ["Email", "mailto:kumarharshit2309@gmail.com"],
          ["LinkedIn", "https://www.linkedin.com/in/harshit-kumar-1ba95b189/"],
          ["GitHub", "https://github.com/harshitsinha23"],
        ],
      },
    ],
  },
];
