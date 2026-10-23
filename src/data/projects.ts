/**
 * Projects ("tapes"). Featured projects get a sleeve on the home page and a case study at
 * /work/<slug>. Non-featured projects show in the "Also built" list.
 */

/** Which spot ink dominates the project's artwork. */
export type InkCombo = 'blue' | 'orange' | 'overprint';

/** services = squares, stores = circles, external providers = triangles. */
export type DiagramNodeKind = 'service' | 'store' | 'external';

export interface DiagramNode {
  id: string;
  kind: DiagramNodeKind;
  label: string;
  /** Mono caption revealed as the request dot reaches the node. */
  caption: string;
  /** Grid position (column, row) in the diagram, 0-based. */
  col: number;
  row: number;
}

export interface Diagram {
  /** e.g. "Fig. 1 · Request flow" */
  title: string;
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  /** Connections drawn as bars. `side` marks side channels / async paths. */
  edges: { from: string; to: string; side?: boolean }[];
  /** Ordered node ids the orange request dot travels through. */
  path: string[];
}

export interface Decision {
  title: string;
  context: string;
  decision: string;
  tradeoff: string;
}

export interface Screen {
  /** File name inside /public/work/<slug>/ */
  file: string;
  caption: string;
  alt: string;
  kind: 'desktop' | 'mobile';
}

export interface ProjectLinks {
  live?: string;
  github?: string;
}

export interface Project {
  slug: string;
  name: string;
  tape: number;
  featured: boolean;
  ink: InkCombo;
  oneLiner: string;
  dates: string;
  /** Short year span for the tape label, e.g. "2025–26". */
  years: string;
  stack: string[];
  links: ProjectLinks;
  /** Side A: overview paragraphs. */
  overview: string[];
  /** Key features ("tracklist"). */
  tracklist: string[];
  decisions: Decision[];
  next: string[];
  diagram?: Diagram;
  screens: Screen[];
}

