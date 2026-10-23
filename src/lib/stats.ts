/**
 * Live stats, fetched once at build time.
 *
 * The build must never fail because of this: every request has a timeout, every error is
 * caught, and anything missing falls back to the static values in src/data/site.ts.
 * A weekly GitHub Action redeploys the site so these stay fresh (see DEPLOY.md).
 */
import { site } from '@/data/site';

export interface Stats {
  leetcodeSolved: number;
  leetcodeTopPercent: number;
  githubRepos: number | null;
  /** True when at least one value came from a live request. */
  live: boolean;
  /** When the numbers were gathered (the build time). */
  updated: Date;
}

const TIMEOUT_MS = 6000;

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** The username is the last path segment of the profile link; placeholders are skipped. */
function leetcodeUser(): string | null {
  if (!site.liveLeetCode) return null;
  const user = site.links.leetcode.split('/').filter(Boolean).pop() ?? '';
  return user && !user.includes('TODO') ? user : null;
}

interface LeetCodeResponse {
  data?: {
    matchedUser?: {
      submitStats?: { acSubmissionNum?: { difficulty: string; count: number }[] };
    } | null;
    userContestRanking?: { topPercentage?: number | null } | null;
  };
}

async function leetcode(user: string) {
  const query = `query stats($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    userContestRanking(username: $username) { topPercentage }
  }`;
  const json = await fetchJson<LeetCodeResponse>('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables: { username: user } }),
  });
  const solved = json?.data?.matchedUser?.submitStats?.acSubmissionNum?.find(
    (row) => row.difficulty === 'All',
  )?.count;
  const top = json?.data?.userContestRanking?.topPercentage;
  return {
    solved: typeof solved === 'number' && solved > 0 ? solved : null,
    top: typeof top === 'number' && top > 0 ? top : null,
  };
}

async function githubRepos(user: string): Promise<number | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'malay-portfolio-build',
  };
  const token = import.meta.env.GITHUB_TOKEN as string | undefined;
  if (token) headers.Authorization = `Bearer ${token}`;
  const json = await fetchJson<{ public_repos?: number }>(
    `https://api.github.com/users/${encodeURIComponent(user)}`,
    { headers },
  );
  return typeof json?.public_repos === 'number' ? json.public_repos : null;
}

let cached: Promise<Stats> | null = null;

/** Fetches once per build; every caller shares the same result. */
export function getStats(): Promise<Stats> {
  cached ??= (async () => {
    const user = leetcodeUser();
    const [lc, repos] = await Promise.all([
      user ? leetcode(user) : Promise.resolve({ solved: null, top: null }),
      githubRepos(site.githubUser),
    ]);
    return {
      // never claim more precision than we have: 612 solved reads as "610+"
      leetcodeSolved: lc.solved ? Math.floor(lc.solved / 10) * 10 : site.stats.leetcodeSolved,
      leetcodeTopPercent: lc.top ? Math.max(1, Math.ceil(lc.top)) : site.stats.leetcodeTopPercent,
      githubRepos: repos,
      live: Boolean(lc.solved || lc.top || repos !== null),
      updated: new Date(),
    };
  })();
  return cached;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}
