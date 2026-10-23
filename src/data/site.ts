/**
 * Site-wide content. Edit this file to change copy without touching components.
 */
export interface SiteLinks {
  github: string;
  linkedin: string;
  leetcode: string;
}

export interface Site {
  name: string;
  shortName: string;
  role: string;
  /** Hero positioning: a short headline and one supporting sentence. */
  tagline: {
    lead: string;
    body: string;
    /** Words in `body` that get the riso highlighter. */
    marks: string[];
  };
  description: string;
  email: string;
  links: SiteLinks;
  domain: string;
  status: string;
  resume: string;
  /** Mono meta line under the hero name. */
  heroMeta: string[];
  /** Footer location line. */
  location: string;
  bio: string[];
  currently: { label: string; value: string }[];
  /**
   * Numbers strip. LeetCode values are refreshed at build time when possible
   * (src/lib/stats.ts); these are the fallbacks and the static facts.
   */
  stats: {
    cgpa: number;
    leetcodeSolved: number;
    leetcodeTopPercent: number;
    nptelTopPercent: number;
    workwaveEndpoints: number;
  };
  /** GitHub username for the build-time public repo count. */
  githubUser: string;
  /** Refresh the LeetCode figures from LeetCode at build time. Off: the static stats are used. */
  liveLeetCode: boolean;
}

export const site: Site = {
  name: 'Malay Shikhar Soni',
  shortName: 'Malay',
  role: 'Backend-leaning full-stack engineer',
  tagline: {
    lead: 'Backend first, full-stack fluent.',
    body: 'I build the auth, real-time and data layers under a product, and make sure they hold when real users show up.',
    marks: ['auth', 'real-time', 'data'],
  },
  description:
    'Malay Shikhar Soni, backend-leaning full-stack engineer. Auth, real-time and data systems that hold up under real users.',
  email: 'malayshikhar2004@gmail.com',
  links: {
    github: 'https://github.com/MalayShikharSoni',
    linkedin: 'https://www.linkedin.com/in/malay-shikhar-soni',
    leetcode: 'https://leetcode.com/u/malay_shikhar_soni/',
  },
  domain: 'https://malayshikharsoni.dev',
  status: 'Open to SDE roles · Class of 2027', // TODO(Malay): confirm (full-time / internship / both)
  resume: '/resume.pdf', // placeholder PDF until Malay provides the real one
  heroMeta: ['B.Tech CSE · LPU · Class of 2027', 'Open to SDE roles', 'Based in India (IST)'],
  location: 'Printed in Jalandhar, Punjab', // TODO(Malay): confirm the location line
  // (draft) TODO(Malay): revise
  bio: [
    "I'm a final-year Computer Science student at Lovely Professional University who gravitates to the back of the stack: auth flows, real-time sync, permission models, and the code that decides who is allowed to do what. I like building systems that stay correct when real users, real money, or real attackers show up.",
    "Outside of projects I've solved 600+ problems on LeetCode, because I enjoy the discipline of making something fast <em>and</em> right. I'm looking for an SDE role where I can own backend systems end to end.",
  ],
  // TODO(Malay): fill in
  currently: [
    { label: 'Learning', value: 'TODO' },
    { label: 'Reading', value: 'TODO' },
    { label: 'Building', value: 'this site' },
  ],
  stats: {
    cgpa: 9.01,
    leetcodeSolved: 600,
    leetcodeTopPercent: 10,
    nptelTopPercent: 5,
    workwaveEndpoints: 35,
  },
  githubUser: 'MalayShikharSoni',
  liveLeetCode: false,
};
