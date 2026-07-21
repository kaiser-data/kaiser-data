#!/usr/bin/env node
// Generates a static "GitHub stats + grade" SVG card, fully on GitHub Actions.
// Fetches public + private stats via the GitHub GraphQL API using a PAT, computes
// the standard github-readme-stats letter grade, and renders a neon-green SVG.
//
// Env:
//   STATS_TOKEN  Personal Access Token with `repo` scope (reads private stats).
//   USERNAME     GitHub login to report on.
// Args:
//   --out <path> Output SVG path (default: assets/stats-card.svg)
//
// No dependencies — uses Node 20+ global fetch.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TOKEN = process.env.STATS_TOKEN;
// NB: do NOT read process.env.USERNAME — on macOS it is the OS login name.
const argOf = (flag, def) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : def;
const USERNAME = argOf("--user", process.env.GH_USER || "kaiser-data");
const OUT = argOf("--out", "assets/stats-card.svg");

if (!TOKEN) {
  console.error("Missing STATS_TOKEN env var.");
  process.exit(1);
}

const QUERY = `
query($login:String!){
  user(login:$login){
    name login
    followers{totalCount}
    contributionsCollection{
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestReviewContributions
    }
    pullRequests{totalCount}
    mergedPRs:pullRequests(states:MERGED){totalCount}
    issues{totalCount}
    repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,REPOSITORY,PULL_REQUEST_REVIEW]){totalCount}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,orderBy:{field:STARGAZERS,direction:DESC}){
      totalCount
      nodes{stargazerCount}
    }
  }
}`;

// ---- exact github-readme-stats rank formula (src/calculateRank.js) ----
const exp_cdf = (x) => 1 - 2 ** -x;
const log_normal_cdf = (x) => x / (1 + x);

function calculateRank({ commits, prs, issues, reviews, stars, followers }) {
  const COMMITS_MEDIAN = 250, COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50, PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25, ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2, REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50, STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10, FOLLOWERS_WEIGHT = 1;
  const TOTAL_WEIGHT =
    COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT + STARS_WEIGHT + FOLLOWERS_WEIGHT;
  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
  const rank =
    1 -
    (COMMITS_WEIGHT * exp_cdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exp_cdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exp_cdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exp_cdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT;
  const percentile = rank * 100;
  const level = LEVELS[THRESHOLDS.findIndex((t) => percentile <= t)];
  return { level, percentile };
}

const fmt = (n) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "kaiser-data-stats-card",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const u = json.data.user;

  const cc = u.contributionsCollection;
  const commitsPublic = cc.totalCommitContributions;
  const commitsPrivate = cc.restrictedContributionsCount;
  const commitsTotal = commitsPublic + commitsPrivate;
  const reviews = cc.totalPullRequestReviewContributions;
  const prsTotal = u.pullRequests.totalCount;
  const prsMerged = u.mergedPRs.totalCount;
  const issues = u.issues.totalCount;
  const contributedTo = u.repositoriesContributedTo.totalCount;
  const followers = u.followers.totalCount;
  const repos = u.repositories.totalCount;
  const stars = u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);

  const { level, percentile } = calculateRank({
    commits: commitsTotal,
    prs: prsTotal,
    issues,
    reviews,
    stars,
    followers,
  });

  const svg = renderCard({
    name: u.name || USERNAME,
    level,
    percentile,
    stats: [
      { icon: "star", label: "Total Stars Earned", value: fmt(stars) },
      { icon: "commit", label: "Commits (incl. private)", value: fmt(commitsTotal) },
      { icon: "pr", label: "Pull Requests", value: `${fmt(prsTotal)}  ·  ${fmt(prsMerged)} merged` },
      { icon: "review", label: "Contributed to (repos)", value: fmt(contributedTo) },
      { icon: "people", label: "Followers", value: fmt(followers) },
      { icon: "repo", label: "Public Repositories", value: fmt(repos) },
    ],
  });

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  console.log(
    `Wrote ${OUT}  grade=${level} (top ${percentile.toFixed(0)}%)  ` +
      `stars=${stars} commits=${commitsTotal} prs=${prsTotal}/${prsMerged} followers=${followers} repos=${repos}`,
  );
}

