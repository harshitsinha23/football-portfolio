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
    id: "projects",
    label: "Side projects",
    preview: "Experiments · Frontend",
    number: "04",
    pos: [5, 18],
    eyebrow: "OUTSIDE THE TOUCHLINE",
    title: "Stay curious.\nKeep shipping.",
    description:
      "Independent projects exploring live data, search, state management, and clear interfaces.",
    brief: {
      org: "Independent builds",
      role: "React · Context API · Public APIs",
      heading: "Projects",
      bullets: [
        "CryptoTracker — INR and USD prices with 30-day trends",
        "The Cocktail DB — searchable catalogue with detail views",
      ],
      stats: [
        ["2", "Shipped experiments"],
        ["React", "Primary stack"],
      ],
    },
    link: { label: "Browse code on GitHub", href: "https://github.com/harshitsinha23" },
    details: [
      {
        title: "CryptoTracker",
        meta: "React · Context API · HTML & CSS",
        body: "A cryptocurrency tracker displaying prices in INR and USD and 30-day price trends. Used Context API for application state.",
      },
      {
        title: "The Cocktail DB",
        meta: "React · Search & detail experiences",
        body: "A searchable cocktail catalogue with a dedicated detail view for each result. An exploration of API-driven interfaces and component composition.",
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
    id: "contact",
    label: "Contact",
    preview: "Start a conversation",
    number: "06",
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
