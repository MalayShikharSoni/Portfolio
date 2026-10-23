export type TimelineKind = 'education' | 'certificate' | 'training' | 'milestone';

export interface TimelineEntry {
  /** Display date, e.g. "Sep 2026" or "Aug 2023 to present". */
  date: string;
  title: string;
  issuer?: string;
  detail?: string;
  kind: TimelineKind;
  /** Optional credential link. Hidden when empty. */
  credentialUrl?: string;
}

/** Newest first. */
export const timeline: TimelineEntry[] = [
  {
    date: 'Sep 2026',
    title: 'Oracle AI Database Certified Foundations Associate',
    issuer: 'Oracle',
    kind: 'certificate',
    credentialUrl: '',
  },
  {
    date: 'Jun 2026',
    title: 'LeetCode milestone',
    detail: '600+ problems solved, top 10 percentile contest rating.',
    kind: 'milestone',
  },
  {
    date: 'Sep 2025',
    title: 'Master MongoDB: NoSQL Database Management',
    issuer: 'Udemy',
    kind: 'certificate',
    credentialUrl: 'https://www.udemy.com/certificate/UC-af793a02-c64e-4231-91e0-b3bf9aa23a57/',
  },
  {
    date: 'Jun to Jul 2025',
    title: 'Backend Development training',
    issuer: 'Techvanto Academy',
    detail:
      'Built modular REST APIs with Node.js and Express, React with Zustand state, and Socket.io real-time features.',
    kind: 'training',
  },
  {
    date: 'Apr 2025',
    title: 'Deep Learning',
    issuer: 'NPTEL',
    kind: 'certificate',
    credentialUrl:
      'https://archive.nptel.ac.in/content/noc/NOC25/SEM1/Ecertificates/106/noc25-ee16/Course/NPTEL25EE16S64750099304510967.pdf',
  },
  {
    date: 'Jan 2025',
    title: 'Elite certificate, top 5% of candidates',
    issuer: 'NPTEL (IIT Kharagpur)',
    detail: 'Final score 80%.',
    kind: 'certificate',
    credentialUrl: '',
  },
  {
    date: 'Sep 2024',
    title: 'The Bits and Bytes of Computer Networking',
    issuer: 'Coursera',
    kind: 'certificate',
    credentialUrl: 'https://coursera.org/share/cad0416dd76f6cc1faf82a0fd9c15fc6',
  },
  {
    date: 'Aug 2023 to present',
    title: 'B.Tech CSE',
    issuer: 'Lovely Professional University',
    detail: 'CGPA 9.01.',
    kind: 'education',
  },
];