// ---- SVG rendering ----
const ICONS = {
  star: '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>',
  commit: '<path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>',
  pr: '<path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/>',
  review: '<path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v9.5A1.75 1.75 0 0 1 14.25 14H8.061l-2.574 2.573A1.458 1.458 0 0 1 3 15.543V14H1.75A1.75 1.75 0 0 1 0 12.25v-9.5C0 1.784.784 1 1.75 1ZM11.28 6.28a.75.75 0 0 0-1.06-1.06L7.25 8.19l-.97-.97a.75.75 0 1 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0Z"/>',
  people: '<path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z"/>',
  repo: '<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.707A2.5 2.5 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>',
};

function renderCard({ name, level, percentile, stats }) {
  const W = 500, H = 210, ACCENT = "#00ff88", TEXT = "#c9d1d9", MUTED = "#8b949e", BG = "#0d1117";
  const rowH = 22, x0 = 28, y0 = 80, VX = 340;

  const rows = stats
    .map((s, i) => {
      const y = y0 + i * rowH;
      const delay = 0.3 + i * 0.12;
      return `
      <g transform="translate(${x0}, ${y})" class="row" style="animation-delay:${delay}s">
        <svg x="0" y="-12" width="16" height="16" viewBox="0 0 16 16" fill="${ACCENT}">${ICONS[s.icon]}</svg>
        <text x="26" y="0" class="lbl">${esc(s.label)}</text>
        <text x="${VX - x0}" y="0" class="val">${esc(s.value)}</text>
      </g>`;
    })
    .join("");

  // Rank ring — fuller ring = better rank (lower percentile).
  const r = 44, cx = W - 68, cy = 130;
  const circ = 2 * Math.PI * r;
  const fill = (100 - percentile) / 100; // portion of ring filled
  const offset = circ * (1 - fill);

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)} GitHub stats, grade ${level}">
  <style>
    text { font-family: 'Segoe UI', Ubuntu, system-ui, sans-serif; }
    .title { font: 700 20px 'Segoe UI', system-ui, sans-serif; fill: ${ACCENT}; }
    .lbl { font-size: 14px; fill: ${TEXT}; }
    .val { font-size: 14px; font-weight: 700; fill: ${ACCENT}; text-anchor: end; }
    .grade { font: 800 34px 'Segoe UI', system-ui, sans-serif; fill: ${ACCENT}; text-anchor: middle; }
    .gradeSub { font-size: 12px; fill: ${MUTED}; text-anchor: middle; }
    .row { animation: fadein 0.6s ease backwards; }
    .ring { stroke-dasharray: ${circ.toFixed(1)}; stroke-dashoffset: ${offset.toFixed(1)}; animation: draw 1.3s ease-out backwards 0.3s; }
    @keyframes fadein { from { opacity: 0; transform: translateX(-6px); } }
    @keyframes draw { from { stroke-dashoffset: ${circ.toFixed(1)}; } }
  </style>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${BG}" stroke="${ACCENT}" stroke-opacity="0.35"/>
  <rect x="1" y="1" width="${W - 2}" height="4" rx="2" fill="${ACCENT}" fill-opacity="0.9"/>

  <text x="${x0}" y="46" class="title">${esc(name)} · GitHub</text>
  <line x1="${x0}" y1="58" x2="${W - 40}" y2="58" stroke="${ACCENT}" stroke-opacity="0.15"/>

  ${rows}

  <g transform="translate(${cx}, ${cy})">
    <circle r="${r}" fill="none" stroke="${ACCENT}" stroke-opacity="0.13" stroke-width="7"/>
    <circle class="ring" r="${r}" fill="none" stroke="${ACCENT}" stroke-width="7"
            stroke-linecap="round" transform="rotate(-90)"/>
    <text y="4" class="grade">${esc(level)}</text>
    <text y="24" class="gradeSub">Top ${Math.max(1, Math.round(percentile))}%</text>
  </g>
</svg>`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