export const projects: Project[] = [
  {
    slug: 'workwave',
    name: 'WorkWave',
    tape: 1,
    featured: true,
    ink: 'blue',
    oneLiner:
      'An employee management system with real-time collaboration, role-based access and gamified analytics.',
    dates: 'Nov 2025 to Mar 2026',
    years: '2025–26',
    stack: [
      'React.js',
      'Node.js',
      'Express.js',
      'PostgreSQL (Neon)',
      'JWT',
      'bcrypt',
      'Socket.io',
      'node-cron',
      'Recharts',
      'Tailwind CSS',
      'GSAP',
    ],
    links: {
      live: 'https://workwave-six.vercel.app/',
      github: 'https://github.com/MalayShikharSoni/WorkWave',
    },
    overview: [
      'WorkWave is an employee management system with real-time collaboration, role-based access and gamified analytics.',
      'Every request has to prove who it is and what it may touch: 35+ REST endpoints sit behind dual-token JWT auth and role-based access control.',
      'Collaboration is live. Notifications, task status and comment threads travel over Socket.io instead of HTTP polling, and a scheduled analytics engine turns activity into team metrics, leaderboards and GitHub repository stats.',
    ],
    tracklist: [
      '35+ REST endpoints with role-based access control (RBAC)',
      'Dual-token JWT auth: 15-minute access token, 7-day refresh token, stored in PostgreSQL',
      'Real-time notifications, live task status and comment threads over Socket.io, with no HTTP polling',
      'Automated analytics engine (node-cron and Recharts): team performance metrics, leaderboards and GitHub repository stats',
    ],
    decisions: [
      {
        title: 'Refresh-token rotation with reuse detection',
        context: 'A stolen refresh token is a long-lived session.',
        decision:
          "Every refresh issues a new refresh token. If an already-used token is presented, it's treated as theft and the whole session family is revoked.",
        tradeoff:
          'Parallel refreshes could trip it falsely, so a single-flight guard on the client prevents that.',
      },
      {
        title: 'Refresh tokens hashed at rest (SHA-256)',
        context: "A database leak shouldn't hand out live sessions.",
        decision: 'Refresh tokens are stored as SHA-256 hashes.',
        tradeoff: 'Legacy plaintext rows needed an idempotent migration, which shipped with it.',
      },
      {
        title: 'Closing IDOR holes',
        context: 'A security audit found object-level access bugs.',
        decision:
          "Ownership checks and a shared checkGroupAccess helper, with task queries scoped to the requesting user's groups.",
        tradeoff: 'Every task query carries a scope condition, in exchange for one place to audit.',
      },
      {
        title: 'Socket sessions that expire',
        context: "A revoked user shouldn't be able to keep listening.",
        decision:
          "Socket connections are disconnected when the access token's expiry timer fires. Auth endpoints are rate-limited with separate limiters.",
        tradeoff: 'Clients have to reconnect with a fresh token.',
      },
    ],
    next: [
      'Move the access token out of localStorage into an in-memory plus httpOnly-cookie flow (deliberately deferred to keep the demo stable).',
      'Add integration tests around the auth flows.',
    ],
    diagram: {
      title: 'Fig. 1 · Request flow',
      cols: 5,
      rows: 3,
      nodes: [
        { id: 'client', kind: 'service', label: 'Client', caption: 'React', col: 0, row: 1 },
        {
          id: 'api',
          kind: 'service',
          label: 'Express API',
          caption: 'REST + RBAC',
          col: 1,
          row: 1,
        },
        {
          id: 'jwt',
          kind: 'service',
          label: 'Verify JWT',
          caption: 'Access token',
          col: 2,
          row: 1,
        },
        {
          id: 'rbac',
          kind: 'service',
          label: 'RBAC check',
          caption: 'Role + group scope',
          col: 3,
          row: 1,
        },
        { id: 'db', kind: 'store', label: 'PostgreSQL', caption: 'Neon', col: 4, row: 1 },
        {
          id: 'socket',
          kind: 'service',
          label: 'Socket.io',
          caption: 'Notifications, task status',
          col: 1,
          row: 0,
        },
        {
          id: 'github',
          kind: 'external',
          label: 'GitHub API',
          caption: 'Repository stats',
          col: 2,
          row: 2,
        },
        {
          id: 'cron',
          kind: 'service',
          label: 'node-cron',
          caption: 'Scheduled job',
          col: 3,
          row: 2,
        },
        {
          id: 'analytics',
          kind: 'store',
          label: 'Analytics',
          caption: 'Tables → Recharts',
          col: 4,
          row: 2,
        },
      ],
      edges: [
        { from: 'client', to: 'api' },
        { from: 'api', to: 'jwt' },
        { from: 'jwt', to: 'rbac' },
        { from: 'rbac', to: 'db' },
        { from: 'client', to: 'socket', side: true },
        { from: 'github', to: 'cron', side: true },
        { from: 'cron', to: 'analytics', side: true },
      ],
      path: ['client', 'api', 'jwt', 'rbac', 'db'],
    },
    screens: [
      {
        file: 'screen-01.webp',
        caption: 'Landing page',
        alt: 'WorkWave landing page with the animated WorkWave wordmark and a scrolling status ticker',
        kind: 'desktop',
      },
      {
        file: 'screen-02.webp',
        caption: 'Assign a task',
        alt: 'WorkWave admin view for assigning a new task to an employee',
        kind: 'desktop',
      },
      {
        file: 'screen-03.webp',
        caption: 'Employee task overview',
        alt: 'WorkWave admin overview of each employee’s new, active, completed and failed tasks, with priority, status and overdue filters',
        kind: 'desktop',
      },
      {
        file: 'mobile-01.webp',
        caption: 'Employee dashboard',
        alt: 'WorkWave employee dashboard on a phone, showing new task cards marked overdue and by priority',
        kind: 'mobile',
      },
    ],
  },
  {
    slug: 'farmeasy',
    name: 'FarmEasy',
    tape: 2,
    featured: true,
    ink: 'orange',
    oneLiner:
      'An agricultural auction marketplace connecting farmers directly with buyers through live bidding.',
    dates: 'Nov 2025 to Jan 2026',
    years: '2025–26',
    stack: [
      'React.js',
      'Redux',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Socket.io',
      'Razorpay',
      'JWT',
      'Cloudinary',
    ],
    links: {
      live: 'https://farmeasy-10ce.onrender.com/',
      github: 'https://github.com/MalayShikharSoni/FarmEasy',
    },
    overview: [
      'FarmEasy is an agricultural auction marketplace that connects farmers directly with buyers through live bidding.',
      'Buyers bid concurrently in live auction rooms over WebSockets, and the farmer can lock the price to close bidding. Listings pass a three-stage admin moderation pipeline before they go live.',
      'The server owns every rule that matters: bids are validated before they are broadcast, and payments only change an order once a Razorpay webhook has been verified.',
    ],
    tracklist: [
      '30+ REST endpoints',
      'Concurrent live bidding over WebSockets, with bid validation and farmer-controlled price locking',
      'Three-stage admin moderation pipeline (pending → approved → rejected), with Cloudinary image handling',
      'Auction scheduling based on product expiry, and buyer profiles that differ from farmer profiles',
      'Dual-token JWT auth with email verification',
      'Event-driven, reputation-based farmer rating system',
    ],
    decisions: [
      {
        title: 'Tamper-proof payments',
        context: 'The client is never trusted to report payment success.',
        decision:
          'Razorpay webhooks are verified with HMAC-SHA256 against the raw request body before any order changes state.',
        tradeoff: 'TODO(Malay)',
      },
      {
        title: 'Bid validation on the server',
        context: 'Bids arrive concurrently from many buyers.',
        decision:
          "Every bid is checked against the current highest bid and the auction's state and lock status on the server before it's broadcast to the auction room.",
        tradeoff: 'TODO(Malay)',
      },
      {
        title: 'Price locking as a farmer control',
        context: 'The end of an auction invites a race.',
        decision: 'The farmer can lock the price to close bidding.',
        tradeoff: 'TODO(Malay)',
      },
      {
        title: 'Moderation as a state machine',
        context: 'Nothing should go live unreviewed.',
        decision: 'Listings move through explicit states: pending → approved → rejected.',
        tradeoff: 'TODO(Malay)',
      },
    ],
    next: ['Add atomic bid updates (conditional writes) and load-test concurrent bidding.'],
    diagram: {
      title: 'Fig. 1 · Bid flow',
      cols: 5,
      rows: 3,
      nodes: [
        {
          id: 'client',
          kind: 'service',
          label: 'Buyers / Farmers',
          caption: 'React + Redux',
          col: 0,
          row: 1,
        },
        {
          id: 'room',
          kind: 'service',
          label: 'Auction room',
          caption: 'Socket.io: bid',
          col: 1,
          row: 1,
        },
        {
          id: 'validate',
          kind: 'service',
          label: 'Validate',
          caption: 'Highest bid, state, lock',
          col: 2,
          row: 1,
        },
        {
          id: 'db',
          kind: 'store',
          label: 'MongoDB',
          caption: 'Auctions, bids, orders',
          col: 3,
          row: 1,
        },
        {
          id: 'broadcast',
          kind: 'service',
          label: 'Broadcast',
          caption: 'To the auction room',
          col: 4,
          row: 1,
        },
        {
          id: 'cloudinary',
          kind: 'external',
          label: 'Cloudinary',
          caption: 'Listing images',
          col: 2,
          row: 0,
        },
        {
          id: 'admin',
          kind: 'service',
          label: 'Moderation',
          caption: 'Pending → approved → rejected',
          col: 3,
          row: 0,
        },
        {
          id: 'razorpay',
          kind: 'external',
          label: 'Razorpay',
          caption: 'Checkout → webhook',
          col: 1,
          row: 2,
        },
        {
          id: 'hmac',
          kind: 'service',
          label: 'HMAC verify',
          caption: 'Raw body, SHA-256',
          col: 2,
          row: 2,
        },
        {
          id: 'order',
          kind: 'service',
          label: 'Order update',
          caption: 'Only after verify',
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: 'client', to: 'room' },
        { from: 'room', to: 'validate' },
        { from: 'validate', to: 'db' },
        { from: 'db', to: 'broadcast' },
        { from: 'cloudinary', to: 'admin', side: true },
        { from: 'admin', to: 'db', side: true },
        { from: 'razorpay', to: 'hmac', side: true },
        { from: 'hmac', to: 'order', side: true },
        { from: 'order', to: 'db', side: true },
      ],
      path: ['client', 'room', 'validate', 'db', 'broadcast'],
    },
    screens: [
      {
        file: 'screen-01.webp',
        caption: 'Marketplace',
        alt: 'FarmEasy marketplace with search and filters above live auction cards showing the current bid and end date',
        kind: 'desktop',
      },
      {
        file: 'screen-02.webp',
        caption: 'Farmer profile',
        alt: 'FarmEasy farmer profile with total auctions, active auctions, completed sales and earnings',
        kind: 'desktop',
      },
      {
        file: 'screen-03.webp',
        caption: 'My auctions',
        alt: 'FarmEasy page where a farmer manages their auction listings',
        kind: 'desktop',
      },
      {
        file: 'mobile-01.webp',
        caption: 'Landing page',
        alt: 'FarmEasy landing page on a phone: Sell your harvest at the best prices',
        kind: 'mobile',
      },
    ],
  },
  {
    slug: 'web-nexus',
    name: 'Web Nexus',
    tape: 3,
    featured: true,
    ink: 'overprint',
    oneLiner:
      'An interactive cybersecurity education platform that simulates the OWASP Top 10 in sandboxed environments.',
    dates: 'Mar 2025 to Jul 2025',
    years: '2025',
    stack: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'Tailwind CSS', 'GSAP'],
    links: {
      live: 'https://webnexus.rf.gd/',
      github: 'https://github.com/skavy359/Web-Nexus-Project',
    },
    overview: [
      'Web Nexus is an interactive cybersecurity education platform that simulates the OWASP Top 10 in sandboxed environments.',
      'Every vulnerability is taught in three modules: the vulnerability itself, how to prevent it, and a secure simulation, with syntax-highlighted code demos and attack visualizations.',
      'The platform practises what it teaches, with bcrypt password hashing, secure cookies and session-hijacking protection.',
    ],
    tracklist: [
      'Simulations of all 10 OWASP vulnerabilities (XSS, SQL injection, CSRF, SSRF, broken access control and more)',
      'Three modules per vulnerability: Vulnerability → Prevention → Secure simulation',
      'Syntax-highlighted code demos and attack visualizations',
      'Secure auth: bcrypt hashing, secure cookies, session-hijacking protection',
    ],
    decisions: [
      {
        title: 'Isolating vulnerable demos from the real app',
        context: 'TODO(Malay)',
        decision: 'TODO(Malay)',
        tradeoff: 'TODO(Malay)',
      },
      {
        title: 'Teaching by contrast: the vulnerable and fixed code side by side',
        context: 'TODO(Malay)',
        decision: 'TODO(Malay)',
        tradeoff: 'TODO(Malay)',
      },
    ],
    next: ['TODO(Malay)'],
    diagram: {
      title: 'Fig. 1 · Module flow',
      cols: 5,
      rows: 2,
      nodes: [
        {
          id: 'browser',
          kind: 'service',
          label: 'Browser',
          caption: 'JavaScript + GSAP',
          col: 0,
          row: 0,
        },
        { id: 'php', kind: 'service', label: 'PHP backend', caption: 'REST', col: 1, row: 0 },
        { id: 'db', kind: 'store', label: 'MySQL', caption: 'Data', col: 1, row: 1 },
        {
          id: 'vuln',
          kind: 'service',
          label: 'Vulnerable',
          caption: 'Sandbox 1: the exploit',
          col: 2,
          row: 0,
        },
        {
          id: 'prevent',
          kind: 'service',
          label: 'Prevention',
          caption: 'Sandbox 2: the fix',
          col: 3,
          row: 0,
        },
        {
          id: 'secure',
          kind: 'service',
          label: 'Secure',
          caption: 'Sandbox 3: secure simulation',
          col: 4,
          row: 0,
        },
      ],
      edges: [
        { from: 'browser', to: 'php' },
        { from: 'php', to: 'db', side: true },
        { from: 'php', to: 'vuln' },
        { from: 'vuln', to: 'prevent' },
        { from: 'prevent', to: 'secure' },
      ],
      path: ['browser', 'php', 'vuln', 'prevent', 'secure'],
    },
    screens: [
      {
        file: 'screen-01.webp',
        caption: 'Vulnerability catalogue',
        alt: 'Web Nexus catalogue of OWASP vulnerabilities, including server-side request forgery, cross-site scripting and cryptographic failures',
        kind: 'desktop',
      },
      {
        file: 'screen-02.webp',
        caption: 'XSS module',
        alt: 'Web Nexus cross-site scripting module introduction, with its first step: the vulnerable page',
        kind: 'desktop',
      },
      {
        file: 'screen-03.webp',
        caption: 'XSS vulnerable page',
        alt: 'Web Nexus deliberately vulnerable comment form used to demonstrate an XSS attack',
        kind: 'desktop',
      },
      {
        file: 'mobile-01.webp',
        caption: 'Landing page',
        alt: 'Web Nexus landing page on a phone: Learn and master security tools',
        kind: 'mobile',
      },
    ],
  },

  // ── Also built (featured: false): listed under the tapes, no case study ─────────────
  {
    slug: 'festflow',
    name: 'FestFlow',
    tape: 4,
    featured: false,
    ink: 'orange',
    oneLiner:
      'College-fest ticketing, check-in, volunteer scheduling and live analytics, built on MongoDB with raw PyMongo behind a Django web layer.',
    dates: '',
    years: '2026',
    stack: ['MongoDB', 'PyMongo', 'Django', 'Python', 'Docker'],
    links: { github: 'https://github.com/MalayShikharSoni/FestFlow' },
    overview: [],
    tracklist: [],
    decisions: [],
    next: [],
    screens: [],
  },
  {
    slug: 'tasknova',
    name: 'TaskNova',
    tape: 5,
    featured: false,
    ink: 'blue',
    oneLiner:
      'A task management platform on Spring Boot: a server-rendered web app plus a stateless, JWT-secured REST API, with role-based access and asynchronous audit logging.',
    dates: '',
    years: '2026',
    stack: ['Java 17', 'Spring Boot 3', 'Spring Security', 'JWT', 'Thymeleaf', 'Docker'],
    links: { github: 'https://github.com/MalayShikharSoni/TaskNova' },
    overview: [],
    tracklist: [],
    decisions: [],
    next: [],
    screens: [],
  },
  {
    slug: 'candidate-data-transformer',
    name: 'Candidate data transformer',
    tape: 6,
    featured: false,
    ink: 'overprint',
    oneLiner:
      'A deterministic pipeline that merges recruiter CSV and GitHub profile data into one canonical candidate profile, recording the source and confidence of every field.',
    dates: '',
    years: '2026',
    stack: ['TypeScript', 'Node.js', 'GitHub API'],
    links: { github: 'https://github.com/MalayShikharSoni/malay-eightfold-transformer' },
    overview: [],
    tracklist: [],
    decisions: [],
    next: [],
    screens: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
