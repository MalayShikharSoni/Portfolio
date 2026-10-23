export interface SkillGroup {
  /** What the group is used for. */
  group: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    group: 'Backend',
    items: ['Node.js', 'Express.js', 'REST APIs', 'Socket.io', 'JWT/RBAC', 'node-cron'],
  },
  {
    group: 'Frontend',
    items: ['React.js', 'Vite', 'Tailwind CSS', 'Zustand', 'Redux', 'GSAP', 'Recharts'],
  },
  { group: 'Data', items: ['PostgreSQL (Neon)', 'MongoDB', 'MySQL'] },
  { group: 'Languages', items: ['C++', 'JavaScript', 'Java'] },
  { group: 'Tools', items: ['Git/GitHub', 'Postman', 'Figma', 'Cloudinary', 'Razorpay'] },
  { group: 'Foundations', items: ['DSA', 'OOP', 'OS', 'DBMS', 'Computer Networks'] },
];
